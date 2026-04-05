from __future__ import annotations

import asyncio
import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Header, HTTPException, Request, status, Query
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.evolution import evolution_client, normalize_remote_jid, to_number_field, lifespan_evolution
from app.followup import iniciar_worker_followup
from app.motor import processar_conversa
from app.state import is_duplicate_event, listar_leads, buscar_lead, get_redis
from app.webhook import extract_message_payload

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")

FALLBACK_MSG = "Desculpe, tive um problema técnico agora. Pode repetir sua mensagem em instantes? 🙏"


# ── Lifespan: sobe httpx + worker de follow-up ────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with lifespan_evolution():
        # Inicia o worker de follow-up em background
        worker = asyncio.create_task(iniciar_worker_followup())
        logger.info("Aplicação iniciada.")
        try:
            yield
        finally:
            worker.cancel()
            try:
                await worker
            except asyncio.CancelledError:
                pass
            logger.info("Worker de follow-up encerrado.")
    logger.info("Aplicação encerrada.")


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Webhook Evolution ─────────────────────────────────────────────────────────

@app.post("/webhooks/evolution", status_code=status.HTTP_202_ACCEPTED)
async def evolution_webhook(
    request: Request,
    x_webhook_secret: str | None = Header(default=None),
) -> dict:
    if x_webhook_secret != settings.evolution_webhook_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid webhook secret")

    payload = await request.json()
    msg = extract_message_payload(payload)
    if not msg:
        return {"ok": True, "ignored": True}

    if msg["from_me"]:
        return {"ok": True, "ignored": True, "reason": "from_me"}

    if not msg["text"]:
        return {"ok": True, "ignored": True, "reason": "unsupported_message"}

    remote_jid = normalize_remote_jid(msg["remote_jid"], msg["sender_pn"])
    if not remote_jid:
        return {"ok": True, "ignored": True, "reason": "missing_remote_jid"}

    dedupe_key = f"{remote_jid}:{msg['message_id']}"
    if is_duplicate_event(dedupe_key):
        return {"ok": True, "ignored": True, "reason": "duplicate"}

    # Quando o lead responde, reseta o contador de follow-ups
    _resetar_followup(remote_jid)

    resposta_texto = FALLBACK_MSG
    estagio = "erro"
    try:
        result = await processar_conversa(usuario_id=remote_jid, mensagem_cliente=msg["text"])
        resposta_texto = result["mensagem"]
        estagio = result["estagio_funil"]
    except Exception as exc:
        logger.exception("Erro ao processar conversa para %s: %s", remote_jid, exc)

    try:
        await evolution_client.send_text(
            number=to_number_field(remote_jid),
            text=resposta_texto,
            quoted_message_id=msg["message_id"],
        )
    except Exception as exc:
        logger.exception("Falha ao enviar mensagem para %s: %s", remote_jid, exc)
        return {"ok": False, "error": "send_failed"}

    return {"ok": True, "sent": True, "stage": estagio}


def _resetar_followup(usuario_id: str) -> None:
    """Reseta o contador de follow-ups quando o lead volta a responder."""
    try:
        from app.followup import _followup_key
        get_redis().delete(_followup_key(usuario_id))
    except Exception:
        pass


# ── API do Dashboard ──────────────────────────────────────────────────────────

@app.get("/api/leads")
async def get_leads(limit: int = Query(default=100, le=500)) -> dict:
    leads = listar_leads(limit=limit)
    total = len(leads)
    quentes = sum(1 for l in leads if l.get("momento_de_compra"))
    score_medio = round(sum(l.get("lead_score", 0) for l in leads) / total, 1) if total else 0

    return {
        "leads": leads,
        "meta": {
            "total": total,
            "quentes": quentes,
            "score_medio": score_medio,
            "gerado_em": time.time(),
        },
    }


@app.get("/api/leads/{usuario_id:path}")
async def get_lead(usuario_id: str) -> dict:
    lead = buscar_lead(usuario_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead não encontrado")
    return lead


@app.get("/api/metricas")
async def get_metricas() -> dict:
    leads = listar_leads(limit=1000)
    total = len(leads)

    por_estagio: dict[str, int] = {}
    por_perfil: dict[str, int] = {}
    por_plano: dict[str, int] = {}
    scores = []
    momentos = 0

    for l in leads:
        estagio = l.get("estagio", "inicio")
        por_estagio[estagio] = por_estagio.get(estagio, 0) + 1

        perfil = l.get("perfil_detectado") or "DESCONHECIDO"
        por_perfil[perfil] = por_perfil.get(perfil, 0) + 1

        plano = (l.get("dados") or {}).get("plano_interesse") or "nenhum"
        por_plano[plano] = por_plano.get(plano, 0) + 1

        scores.append(l.get("lead_score", 0))

        if l.get("momento_de_compra"):
            momentos += 1

    return {
        "total_leads": total,
        "por_estagio": por_estagio,
        "por_perfil": por_perfil,
        "por_plano": por_plano,
        "score_medio": round(sum(scores) / total, 1) if total else 0,
        "leads_quentes": momentos,
    }


# ── Follow-up (dashboard) ─────────────────────────────────────────────────────

@app.get("/api/followups")
async def get_followups() -> dict:
    """Lista leads com follow-ups pendentes e seus contadores."""
    from app.followup import _followup_key, ESTAGIOS_ATIVOS
    leads = listar_leads(limit=1000)
    r = get_redis()
    resultado = []

    for lead in leads:
        uid = lead.get("usuario_id")
        if not uid:
            continue
        if lead.get("estagio") not in ESTAGIOS_ATIVOS:
            continue
        fup_raw = r.get(_followup_key(uid))
        fup_count = int(fup_raw) if fup_raw else 0
        if fup_count > 0:
            resultado.append({
                "usuario_id": uid,
                "numero": lead.get("numero"),
                "estagio": lead.get("estagio"),
                "followups_enviados": fup_count,
                "atualizado_em": lead.get("atualizado_em"),
            })

    return {"followups_pendentes": resultado, "total": len(resultado)}


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health() -> dict:
    redis_ok = False
    try:
        get_redis().ping()
        redis_ok = True
    except Exception:
        pass

    evo_ok = False
    try:
        await evolution_client.health()
        evo_ok = True
    except Exception:
        pass

    return {
        "ok": redis_ok and evo_ok,
        "app": settings.app_name,
        "redis": redis_ok,
        "evolution": evo_ok,
    }


@app.get("/")
async def root() -> dict:
    return {"ok": True, "service": settings.app_name}

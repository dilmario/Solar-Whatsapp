"""
followup.py — Worker de follow-up automático.

Roda em loop contínuo numa asyncio.Task, iniciada pelo lifespan do FastAPI.
Varre os leads no Redis a cada INTERVALO_VARREDURA segundos, verifica inatividade
e dispara mensagens personalizadas via Evolution API.

Sequência de disparo por lead:
  #1 → após JANELA_2H  de silêncio (estágios: descoberta, qualificacao, simulacao)
  #2 → após JANELA_24H de silêncio (estágios: proposta, agendamento, simulacao)
  #3 → após JANELA_3D  de silêncio (qualquer estágio ativo)
  Após 3 tentativas sem resposta → lead marcado como "perdido"

Reset automático: quando o lead volta a responder, o contador zera
(chamado em main.py via _resetar_followup).
"""
from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Optional

from app.config import settings
from app.evolution import evolution_client, to_number_field
from app.state import listar_leads, get_redis, _lead_key

logger = logging.getLogger(__name__)

ESTAGIOS_ATIVOS = {"inicio", "descoberta", "qualificacao", "simulacao", "proposta", "agendamento"}


def _followup_key(usuario_id: str) -> str:
    return f"followup:{usuario_id}"


# ── Mensagens personalizadas ──────────────────────────────────────────────────

def _mensagem_2h(lead: dict) -> Optional[str]:
    estagio = lead.get("estagio", "inicio")
    nome = (lead.get("dados") or {}).get("nome")
    saudacao = f"{nome.split()[0]}," if nome else "ei,"

    if estagio in ("descoberta", "qualificacao"):
        return (
            f"Oi {saudacao} fiquei pensando no que você me contou sobre os leads que chegam fora do horário. "
            "Quanto você acha que perde por mês com isso? 🤔"
        )
    if estagio == "simulacao":
        volume = (lead.get("dados") or {}).get("volume_leads")
        trecho = f"com {volume} leads/mês" if volume else "no volume de vocês"
        return (
            f"Oi {saudacao} fiquei calculando aqui {trecho}… "
            "faz sentido a gente avançar pra ver como ficaria na prática?"
        )
    return None


def _mensagem_24h(lead: dict) -> Optional[str]:
    estagio = lead.get("estagio", "inicio")
    nome = (lead.get("dados") or {}).get("nome")
    saudacao = f"{nome.split()[0]}," if nome else "ei,"

    if estagio in ("proposta", "agendamento", "simulacao"):
        return (
            f"Oi {saudacao} conseguiu dar uma olhada no que te mostrei? "
            "Qualquer dúvida sobre os planos é só falar, estou por aqui 👍"
        )
    return None


def _mensagem_3d(lead: dict) -> Optional[str]:
    nome = (lead.get("dados") or {}).get("nome")
    saudacao = f"{nome.split()[0]}," if nome else "ei,"
    return (
        f"Oi {saudacao} se ainda fizer sentido automatizar o atendimento de vocês, "
        "posso retomar de onde paramos — ou te mandar o link pro teste grátis direto. "
        "Sem compromisso 😊"
    )


# ── Helpers Redis ─────────────────────────────────────────────────────────────

def _marcar_perdido(usuario_id: str) -> None:
    try:
        r = get_redis()
        raw = r.get(_lead_key(usuario_id))
        if not raw:
            return
        dados = json.loads(raw)
        dados["estagio"] = "perdido"
        dados["atualizado_em"] = time.time()
        ttl = r.ttl(_lead_key(usuario_id))
        r.setex(_lead_key(usuario_id), max(ttl, 1), json.dumps(dados, ensure_ascii=False))
        logger.info("Lead %s marcado como perdido após %d follow-ups.", usuario_id, settings.followup_max_tentativas)
    except Exception as exc:
        logger.exception("Erro ao marcar lead %s como perdido: %s", usuario_id, exc)


# ── Processamento ─────────────────────────────────────────────────────────────

async def processar_followups() -> None:
    try:
        leads = listar_leads(limit=1000)
    except Exception as exc:
        logger.exception("Erro ao listar leads: %s", exc)
        return

    agora = time.time()
    enviados = 0

    for lead in leads:
        usuario_id = lead.get("usuario_id")
        if not usuario_id:
            continue

        estagio = lead.get("estagio", "inicio")
        if estagio not in ESTAGIOS_ATIVOS:
            continue

        inatividade = agora - lead.get("atualizado_em", agora)
        r = get_redis()
        fup_raw = r.get(_followup_key(usuario_id))
        fup_count = int(fup_raw) if fup_raw else 0

        if fup_count >= settings.followup_max_tentativas:
            _marcar_perdido(usuario_id)
            continue

        mensagem: Optional[str] = None

        if fup_count == 0 and inatividade >= settings.followup_janela_2h:
            mensagem = _mensagem_2h(lead)
        elif fup_count == 1 and inatividade >= settings.followup_janela_24h:
            mensagem = _mensagem_24h(lead)
        elif fup_count == 2 and inatividade >= settings.followup_janela_3d:
            mensagem = _mensagem_3d(lead)

        if not mensagem:
            continue

        try:
            await evolution_client.send_text(number=to_number_field(usuario_id), text=mensagem)
            r.set(_followup_key(usuario_id), fup_count + 1, ex=7 * 24 * 60 * 60)
            logger.info(
                "Follow-up #%d → %s (estágio: %s, inatividade: %.1fh)",
                fup_count + 1, usuario_id, estagio, inatividade / 3600,
            )
            enviados += 1
        except Exception as exc:
            logger.exception("Falha ao enviar follow-up para %s: %s", usuario_id, exc)

    if enviados:
        logger.info("Follow-up: %d mensagem(ns) enviada(s).", enviados)


# ── Loop principal ────────────────────────────────────────────────────────────

async def iniciar_worker_followup() -> None:
    logger.info(
        "Worker de follow-up iniciado (varredura a cada %ds).",
        settings.followup_intervalo_segundos,
    )
    while True:
        await processar_followups()
        await asyncio.sleep(settings.followup_intervalo_segundos)

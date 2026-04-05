"""
state.py — Persistência de estado e leads via Redis.

Conversas expiram em 24h de inatividade.
Leads ficam disponíveis no dashboard por 30 dias.
"""
from __future__ import annotations

import json
import time
from typing import Any, Dict, Optional

import redis

from app.config import settings

_redis: Optional[redis.Redis] = None


def get_redis() -> redis.Redis:
    global _redis
    if _redis is None:
        _redis = redis.from_url(settings.redis_url, decode_responses=True)
    return _redis


def _conversa_key(usuario_id: str) -> str:
    return f"conversa:{usuario_id}"


def _lead_key(usuario_id: str) -> str:
    return f"lead:{usuario_id}"


def _leads_index_key() -> str:
    return "leads:index"


def inicializar_estado() -> Dict[str, Any]:
    return {
        "dados": {
            "nome": None,
            "email": None,
            "volume_leads": None,
            "tamanho_equipe": None,
            "dor_principal": None,
            "plano_interesse": None,
        },
        "historico": [],
        "lead_score": 0,
        "estagio": "inicio",
        "perfil_detectado": None,
        "momento_de_compra": False,
        "proxima_intencao": "coletar_nome",
        "precisa_calculo_financeiro": False,
        "criado_em": time.time(),
        "atualizado_em": time.time(),
    }


def carregar_estado(usuario_id: str) -> Dict[str, Any]:
    r = get_redis()
    raw = r.get(_conversa_key(usuario_id))
    if raw:
        return json.loads(raw)
    return inicializar_estado()


def salvar_estado(usuario_id: str, estado: Dict[str, Any]) -> None:
    estado["atualizado_em"] = time.time()
    r = get_redis()
    r.setex(
        _conversa_key(usuario_id),
        settings.redis_conversa_ttl,
        json.dumps(estado, ensure_ascii=False),
    )


def mesclar_dados(dados_atuais: Dict[str, Any], novos_dados: Dict[str, Any]) -> Dict[str, Any]:
    resultado = dados_atuais.copy()
    for chave, valor in novos_dados.items():
        if valor is None:
            continue
        valor_atual = resultado.get(chave)
        if valor_atual in (None, "", []):
            resultado[chave] = valor
            continue
        if valor_atual != valor:
            resultado[chave] = valor
    return resultado


def salvar_lead(usuario_id: str, estado: Dict[str, Any], output: Dict[str, Any]) -> None:
    r = get_redis()

    lead = {
        "usuario_id": usuario_id,
        "numero": usuario_id.split("@")[0],
        "dados": estado["dados"],
        "lead_score": output.get("lead_score", 0),
        "estagio": output.get("estagio_funil", "inicio"),
        "perfil_detectado": output.get("perfil_detectado"),
        "momento_de_compra": output.get("momento_de_compra", False),
        "atualizado_em": time.time(),
    }

    r.sadd(_leads_index_key(), usuario_id)
    r.setex(
        _lead_key(usuario_id),
        settings.redis_lead_ttl,
        json.dumps(lead, ensure_ascii=False),
    )


def listar_leads(limit: int = 100) -> list[Dict[str, Any]]:
    r = get_redis()
    usuario_ids = r.smembers(_leads_index_key())

    leads = []
    for uid in usuario_ids:
        raw = r.get(_lead_key(uid))
        if raw:
            leads.append(json.loads(raw))
        else:
            r.srem(_leads_index_key(), uid)

    leads.sort(key=lambda x: x.get("atualizado_em", 0), reverse=True)
    return leads[:limit]


def buscar_lead(usuario_id: str) -> Optional[Dict[str, Any]]:
    r = get_redis()
    raw = r.get(_lead_key(usuario_id))
    return json.loads(raw) if raw else None


def is_duplicate_event(dedupe_key: str, ttl: int = 300) -> bool:
    r = get_redis()
    key = f"dedupe:{dedupe_key}"
    result = r.set(key, "1", ex=ttl, nx=True)
    return result is None

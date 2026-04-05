from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Any, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# ── Cliente HTTP compartilhado (gerenciado pelo lifespan do FastAPI) ──────────

_http_client: Optional[httpx.AsyncClient] = None


def get_http_client() -> httpx.AsyncClient:
    if _http_client is None:
        raise RuntimeError("HTTP client não inicializado — lifespan não executado.")
    return _http_client


@asynccontextmanager
async def lifespan_evolution():
    """Inicializa e encerra o httpx.AsyncClient junto com o app FastAPI."""
    global _http_client
    _http_client = httpx.AsyncClient(timeout=settings.request_timeout_seconds)
    logger.info("EvolutionClient: httpx.AsyncClient criado.")
    try:
        yield
    finally:
        await _http_client.aclose()
        _http_client = None
        logger.info("EvolutionClient: httpx.AsyncClient encerrado.")


# ── Helpers de JID ────────────────────────────────────────────────────────────

def normalize_remote_jid(remote_jid: Optional[str], sender_phone: Optional[str] = None) -> Optional[str]:
    if not remote_jid:
        return None
    if remote_jid.endswith("@s.whatsapp.net"):
        return remote_jid
    if remote_jid.endswith("@lid") and sender_phone:
        digits = "".join(ch for ch in sender_phone if ch.isdigit())
        if digits:
            return f"{digits}@s.whatsapp.net"
    return remote_jid


def to_number_field(remote_jid: str) -> str:
    return remote_jid


# ── Cliente Evolution ─────────────────────────────────────────────────────────

class EvolutionClient:
    def __init__(self) -> None:
        self.base_url = settings.evolution_base_url.rstrip("/")
        self.instance = settings.evolution_instance
        self.headers = {
            "apikey": settings.evolution_api_key,
            "Content-Type": "application/json",
        }

    async def send_text(self, number: str, text: str, quoted_message_id: Optional[str] = None) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "number": number,
            "text": text,
            "delay": settings.send_typing_delay_ms,
            "linkPreview": False,
        }
        if quoted_message_id:
            payload["quoted"] = {"key": {"id": quoted_message_id}, "message": {"conversation": ""}}

        response = await get_http_client().post(
            f"{self.base_url}/message/sendText/{self.instance}",
            headers=self.headers,
            json=payload,
        )
        response.raise_for_status()
        return response.json()

    async def health(self) -> dict[str, Any]:
        response = await get_http_client().get(
            f"{self.base_url}/",
            headers={"apikey": settings.evolution_api_key},
        )
        response.raise_for_status()
        return response.json()


evolution_client = EvolutionClient()

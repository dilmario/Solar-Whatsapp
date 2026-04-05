from __future__ import annotations

import asyncio
import json

from google import genai
from google.genai import types

from app.config import settings
from app.schemas import RespostaVendedor
from app.prompt import SYSTEM_PROMPT

client = genai.Client(api_key=settings.google_api_key)


def _chamar_modelo_sync(contexto: str) -> RespostaVendedor:
    """Chamada síncrona ao Gemini — executada em thread separada para não bloquear o event loop."""
    resposta = client.models.generate_content(
        model=settings.model_name,
        contents=contexto,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=settings.temperature,
            response_mime_type="application/json",
            response_schema=RespostaVendedor,
        ),
    )
    payload = json.loads(resposta.text)
    return RespostaVendedor.model_validate(payload)


async def chamar_modelo(contexto: str) -> RespostaVendedor:
    """Wrapper async: roda o SDK síncrono do Gemini em thread pool, liberando o event loop."""
    return await asyncio.to_thread(_chamar_modelo_sync, contexto)

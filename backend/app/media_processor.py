"""
media_processor.py — Processamento de imagens (contas de luz, documentos).

Analisa imagens usando Gemini Vision para extrair informações relevantes.
"""
from __future__ import annotations

import base64
import logging
from typing import Any, Optional

import httpx

from app.config import settings
from app.llm import get_genai_client

logger = logging.getLogger(__name__)


async def download_media(url: str, timeout: int = 30) -> Optional[bytes]:
    """Baixa mídia da URL fornecida pela Evolution API."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=timeout)
            response.raise_for_status()
            return response.content
    except Exception as exc:
        logger.exception("Erro ao baixar mídia: %s", exc)
        return None


def encode_image_base64(image_bytes: bytes) -> str:
    """Converte bytes da imagem para base64."""
    return base64.b64encode(image_bytes).decode("utf-8")


async def analyze_image_with_gemini(image_bytes: bytes, context: str = "") -> dict[str, Any]:
    """
    Analisa uma imagem usando Google Gemini Vision.
    Útil para extrair dados de contas de luz, documentos, etc.
    """
    try:
        client = get_genai_client()

        prompt = f"""Analise esta imagem cuidadosamente.

{context if context else "É uma conta de luz ou documento relacionado a energia solar."}

Responda em JSON com:
- tipo_documento: "conta_luz", "rg", "cpf", "outro" ou "desconhecido"
- texto_detectado: resumo do texto principal encontrado
- valores_numericos: lista de números relevantes (consumo kWh, valor da fatura, etc.)
- contem_conta_luz: true/false
- consumo_kwh: valor se for conta de luz
- valor_fatura: valor em R$ se identificável
- confianca: 0-100 (quão confiante você está da análise)
- observacoes: qualquer informação adicional relevante

Formato JSON válido apenas:"""

        image_b64 = encode_image_base64(image_bytes)

        contents = [
            {
                "role": "user",
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": image_b64
                        }
                    }
                ]
            }
        ]

        # Usar modelo multimodal
        response = client.models.generate_content(
            model=settings.model_name,
            contents=contents
        )

        # Tentar extrair JSON da resposta
        text_response = response.text

        # Limpar possíveis markdown
        if "```json" in text_response:
            text_response = text_response.split("```json")[1].split("```")[0]
        elif "```" in text_response:
            text_response = text_response.split("```")[1].split("```")[0]

        import json
        result = json.loads(text_response.strip())

        logger.info("Imagem analisada com sucesso: %s", result.get("tipo_documento"))
        return result

    except Exception as exc:
        logger.exception("Erro ao analisar imagem com Gemini: %s", exc)
        return {
            "tipo_documento": "desconhecido",
            "texto_detectado": "",
            "valores_numericos": [],
            "contem_conta_luz": False,
            "consumo_kwh": None,
            "valor_fatura": None,
            "confianca": 0,
            "observacoes": f"Erro na análise: {str(exc)}"
        }


async def process_media_message(media_data: dict[str, Any], conversation_context: str = "") -> dict[str, Any]:
    """
    Processa mensagem de mídia completa.
    Retorna dados extraídos ou erro.
    """
    if not media_data or not media_data.get("url"):
        return {"sucesso": False, "erro": "Sem URL de mídia", "dados": {}}

    mimetype = media_data.get("mimetype", "")

    # Verificar se é imagem processável
    if not mimetype.startswith("image/"):
        return {
            "sucesso": False,
            "erro": "Tipo de arquivo não suportado para análise",
            "dados": {"mimetype": mimetype}
        }

    # Baixar imagem
    image_bytes = await download_media(media_data["url"])

    if not image_bytes:
        return {"sucesso": False, "erro": "Não foi possível baixar a imagem", "dados": {}}

    # Analisar com Gemini
    analysis = await analyze_image_with_gemini(image_bytes, conversation_context)

    # Extrair dados úteis para o contexto
    dados_extraidos = {
        "contem_conta_luz": analysis.get("contem_conta_luz", False),
        "consumo_kwh": analysis.get("consumo_kwh"),
        "valor_fatura": analysis.get("valor_fatura"),
        "texto_detectado": analysis.get("texto_detectado", "")[:200],  # limitar
    }

    return {
        "sucesso": analysis.get("confianca", 0) > 50,
        "erro": None if analysis.get("confianca", 0) > 50 else "Baixa confiança na análise",
        "dados": dados_extraidos,
        "analise_completa": analysis
    }


async def notify_human_review(
    media_url: str,
    media_type: str,
    conversation_id: str,
    reason: str
) -> bool:
    """
    Notifica vendedor para revisão manual de mídia.
    Útil quando análise automática falha ou confiança é baixa.
    """
    if not settings.vendedor_whatsapp:
        logger.warning("Nenhum vendedor configurado para revisão de mídia")
        return False

    try:
        from app.evolution import evolution_client, to_number_field

        await evolution_client.send_text(
            number=to_number_field(settings.vendedor_whatsapp),
            text=f"🚨 REVISÃO MANUAL NECESSÁRIA\n\n"
                 f"Lead: {conversation_id}\n"
                 f"Motivo: {reason}\n"
                 f"Tipo: {media_type}\n\n"
                 f"Verifique documento: {media_url}"
        )
        return True
    except Exception as exc:
        logger.exception("Erro ao notificar vendedor: %s", exc)
        return False

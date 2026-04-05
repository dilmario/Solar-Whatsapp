"""
human_handoff.py — Escalonamento para atendimento humano.

Permite que um vendedor assuma a conversa quando necessário.
"""
from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Any

from app.config import settings
from app.state import carregar_estado, salvar_estado, _conversa_key, get_redis

logger = logging.getLogger(__name__)

def _human_mode_key(usuario_id: str) -> str:
    """Chave Redis para controle de modo humano."""
    return f"human_mode:{usuario_id}"


def _conversation_lock_key(usuario_id: str) -> str:
    """Chave Redis para lock de conversa entre bot e humano."""
    return f"conversation_lock:{usuario_id}"


async def ativar_modo_humano(
    usuario_id: str,
    vendedor_id: str,
    motivo: str
) -> bool:
    """
    Ativa modo humano para uma conversa.
    O vendedor assumirá o controle.
    """
    try:
        r = get_redis()
        data = {
            "vendedor_id": vendedor_id,
            "ativado_em": time.time(),
            "motivo": motivo,
            "expira_em": time.time() + (settings.modo_humano_timeout_minutos * 60),
        }

        # Salvar modo humano com TTL
        r.setex(
            _human_mode_key(usuario_id),
            settings.modo_humano_timeout_minutos * 60,
            json.dumps(data, ensure_ascii=False)
        )

        # Adicionar lock para impedir respostas do bot
        r.setex(_conversation_lock_key(usuario_id), 60, vendedor_id)

        logger.info("Modo humano ativado para %s por %s (%s)", usuario_id, vendedor_id, motivo)
        return True

    except Exception as exc:
        logger.exception("Erro ao ativar modo humano: %s", exc)
        return False


async def desativar_modo_humano(usuario_id: str) -> bool:
    """
    Desativa modo humano (bot volta a responder).
    """
    try:
        r = get_redis()
        r.delete(_human_mode_key(usuario_id))
        r.delete(_conversation_lock_key(usuario_id))
        logger.info("Modo humano desativado para %s", usuario_id)
        return True
    except Exception as exc:
        logger.exception("Erro ao desativar modo humano: %s", exc)
        return False


async def verificar_modo_humano(usuario_id: str) -> dict[str, Any] | None:
    """
    Verifica se a conversa está em modo humano.
    Retorna dados do atendimento ou None.
    """
    try:
        r = get_redis()
        raw = r.get(_human_mode_key(usuario_id))

        if not raw:
            return None

        data = json.loads(raw)

        # Verificar se expirou
        if time.time() > data.get("expira_em", 0):
            # Renovar automáticamente se houver atividade recente
            ttl = r.ttl(_conversation_lock_key(usuario_id))
            if ttl > 0:
                # Ainda ativo, renovar
                data["expira_em"] = time.time() + (settings.modo_humano_timeout_minutos * 60)
                r.setex(
                    _human_mode_key(usuario_id),
                    settings.modo_humano_timeout_minutes * 60,
                    json.dumps(data, ensure_ascii=False)
                )
                return data
            else:
                # Expirado mesmo
                await desativar_modo_humano(usuario_id)
                return None

        return data

    except Exception as exc:
        logger.exception("Erro ao verificar modo humano: %s", exc)
        return None


async def notificar_vendedor_quente(
    usuario_id: str,
    estado: dict[str, Any],
    mensagem_cliente: str
) -> bool:
    """
    Notifica vendedor quando lead tem score alto.
    """
    if not settings.vendedor_whatsapp:
        return False

    try:
        from app.evolution import evolution_client, to_number_field

        dados = estado.get("dados", {})

        await evolution_client.send_text(
            number=to_number_field(settings.vendedor_whatsapp),
            text=f"🔥 LEAD QUENTE (Score: {estado.get('lead_score', 0)})\n\n"
                 f"Número: {usuario_id}\n"
                 f"Perfil: {estado.get('perfil_detectado', 'desconhecido')}\n"
                 f"Estágio: {estado.get('estagio')}\n"
                 f"Nome: {dados.get('nome', 'N/A')}\n"
                 f"Volume Leads: {dados.get('volume_leads', 'N/A')}\n\n"
                 f"Última mensagem: {mensagem_cliente[:100]}...\n\n"
                 f"Comandos:\n"
                 f"/assumir_{usuario_id.split('@')[0]} - Atender\n"
                 f"/resumo_{usuario_id.split('@')[0]} - Ver histórico"
        )
        return True

    except Exception as exc:
        logger.exception("Erro ao notificar vendedor: %s", exc)
        return False


async def processar_comando_vendedor(
    comando: str,
    usuario_id: str
) -> str | None:
    """
    Processa comandos do vendedor via WhatsApp.

    Comandos:
    - /assumir_<numero> - Ativa modo humano
    - /liberar_<numero> - Desativa modo humano
    - /resumo_<numero> - Mostra resumo da conversa
    """
    comando_lower = comando.lower().strip()

    try:
        if comando_lower.startswith("/assumir_"):
            # Extrair número
            numero = comando_lower.replace("/assumir_", "")
            if "@" not in numero:
                numero = f"{numero}@s.whatsapp.net"

            success = await ativar_modo_humano(
                usuario_id=numero,
                vendedor_id=usuario_id,  # Quem enviou o comando
                motivo="Escalonamento manual"
            )

            if success:
                return f"✅ Você assumiu a conversa com {numero}. Envie mensagens normalmente."
            else:
                return "❌ Erro ao assumir conversa. Tente novamente."

        elif comando_lower.startswith("/liberar_"):
            numero = comando_lower.replace("/liberar_", "")
            if "@" not in numero:
                numero = f"{numero}@s.whatsapp.net"

            success = await desativar_modo_humano(numero)

            if success:
                return f"✅ Bot retomou controle da conversa com {numero}."
            else:
                return "❌ Erro ao liberar conversa."

        elif comando_lower.startswith("/resumo_"):
            numero = comando_lower.replace("/resumo_", "")
            if "@" not in numero:
                numero = f"{numero}@s.whatsapp.net"

            estado = carregar_estado(numero)
            historico = estado.get("historico", [])

            # Últimas 5 mensagens
            resumo = []
            for h in historico[-10:]:
                role = "👤" if h.get("role") == "user" else "🤖"
                content = h.get("content", "")[:50]
                resumo.append(f"{role}: {content}...")

            return f"📋 Resumo da conversa {numero}:\n\n" + "\n".join(resumo)

        return None  # Não é comando vendedor

    except Exception as exc:
        logger.exception("Erro ao processar comando: %s", exc)
        return f"❌ Erro: {str(exc)}"


async def gerenciar_conversa_hibrida(
    usuario_id: str,
    mensagem_cliente: str,
    estado: dict[str, Any],
    responder_callback: callable
) -> bool:
    """
    Decide se humano ou bot deve responder.
    Retorna True se bot processou, False se humano assumiu.
    """
    # Verificar se está em modo humano
    human_mode = await verificar_modo_humano(usuario_id)

    if human_mode:
        # Verificar se é mensagem do vendedor
        if mensagem_cliente.startswith("/"):
            return await responder_callback(mensagem_cliente)

        # É mensagem do cliente enquanto vendedor está ativo
        # Renovar lock e notificar vendedor
        r = get_redis()
        r.setex(
            _conversation_lock_key(usuario_id),
            60,
            human_mode["vendedor_id"]
        )
        return False  # Bot NÃO responde, humano responde manualmente

    # Verificar se deve escalar
    if estado.get("lead_score", 0) >= settings.lead_score_threshold_escalar:
        if estado.get("momento_de_compra"):
            await notificar_vendedor_quente(usuario_id, estado, mensagem_cliente)

    return False  # Bot processa normalmente

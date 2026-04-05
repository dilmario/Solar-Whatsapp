from __future__ import annotations

from typing import Any, Optional


def extract_message_payload(payload: dict[str, Any]) -> Optional[dict[str, Any]]:
    # Defensive parsing for webhook payload variations.
    data = payload.get("data") or {}
    event = payload.get("event") or data.get("event")

    # Most inbound messages arrive as messages.upsert.
    if event != "messages.upsert":
        return None

    inner = data.get("data") or data
    key = inner.get("key") or {}
    message = inner.get("message") or {}
    push_name = inner.get("pushName") or data.get("pushName")
    sender_pn = inner.get("senderPn") or data.get("senderPn")

    remote_jid = key.get("remoteJid")
    message_id = key.get("id")
    from_me = bool(key.get("fromMe", False))

    text = None
    if "conversation" in message:
        text = message.get("conversation")
    elif "extendedTextMessage" in message:
        text = (message.get("extendedTextMessage") or {}).get("text")
    elif "imageMessage" in message:
        text = (message.get("imageMessage") or {}).get("caption")
    elif "videoMessage" in message:
        text = (message.get("videoMessage") or {}).get("caption")

    return {
        "event": event,
        "text": text,
        "remote_jid": remote_jid,
        "message_id": message_id,
        "from_me": from_me,
        "sender_pn": sender_pn,
        "push_name": push_name,
        "raw": payload,
    }

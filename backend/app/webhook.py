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
    has_media = False
    media_type = None
    media_data = None

    if "conversation" in message:
        text = message.get("conversation")
    elif "extendedTextMessage" in message:
        text = (message.get("extendedTextMessage") or {}).get("text")
    elif "imageMessage" in message:
        text = message.get("imageMessage", {}).get("caption")
        has_media = True
        media_type = "image"
        media_data = {
            "url": message.get("imageMessage", {}).get("url"),
            "mimetype": message.get("imageMessage", {}).get("mimetype"),
            "caption": text,
        }
    elif "videoMessage" in message:
        text = message.get("videoMessage", {}).get("caption")
        has_media = True
        media_type = "video"
        media_data = {
            "url": message.get("videoMessage", {}).get("url"),
            "mimetype": message.get("videoMessage", {}).get("mimetype"),
            "caption": text,
        }
    elif "documentMessage" in message:
        text = message.get("documentMessage", {}).get("caption")
        has_media = True
        media_type = "document"
        media_data = {
            "url": message.get("documentMessage", {}).get("url"),
            "mimetype": message.get("documentMessage", {}).get("mimetype"),
            "caption": text,
        }

    return {
        "event": event,
        "text": text,
        "has_media": has_media,
        "media_type": media_type,
        "media_data": media_data,
        "remote_jid": remote_jid,
        "message_id": message_id,
        "from_me": from_me,
        "sender_pn": sender_pn,
        "push_name": push_name,
        "raw": payload,
    }

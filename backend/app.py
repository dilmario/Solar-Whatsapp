from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json
import re
from datetime import datetime, timedelta
from dotenv import load_dotenv
import anthropic

# ============================================
# INIT
# ============================================

load_dotenv()

app = Flask(__name__)
CORS(app)

# ============================================
# CONFIG
# ============================================

EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL", "http://evolution-api:8080")
EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY", "")
INSTANCE_NAME = os.getenv("INSTANCE_NAME", "consultor-solar")

CALCOM_URL = os.getenv("CALCOM_URL", "http://calcom:3000")
CALCOM_API_KEY = os.getenv("CALCOM_API_KEY", "")
CALCOM_EVENT_TYPE_ID = os.getenv("CALCOM_EVENT_TYPE_ID", "1")

# Claude
claude_client = None
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

if ANTHROPIC_API_KEY:
    claude_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    print("🤖 Claude ativo")
else:
    print("⚠️ Claude desativado")

# Estado
conversas = {}

# ============================================
# UTIL
# ============================================

def registrar_log(nivel, msg):
    print(f"[{datetime.now()}] {nivel} {msg}")

def extrair_numero(n):
    return n.split("@")[0] if n else ""

def extrair_email(texto):
    match = re.findall(r"\S+@\S+", texto)
    return match[0] if match else None

# ============================================
# WHATSAPP
# ============================================

def enviar_resposta_evolution(destinatario, texto):
    try:
        numero = extrair_numero(destinatario)

        url = f"{EVOLUTION_API_URL}/message/sendText/{INSTANCE_NAME}"

        payload = {
            "number": numero,
            "text": texto,
            "delay": 1000
        }

        headers = {
            "Content-Type": "application/json",
            "apikey": EVOLUTION_API_KEY
        }

        requests.post(url, json=payload, headers=headers)
        return True

    except Exception as e:
        registrar_log("❌", str(e))
        return False

# ============================================
# AGENDAMENTO
# ============================================

def agendar_reuniao(usuario, dados_conversa):
    try:
        if not CALCOM_API_KEY:
            return False, None

        email = dados_conversa.get("email")
        if not email:
            numero = extrair_numero(usuario)
            email = f"lead_{numero}@temp.com"

        start_time = datetime.now() + timedelta(days=1)
        start_time = start_time.replace(hour=14, minute=0, second=0, microsecond=0)

        url = f"{CALCOM_URL}/api/bookings"

        headers = {
            "Authorization": f"Bearer {CALCOM_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "eventTypeId": int(CALCOM_EVENT_TYPE_ID),
            "start": start_time.isoformat(),
            "responses": {
                "name": f"Lead Solar - {dados_conversa.get('cidade', 'Brasil')}",
                "email": email,
                "location": "Google Meet"
            }
        }

        response = requests.post(url, json=payload, headers=headers)

        if response.status_code in [200, 201]:
            data = response.json()
            booking = data.get("booking", data)
            link = booking.get("uid") or booking.get("eventUrl")

            if link:
                return True, f"{CALCOM_URL}/booking/{link}"

        return False, None

    except Exception as e:
        registrar_log("❌", str(e))
        return False, None

# ============================================
# IA
# ============================================

def gerar_analise_solar_sonnet(dados_usuario, texto_cliente):
    if not claude_client:
        return None

    try:
        prompt = f"""
Você é um especialista em energia solar.

Dados:
{json.dumps(dados_usuario, indent=2)}

Mensagem:
{texto_cliente}

Responda de forma consultiva.
"""

        resp = claude_client.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}]
        )

        return resp.content[0].text.strip()

    except Exception as e:
        registrar_log("❌ Claude", str(e))
        return None

# ============================================
# CONVERSA
# ============================================

def reiniciar_conversa(usuario):
    conversas[usuario] = {
        "etapa": "saudacao",
        "inicio": datetime.now().isoformat()
    }
    return "🔄 Reiniciado\n\nQual sua conta de luz?"

def processar_conversa_qualificacao(usuario, texto):

    if texto.lower() in ["menu", "reiniciar"]:
        return reiniciar_conversa(usuario)

    if usuario not in conversas:
        conversas[usuario] = {"etapa": "saudacao"}

    c = conversas[usuario]
    etapa = c["etapa"]

    if etapa == "saudacao":
        c["etapa"] = "conta"
        return "🌞 Qual o valor da sua conta?"

    elif etapa == "conta":
        nums = re.findall(r"\d+", texto)
        if not nums:
            return "Digite um valor válido"

        c["conta"] = int("".join(nums))
        c["etapa"] = "cidade"
        return "📍 Qual sua cidade?"

    elif etapa == "cidade":
        c["cidade"] = texto
        c["etapa"] = "email"
        return "📧 Seu email?"

    elif etapa == "email":
        email = extrair_email(texto)
        if not email:
            return "Email inválido"

        c["email"] = email
        c["etapa"] = "finalizado"

        sucesso, link = agendar_reuniao(usuario, c)

        if sucesso:
            return f"✅ Agendado!\n{link}"

        return "✅ Lead qualificado!"

    else:
        return "Digite MENU para reiniciar"

# ============================================
# ROTAS
# ============================================

@app.route("/")
def home():
    return jsonify({"status": "ok"})

@app.route("/evolution-webhook", methods=["GET", "POST"])
@app.route("/evolution-webhook/<path:subpath>", methods=["GET", "POST"])
def evolution_webhook(subpath=None):
    try:
        if request.method == 'GET':
            token = request.args.get('token')
            expected = os.getenv('WEBHOOK_VERIFY_TOKEN', 'token')

            if token == expected:
                return {"status": "ok"}, 200
            return {"error": "invalid"}, 403

        data = request.json
        evento = data.get('event')

        if evento == 'messages.upsert':
            msg_data = data.get('data', {})
            from_number = msg_data.get('key', {}).get('remoteJid', '')
            mensagem = msg_data.get('message', {})

            texto = mensagem.get('conversation') or \
                    mensagem.get('extendedTextMessage', {}).get('text', '')

            if not texto:
                return {"status": "ignored"}, 200

            resposta = processar_conversa_qualificacao(from_number, texto)

            if resposta:
                enviar_resposta_evolution(from_number, resposta)

        return {"status": "ok"}, 200

    except Exception as e:
        registrar_log("❌", str(e))
        return {"error": str(e)}, 500

# ============================================
# RUN
# ============================================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
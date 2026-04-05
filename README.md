# SaaS Solar WhatsApp Bot

Bot de vendas do SaaS **Consultor Solar Automatizado** via WhatsApp, com dashboard de acompanhamento.

## O que ele vende

O bot qualifica e converte empresas de energia solar interessadas em automatizar seu atendimento com IA.

### Planos oferecidos

| Plano | Setup | Mensalidade |
|---|---|---|
| Bot Captador | R$ 297 | R$ 97/mês |
| Consultor Solar IA ⭐ | R$ 997 | R$ 397/mês |
| Solar 360 | R$ 2.497 | R$ 897/mês |

---

## 📖 Índice

1. [Arquitetura](#arquitetura)
2. [Guia de Configuração Completo](#guia-de-configuração-completo)
3. [Modo Humano / Escalonamento](#modo-humano--escalonamento)
4. [Processamento de Mídia](#processamento-de-mídia)
5. [Resiliência e Rate Limiting](#resiliência-e-rate-limiting)
6. [Troubleshooting](#troubleshooting)

---

## Arquitetura

```
frontend/        Next.js 14  — dashboard do gestor (porta 3000)
backend/         FastAPI     — bot + API de leads  (porta 8000)
redis            Redis 7     — state + leads + dedup
postgres         Postgres 15 — Evolution API
evolution-api    Evolution   — gateway WhatsApp    (porta 8082)
```

## Subir com Docker

```bash
cp backend/.env.example backend/.env
# edite backend/.env com suas chaves reais

cp evolution.env.example evolution.env
# edite evolution.env

docker compose up -d
docker compose logs -f backend
```

---

## 📋 Guia de Configuração Completo

### Passo 1: Configurar Variáveis de Ambiente

#### Backend (`backend/.env`)
```bash
cp backend/.env.example backend/.env
```

Edite o arquivo com suas credenciais:

```env
# ── App ─────────────────────────────────────────────────────────────
APP_NAME=saas-solar-bot
APP_ENV=dev
APP_DEBUG=false

# ── Evolution API ────────────────────────────────────────────────────
EVOLUTION_BASE_URL=http://evolution-api:8080
EVOLUTION_API_KEY=chave-gerada-na-evolution
EVOLUTION_INSTANCE=sua-instancia
EVOLUTION_WEBHOOK_SECRET=senha-super-secreta-minimo-32-caracteres

# ── Google AI (Gemini) ───────────────────────────────────────────────
GOOGLE_API_KEY=sua-chave-gemini
MODEL_NAME=gemini-2.0-flash

# ── Redis ─────────────────────────────────────────────────────────────
REDIS_URL=redis://redis:6379/0

# ── Modo Humano / Escalonamento ───────────────────────────────────────
# Número do vendedor para notificações (formato: 55DDDNNNNNNNN@s.whatsapp.net)
VENDEDOR_WHATSAPP=5511999999999@s.whatsapp.net
LEAD_SCORE_THRESHOLD_ESCALAR=85      # Score mínimo para notificar
MODO_HUMANO_TIMEOUT_MINUTOS=30       # Tempo máximo de atendimento humano
```

#### Evolution API (`evolution.env`)
```bash
cp evolution.env.example evolution.env
```

### Passo 2: Subir os Serviços

```bash
# Primeira vez - build
docker-compose up --build -d

# Ou apenas subir
docker-compose up -d

# Verificar status
docker-compose ps

# Logs em tempo real
docker-compose logs -f backend
docker-compose logs -f evolution-api
```

### Passo 3: Configurar WhatsApp na Evolution

1. Acesse: `http://localhost:8082`
2. Crie uma instância
3. Escaneie o QR Code com seu WhatsApp
4. Configure webhook:
   - **URL**: `http://backend:8000/webhooks/evolution`
   - **Header**: `X-Webhook-Secret` (valor de `backend/.env`)
   - **Evento**: `messages.upsert`

### Passo 4: Verificar Instalação

```bash
# Testar backend
curl http://localhost:8000/health

# Deve retornar: {"ok": true, "service": "...", "redis": true, "evolution": true}
```

---

## Configuração da Evolution API

Após subir, acesse `http://localhost:8082` e configure a instância:
- Webhook URL: `http://backend:8000/webhooks/evolution`
- Header: `X-Webhook-Secret: <valor de EVOLUTION_WEBHOOK_SECRET no .env>`
- Evento: `messages.upsert`

## API do Dashboard

| Endpoint | Descrição |
|---|---|
| `GET /api/leads` | Lista todos os leads |
| `GET /api/leads/{id}` | Lead específico |
| `GET /api/metricas` | Métricas agregadas (por estágio, perfil e plano) |
| `GET /health` | Saúde dos serviços |
| `POST /webhooks/evolution` | Webhook da Evolution |

## Dados coletados por lead

- Nome e email
- Volume estimado de leads/mês
- Tamanho da equipe de vendas
- Principal dor relatada
- Plano de interesse (bot_captador / consultor_ia / solar_360)

## Modelo Gemini

Configure `MODEL_NAME` no `.env`. Recomendado: `gemini-2.0-flash`

## Segurança

- Nunca commite o arquivo `.env`
- Use `.env.example` como referência
- Defina `CORS_ORIGINS` com o domínio real do frontend em produção
- Rotacione `EVOLUTION_WEBHOOK_SECRET` periodicamente

---

## 🤝 Modo Humano / Escalonamento

Permite que um vendedor assuma conversas automaticamente quando leads atingem score alto, ou manualmente via comandos.

### Como funciona

| Cenário | Ação |
|---------|------|
| Lead score >= 85 + momento de compra | Notifica vendedor automaticamente |
| 3 falhas consecutivas do LLM | Ativa modo humano automaticamente |
| Vendedor executa `/assumir` | Pausa bot, vendedor responde manualmente |

### Comandos do Vendedor (via WhatsApp)

Envie para o número do bot:

```
/assumir_5511999999999   # Assumir conversa com lead
/liberar_5511999999999   # Devolver ao bot
/resumo_5511999999999    # Ver histórico da conversa
```

### Configuração

```env
VENDEDOR_WHATSAPP=5511999999999@s.whatsapp.net
LEAD_SCORE_THRESHOLD_ESCALAR=85
MODO_HUMANO_TIMEOUT_MINUTOS=30
```

---

## 🖼️ Processamento de Mídia

O bot pode analisar imagens enviadas (contas de luz, documentos) usando Gemini Vision.

### Funcionalidades

| Tipo | Extrai |
|------|--------|
| Conta de luz | Consumo kWh, valor em R$, dados do cliente |
| Documentos | Texto detectado, tipo de documento |

### Exemplo de uso

1. O cliente envia foto da conta de luz
2. Bot responde: *"Recebi sua conta! Identifiquei consumo de 450 kWh/mês e fatura de R$ 487,00. Isso dá pra economizar ~30% com solar, quer que eu faça uma simulação?"*

### Configuração

```env
PERMITIR_ANALISE_IMAGEM=true
GOOGLE_API_KEY=sua-chave-gemini  # Necessário modelo Vision
```

---

## 🛡️ Resiliência e Rate Limiting

Proteções implementadas para evitar falhas e abuso.

### Rate Limit

| Endpoint | Limite |
|----------|--------|
| Webhooks | 120 req/min |
| API geral | 60 req/min |

### Circuit Breaker

Se o LLM falhar 3 vezes:
1. Circuito abre (bloqueia chamadas)
2. Ativa modo humano
3. Notifica vendedor
4. Após 30s, tenta recuperação

### Lock de Conversa

Evita que a mesma mensagem seja processada 2x simultaneamente.

### Redis Resilience

- Retry automático (3 tentativas)
- Fallback para memória local se Redis falhar
- Dados preservados temporariamente

---

## 🐛 Troubleshooting

### Bot não responde

```bash
# Verificar logs
docker-compose logs -f backend

# Verificar saúde
curl http://localhost:8000/health

# Verificar conexão Redis
docker-compose exec redis redis-cli ping
```

### Evolution API não conecta

```bash
# Verificar instância
curl http://localhost:8082/instance/list

# Logs
docker-compose logs -f evolution-api
```

### Erro "Rate limit exceeded"

- Você está enviando mensagens demais muito rápido
- Aguarde 1 minuto e tente novamente
- Ajuste `RATE_LIMIT_REQUESTS_PER_MINUTE` se necessário

### Circuit breaker aberto

- Verificar `GOOGLE_API_KEY` válida
- Verificar conectividade com API Gemini
- Após 30s, sistema tenta recuperação automática

### Modo humano não ativa

1. Verificar `VENDEDOR_WHATSAPP` preenchido corretamente
2. Formato deve ser: `55DDDNÚMERO@s.whatsapp.net`
3. Verificar se vendedor está conectado na Evolution

---

## Follow-up Automático

O worker de follow-up roda em background junto com o FastAPI (sem precisar de processo separado).

### Sequência de disparo

| Tentativa | Janela de inatividade | Estágios alvo |
|---|---|---|
| #1 | 2 horas | descoberta, qualificacao, simulacao |
| #2 | 24 horas | proposta, agendamento, simulacao |
| #3 | 3 dias | qualquer estágio ativo |
| — | após 3 sem resposta | lead marcado como `perdido` |

### Reset automático
Quando o lead volta a responder, o contador de follow-ups zera automaticamente.

### Endpoint de monitoramento
`GET /api/followups` — lista leads com follow-ups pendentes e contadores.

### Configuração via .env
```
FOLLOWUP_INTERVALO_SEGUNDOS=300   # varredura a cada 5 min
FOLLOWUP_JANELA_2H=7200
FOLLOWUP_JANELA_24H=86400
FOLLOWUP_JANELA_3D=259200
FOLLOWUP_MAX_TENTATIVAS=3
```

---

## 🚀 Primeiros Passos (Checkout)

### 1. Teste básico
```bash
# Enviar mensagem de teste via curl
curl -X POST http://localhost:8000/webhooks/evolution \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: sua-senha" \
  -d '{
    "event": "messages.upsert",
    "data": {
      "data": {
        "key": {"remoteJid": "5511999999999@s.whatsapp.net", "id": "teste123"},
        "message": {"conversation": "Oi, quero saber mais"},
        "pushName": "João Teste"
      }
    }
  }'
```

### 2. Ver lead criado
```bash
# Listar todos os leads
curl http://localhost:8000/api/leads

# Ver métricas
curl http://localhost:8000/api/metricas
```

### 3. Acessar Dashboard
Abra `http://localhost:3000` no navegador

---

## 📱 Exemplo de Conversa Completa

**Cliente:** "Oi, tenho uma empresa de energia solar"

**Bot:** "Oi! Que legal. Você recebe muitos leads por mês? E principalmente, quantos estão esfriando por falta de resposta rápida?"

**Cliente:** "Uns 50 leads e perdemos bastante à noite"

**Bot:** "Entendo... 50 leads é um volume bom! Com nosso Consultor Solar IA, esses leads de fora do horário são atendidos em 2 segundos, qualificados e agendados automaticamente. Quer que eu te mostre como funciona na prática?"

... (conversa continua seguindo o funil)

---

## 📊 Monitoramento

### Endpoints úteis

| Endpoint | Descrição |
|----------|-----------|
| `GET /health` | Saúde do sistema |
| `GET /api/leads` | Lista leads (últimos 100) |
| `GET /api/leads/{id}` | Detalhes de um lead |
| `GET /api/metricas` | Dashboard em JSON |
| `GET /api/followups` | Follow-ups pendentes |

### Grafana (opcional)

Configure métricas Prometheus para monitorar:
- Taxa de sucesso do LLM
- Circuit breaker state
- Rate limit hits
- Mensagens processadas/min

---

## 🔐 Segurança em Produção

1. **Nunca commite o `.env`** ✅ (já está no .gitignore)
2. **HTTPS obrigatório** — Configure reverse proxy (Nginx/Traefik)
3. **CORS restritivo** — `CORS_ORIGINS` com domínio exato
4. **Webhook secrets** — Rotacione `EVOLUTION_WEBHOOK_SECRET` mensalmente
5. **Rate limiting** — Ajuste conforme seu tráfego esperado
6. **Logs sensíveis** — Não logue conteúdo de mensagens em produção

---

## 🤝 Contribuindo

Encontrou um bug ou tem ideias? Abra uma issue no GitHub.

---

## 📝 Licença

MIT License — Consulte o arquivo LICENSE para detalhes.

---

**Feito com ❤️ para empresas de energia solar que querem escalar sem perder leads!** ☀️

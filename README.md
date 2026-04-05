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

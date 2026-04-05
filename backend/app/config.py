from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "saas-solar-bot"
    app_env: str = "dev"
    app_debug: bool = False
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    evolution_base_url: str
    evolution_api_key: str
    evolution_instance: str
    evolution_webhook_secret: str

    google_api_key: str

    model_name: str = "gemini-2.0-flash"
    temperature: float = 0.4
    max_historico: int = 8
    history_hard_limit: int = 30

    cors_origins: list[str] = ["http://localhost:3000"]
    send_typing_delay_ms: int = 0
    request_timeout_seconds: float = 20.0

    redis_url: str = "redis://redis:6379/0"
    redis_conversa_ttl: int = 86400       # 24h
    redis_lead_ttl: int = 2592000         # 30 dias

    # ── Follow-up ────────────────────────────────────────────────────────────
    followup_intervalo_segundos: int = 300          # varredura a cada 5 min
    followup_janela_2h: int = 2 * 60 * 60           # 2 horas
    followup_janela_24h: int = 24 * 60 * 60         # 24 horas
    followup_janela_3d: int = 3 * 24 * 60 * 60     # 3 dias
    followup_max_tentativas: int = 3                # após isso, marca como perdido

    # ── Rate limiting ──────────────────────────────────────────────────────────
    rate_limit_requests_per_minute: int = 60       # Limite por IP
    rate_limit_webhook_per_minute: int = 120      # Limite para webhooks

    # ── Modo humano / fallback ─────────────────────────────────────────────────
    vendedor_whatsapp: str | None = None           # Número para escalonar leads quentes
    lead_score_threshold_escalar: int = 85         # Score para notificar vendedor
    modo_humano_timeout_minutos: int = 30          # Quanto tempo humano fica ativo
    fallback_max_retries: int = 3                  # Tentativas IA antes de fallback

    # ── Processamento de imagem ───────────────────────────────────────────────
    permitir_analise_imagem: bool = True           # Análise com Gemini Vision

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()

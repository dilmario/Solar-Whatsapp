from typing import Optional, Literal
from pydantic import BaseModel, Field


class DadosExtraidos(BaseModel):
    nome: Optional[str] = Field(default=None, description="Nome do prospect, se informado")
    email: Optional[str] = Field(default=None, description="Email para envio de proposta")
    volume_leads: Optional[int] = Field(default=None, description="Volume estimado de leads por mês")
    tamanho_equipe: Optional[int] = Field(default=None, description="Número de vendedores na equipe")
    dor_principal: Optional[str] = Field(
        default=None,
        description="Principal problema relatado: falta de resposta rápida, sobrecarga, leads esfriando, etc."
    )
    plano_interesse: Optional[Literal["bot_captador", "consultor_ia", "solar_360"]] = Field(
        default=None, description="Plano pelo qual o prospect demonstrou interesse"
    )


class RespostaVendedor(BaseModel):
    mensagem: str = Field(
        description="Mensagem curta, natural e objetiva para WhatsApp, com no máximo 3 blocos e apenas 1 pergunta"
    )
    dados_extraidos: DadosExtraidos = Field(description="Dados identificados na mensagem do prospect")
    perfil_detectado: Literal["ANALITICO", "PRATICO", "EMOCIONAL", "DESCONFIADO"] = Field(
        description="Perfil predominante do prospect"
    )
    estagio_funil: Literal[
        "inicio", "descoberta", "qualificacao", "simulacao", "proposta", "agendamento", "followup"
    ] = Field(description="Estágio atual do prospect no funil de vendas")
    proxima_intencao: Literal[
        "coletar_nome",
        "coletar_email",
        "coletar_volume_leads",
        "coletar_equipe",
        "coletar_dor",
        "apresentar_planos",
        "recomendar_plano",
        "tratar_objecao",
        "encaminhar_teste",
        "fazer_followup",
    ] = Field(description="Próxima ação recomendada pelo assistente")
    momento_de_compra: bool = Field(description="Indica se o prospect demonstrou intenção clara de avançar")
    lead_score: int = Field(ge=0, le=100, description="Pontuação de interesse do lead baseada no engajamento e intenção")
    precisa_calculo_financeiro: bool = Field(
        description="Indica se já há dados suficientes (volume_leads ou tamanho_equipe) para apresentar simulação de ROI"
    )


class WebhookAck(BaseModel):
    ok: bool = True

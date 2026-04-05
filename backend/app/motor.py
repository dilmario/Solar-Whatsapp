from __future__ import annotations

import json

from app.config import settings
from app.financeiro import calcular_analise_saas
from app.llm import chamar_modelo
from app.state import carregar_estado, salvar_estado, salvar_lead, mesclar_dados


def montar_contexto(estado: dict, mensagem_cliente: str) -> str:
    dados_financeiros = {}
    dados = estado["dados"]

    if estado.get("precisa_calculo_financeiro"):
        dados_financeiros = calcular_analise_saas(
            volume_leads=dados.get("volume_leads"),
            tamanho_equipe=dados.get("tamanho_equipe"),
            plano=dados.get("plano_interesse") or "consultor_ia",
        )

    historico_recente = estado["historico"][-settings.max_historico:]

    return f"""
DADOS DO PROSPECT:
{json.dumps(estado['dados'], ensure_ascii=False)}

ESTÁGIO ATUAL:
{estado['estagio']}

LEAD SCORE ATUAL:
{estado['lead_score']}

PERFIL DETECTADO ATUAL:
{json.dumps(estado.get('perfil_detectado'), ensure_ascii=False)}

MOMENTO DE COMPRA ATUAL:
{json.dumps(estado.get('momento_de_compra'), ensure_ascii=False)}

PRÓXIMA INTENÇÃO ATUAL:
{json.dumps(estado.get('proxima_intencao'), ensure_ascii=False)}

SIMULAÇÃO DE ROI / PLANOS:
{json.dumps(dados_financeiros, ensure_ascii=False) if dados_financeiros else "não disponível ainda"}

HISTÓRICO RECENTE:
{json.dumps(historico_recente, ensure_ascii=False)}

MENSAGEM DO PROSPECT:
{mensagem_cliente}
""".strip()


async def processar_conversa(usuario_id: str, mensagem_cliente: str) -> dict:
    estado = carregar_estado(usuario_id)

    contexto = montar_contexto(estado, mensagem_cliente)
    output = await chamar_modelo(contexto)

    # Atualiza estado com os dados extraídos
    estado["dados"] = mesclar_dados(estado["dados"], output.dados_extraidos.model_dump())
    estado["lead_score"] = output.lead_score
    estado["estagio"] = output.estagio_funil
    estado["perfil_detectado"] = output.perfil_detectado
    estado["momento_de_compra"] = output.momento_de_compra
    estado["proxima_intencao"] = output.proxima_intencao
    estado["precisa_calculo_financeiro"] = output.precisa_calculo_financeiro

    estado["historico"].append({"role": "user", "content": mensagem_cliente})
    estado["historico"].append({"role": "assistant", "content": output.mensagem})
    if len(estado["historico"]) > settings.history_hard_limit:
        estado["historico"] = estado["historico"][-settings.history_hard_limit:]

    salvar_estado(usuario_id, estado)
    salvar_lead(usuario_id, estado, output.model_dump())

    return output.model_dump()

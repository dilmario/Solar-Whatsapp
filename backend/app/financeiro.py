from typing import Any, Dict, Optional


# Tabela de planos do SaaS
PLANOS = {
    "bot_captador": {
        "nome": "Bot Captador",
        "setup": 297,
        "mensalidade": 97,
    },
    "consultor_ia": {
        "nome": "Consultor Solar IA",
        "setup": 997,
        "mensalidade": 397,
    },
    "solar_360": {
        "nome": "Solar 360",
        "setup": 2497,
        "mensalidade": 897,
    },
}

# Benchmarks reais usados na landing page
TAXA_CONVERSAO_MEDIA = 0.50   # +50% de aumento em conversões com o produto
REDUCAO_TEMPO_RESPOSTA = 0.70 # -70% no tempo de resposta
AUMENTO_AGENDAMENTOS = 0.40   # +40% em agendamentos no 1º mês


def calcular_analise_saas(
    volume_leads: Optional[int] = None,
    tamanho_equipe: Optional[int] = None,
    plano: str = "consultor_ia",
) -> Dict[str, Any]:
    """
    Gera projeção de ROI para o prospect com base no volume de leads
    e tamanho da equipe. Usa os benchmarks reais da landing page.
    """
    info_plano = PLANOS.get(plano, PLANOS["consultor_ia"])
    setup = info_plano["setup"]
    mensalidade = info_plano["mensalidade"]

    resultado: Dict[str, Any] = {
        "plano_recomendado": info_plano["nome"],
        "setup": setup,
        "mensalidade": mensalidade,
    }

    if volume_leads and volume_leads > 0:
        leads_recuperados_mes = round(volume_leads * 0.35)  # ~35% eram perdidos fora do horário
        leads_adicionais_ano = leads_recuperados_mes * 12

        resultado["leads_perdidos_estimados_mes"] = leads_recuperados_mes
        resultado["leads_recuperados_ano"] = leads_adicionais_ano
        resultado["aumento_agendamentos_mes"] = round(volume_leads * AUMENTO_AGENDAMENTOS)

    if tamanho_equipe and tamanho_equipe > 0:
        horas_qualificacao_dia = tamanho_equipe * 2  # ~2h/dia por vendedor em qualificação manual
        horas_economizadas_mes = horas_qualificacao_dia * 22  # dias úteis
        resultado["horas_economizadas_equipe_mes"] = horas_economizadas_mes

    # Payback: quantos meses para recuperar o setup
    if mensalidade > 0:
        payback_meses = round(setup / mensalidade, 1)
        resultado["payback_meses"] = payback_meses

    resultado["teste_gratis_dias"] = 7
    resultado["tem_contrato"] = False

    return resultado

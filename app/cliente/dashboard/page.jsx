'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

// ─── Constantes ───────────────────────────────────────────────────────────────

// BUG 1 CORRIGIDO: IP local substituído por variável de ambiente
// Configure NEXT_PUBLIC_API_URL no .env.local (dev) e nas env vars do Vercel (produção)
// Exemplo: NEXT_PUBLIC_API_URL=https://sua-api.com
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// BUG 3 CORRIGIDO: Dados de fallback separados por período — gráfico muda conforme seleção
const FALLBACK = {
  '7dias': {
    metrics: {
      leadsHoje: 12, leadsMes: 87, conversao: 68,
      economiaGerada: 28500, agendamentos: 54, taxaResposta: 94,
      changeLeadsHoje: '+15%', changeLeadsMes: '+8%', changeConversao: '+5%',
      changeEconomia: '+12%', changeAgendamentos: '+23%', changeTaxaResposta: '+2%',
    },
    grafico: [
      { dia: 'Seg', valor: 14 }, { dia: 'Ter', valor: 18 }, { dia: 'Qua', valor: 11 },
      { dia: 'Qui', valor: 20 }, { dia: 'Sex', valor: 16 }, { dia: 'Sáb', valor: 9 }, { dia: 'Dom', valor: 6 },
    ],
    leads: [],
  },
  '30dias': {
    metrics: {
      leadsHoje: 12, leadsMes: 247, conversao: 68,
      economiaGerada: 84500, agendamentos: 156, taxaResposta: 94,
      changeLeadsHoje: '+15%', changeLeadsMes: '+8%', changeConversao: '+5%',
      changeEconomia: '+12%', changeAgendamentos: '+23%', changeTaxaResposta: '+2%',
    },
    grafico: [
      { dia: 'Sem 1', valor: 45 }, { dia: 'Sem 2', valor: 62 },
      { dia: 'Sem 3', valor: 78 }, { dia: 'Sem 4', valor: 62 },
    ],
    leads: [],
  },
  '90dias': {
    metrics: {
      leadsHoje: 12, leadsMes: 614, conversao: 71,
      economiaGerada: 210000, agendamentos: 389, taxaResposta: 96,
      changeLeadsHoje: '+15%', changeLeadsMes: '+18%', changeConversao: '+9%',
      changeEconomia: '+32%', changeAgendamentos: '+41%', changeTaxaResposta: '+4%',
    },
    grafico: [
      { dia: 'Mês 1', valor: 142 }, { dia: 'Mês 2', valor: 198 }, { dia: 'Mês 3', valor: 274 },
    ],
    leads: [],
  },
}

// ─── Componentes ──────────────────────────────────────────────────────────────

function MetricCard({ title, value, change, icon: Icon, color = 'emerald' }) {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {/* MELHORIA 1 CORRIGIDA: change agora vem da API, não é hardcoded */}
          {change && (
            <p className="text-xs text-emerald-600 mt-1">↑ {change} em relação ao período anterior</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

function SimpleBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.valor))

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">{item.dia}</span>
            <span className="font-medium text-gray-900">{item.valor}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(item.valor / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// MELHORIA 2 CORRIGIDA: estado vazio com mensagem clara em vez de tabela em branco
function TabelaLeads({ leads }) {
  if (!leads || leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <Users size={22} className="text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700">Nenhum lead ainda</p>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          Os leads qualificados pelo consultor aparecerão aqui assim que chegarem.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Número</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Cidade</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Conta</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Data</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-700">{lead.numero}</td>
              <td className="py-3 px-4 text-sm text-gray-700">{lead.cidade}</td>
              <td className="py-3 px-4 text-sm text-gray-700">R$ {lead.conta}</td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                  ${lead.status === 'agendado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {lead.status === 'agendado' ? <CheckCircle size={12} /> : <Clock size={12} />}
                  {lead.status}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-700">{lead.data}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Banner exibido quando a API falha e os dados são de demonstração
function FallbackBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-amber-500" />
      <span>
        Não foi possível conectar à API. Exibindo dados de demonstração.
        Verifique se o servidor está ativo e se a variável{' '}
        <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">NEXT_PUBLIC_API_URL</code>{' '}
        está configurada corretamente no Vercel.
      </span>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [dados, setDados] = useState(null)
  const [periodo, setPeriodo] = useState('7dias')
  const [isFallback, setIsFallback] = useState(false)

  // BUG 2 CORRIGIDO: carregarDados agora é chamada de verdade via useEffect
  const carregarDados = useCallback(async () => {
    setLoading(true)
    setIsFallback(false)

    try {
      const response = await fetch(`${API_BASE}/consultor/stats?periodo=${periodo}`)

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()

      setDados({
        metrics: {
          leadsHoje:         data.leads_hoje          ?? 0,
          leadsMes:          data.leads_mes           ?? 0,
          conversao:         data.taxa_conversao      ?? 0,
          economiaGerada:    data.economia_total      ?? 0,
          agendamentos:      data.total_agendamentos  ?? 0,
          taxaResposta:      data.taxa_resposta       ?? 0,
          // Variações vindas da API — nunca mais hardcoded
          changeLeadsHoje:   data.change_leads_hoje   ?? null,
          changeLeadsMes:    data.change_leads_mes    ?? null,
          changeConversao:   data.change_conversao    ?? null,
          changeEconomia:    data.change_economia     ?? null,
          changeAgendamentos:data.change_agendamentos ?? null,
          changeTaxaResposta:data.change_taxa_resposta ?? null,
        },
        // Backend deve retornar: grafico: [{dia, valor}], leads: [{numero,cidade,conta,status,data}]
        grafico: data.grafico ?? [],
        leads:   data.leads   ?? [],
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      // Fallback por período — gráfico correto para cada seleção
      setDados(FALLBACK[periodo])
      setIsFallback(true)
    } finally {
      setLoading(false)
    }
  }, [periodo])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  // MELHORIA 3 CORRIGIDA: exportar CSV real com os leads do período
  const handleExportar = () => {
    if (!dados?.leads || dados.leads.length === 0) {
      alert('Nenhum lead para exportar no período selecionado.')
      return
    }

    const header = ['Número', 'Cidade', 'Conta (R$)', 'Status', 'Data']
    const rows = dados.leads.map((l) => [l.numero, l.cidade, l.conta, l.status, l.data])
    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${periodo}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw size={40} className="animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando métricas...</p>
        </div>
      </div>
    )
  }

  const m = dados.metrics

  return (
    <div className="space-y-6">

      {/* Banner de aviso quando dados são de demonstração */}
      {isFallback && <FallbackBanner />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Bem-vindo de volta! Aqui estão suas métricas.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
            <option value="90dias">Últimos 90 dias</option>
          </select>

          {/* MELHORIA 3 CORRIGIDA: botão Exportar agora gera CSV real */}
          <button
            onClick={handleExportar}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Leads Hoje"         value={m.leadsHoje}                              change={m.changeLeadsHoje}    icon={Users}       color="emerald" />
        <MetricCard title="Leads no Período"   value={m.leadsMes}                               change={m.changeLeadsMes}     icon={TrendingUp}  color="blue"    />
        <MetricCard title="Taxa de Conversão"  value={`${m.conversao}%`}                        change={m.changeConversao}    icon={CheckCircle} color="purple"  />
        <MetricCard title="Economia Gerada"    value={`R$ ${(m.economiaGerada/1000).toFixed(1)}k`} change={m.changeEconomia} icon={DollarSign}  color="amber"   />
      </div>

      {/* Segunda linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard title="Agendamentos"    value={m.agendamentos}       change={m.changeAgendamentos}  icon={Calendar} color="purple" />
        <MetricCard title="Taxa de Resposta" value={`${m.taxaResposta}%`} change={m.changeTaxaResposta} icon={Clock}    color="blue"   />
      </div>

      {/* Gráfico + Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads por período</h2>
          {dados.grafico.length > 0 ? (
            <SimpleBarChart data={dados.grafico} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">Nenhum dado de gráfico disponível.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo Rápido</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total de leads</span>
              <span className="font-semibold text-gray-900">{m.leadsMes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Agendamentos</span>
              <span className="font-semibold text-gray-900">{m.agendamentos}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taxa de agendamento</span>
              <span className="font-semibold text-gray-900">
                {m.leadsMes > 0 ? `${Math.round((m.agendamentos / m.leadsMes) * 100)}%` : '—'}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Economia média</span>
                <span className="text-sm text-gray-600">
                  {m.leadsMes > 0 ? `R$ ${Math.round(m.economiaGerada / m.leadsMes)} por lead` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Recentes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Leads Recentes</h2>
          {/* MELHORIA 4 CORRIGIDA: "Ver todos" agora navega para a página de leads */}
          <button
            onClick={() => window.location.href = '/cliente/leads'}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Ver todos →
          </button>
        </div>
        <TabelaLeads leads={dados.leads} />
      </div>

    </div>
  )
}

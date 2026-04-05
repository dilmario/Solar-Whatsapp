'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp, Users, Calendar, DollarSign,
  Clock, CheckCircle, XCircle, Download,
  RefreshCw, AlertCircle, Zap, Target,
} from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoeda(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v || 0)
}

function fmtData(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const ESTAGIO_LABEL = {
  inicio: 'Início', descoberta: 'Descoberta', qualificacao: 'Qualificação',
  simulacao: 'Simulação', proposta: 'Proposta', agendamento: 'Agendamento', followup: 'Follow-up',
}

const ESTAGIO_COR = {
  inicio: 'bg-gray-100 text-gray-600',
  descoberta: 'bg-blue-100 text-blue-700',
  qualificacao: 'bg-yellow-100 text-yellow-700',
  simulacao: 'bg-purple-100 text-purple-700',
  proposta: 'bg-orange-100 text-orange-700',
  agendamento: 'bg-emerald-100 text-emerald-700',
  followup: 'bg-pink-100 text-pink-700',
}

const PERFIL_COR = {
  ANALITICO: 'text-blue-600', PRATICO: 'text-emerald-600',
  EMOCIONAL: 'text-pink-600', DESCONFIADO: 'text-orange-600',
}

// ── Componentes ──────────────────────────────────────────────────────────────

function MetricCard({ title, value, sub, icon: Icon, color = 'emerald', loading }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    pink: 'bg-pink-50 text-pink-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          {loading
            ? <div className="h-7 w-24 bg-gray-100 rounded animate-pulse mt-1" />
            : <p className="text-2xl font-bold text-gray-900">{value}</p>}
          {sub && !loading && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}><Icon size={18} /></div>
      </div>
    </div>
  )
}

function ScoreBadge({ score }) {
  const cor = score >= 70 ? 'bg-emerald-100 text-emerald-700'
    : score >= 40 ? 'bg-yellow-100 text-yellow-700'
    : 'bg-gray-100 text-gray-500'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cor}`}>
      <Zap size={10} />{score}
    </span>
  )
}

function FunilBar({ por_estagio }) {
  const estagios = ['inicio', 'descoberta', 'qualificacao', 'simulacao', 'proposta', 'agendamento']
  const total = Object.values(por_estagio || {}).reduce((a, b) => a + b, 0) || 1
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Funil de conversão</h3>
      <div className="space-y-2">
        {estagios.map(e => {
          const v = (por_estagio || {})[e] || 0
          const pct = Math.round((v / total) * 100)
          return (
            <div key={e} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-24 shrink-0">{ESTAGIO_LABEL[e]}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700 w-6 text-right">{v}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [metricas, setMetricas] = useState(null)
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [filtroEstagio, setFiltroEstagio] = useState('todos')

  const carregar = useCallback(async () => {
    setLoading(true)
    setErro('')
    try {
      const [mRes, lRes] = await Promise.all([
        fetch(`${API_BASE}/api/metricas`),
        fetch(`${API_BASE}/api/leads?limit=200`),
      ])
      if (!mRes.ok || !lRes.ok) throw new Error('Erro na API')
      const [m, l] = await Promise.all([mRes.json(), lRes.json()])
      setMetricas(m)
      setLeads(l.leads || [])
    } catch (e) {
      setErro('Não foi possível conectar ao backend. Verifique se está rodando.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // Auto-refresh a cada 30s
  useEffect(() => {
    const id = setInterval(carregar, 30000)
    return () => clearInterval(id)
  }, [carregar])

  const leadsFiltrados = leads.filter(l => {
    const termo = busca.toLowerCase()
    const numero = (l.numero || '').toLowerCase()
    const cidade = (l.dados?.cidade || '').toLowerCase()
    const nome = (l.dados?.nome || '').toLowerCase()
    const matchBusca = !busca || numero.includes(termo) || cidade.includes(termo) || nome.includes(termo)
    const matchEstagio = filtroEstagio === 'todos' || l.estagio === filtroEstagio
    return matchBusca && matchEstagio
  })

  function exportarCSV() {
    const cols = ['Número', 'Nome', 'Cidade', 'Conta (R$)', 'Score', 'Estágio', 'Perfil', 'Atualizado']
    const rows = leads.map(l => [
      l.numero, l.dados?.nome || '', l.dados?.cidade || '',
      l.dados?.conta || '', l.lead_score, ESTAGIO_LABEL[l.estagio] || l.estagio,
      l.perfil_detectado || '', fmtData(l.atualizado_em),
    ])
    const csv = [cols, ...rows].map(r => r.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Solar</h1>
            <p className="text-sm text-gray-500 mt-0.5">Leads via WhatsApp · atualiza a cada 30s</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportarCSV} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
              <Download size={15} /> Exportar CSV
            </button>
            <button onClick={carregar} className="flex items-center gap-2 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Atualizar
            </button>
          </div>
        </div>

        {erro && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
            <AlertCircle size={16} /> {erro}
          </div>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total de Leads" value={metricas?.total_leads ?? '—'} icon={Users} color="blue" loading={loading} />
          <MetricCard title="Leads Quentes" value={metricas?.leads_quentes ?? '—'} sub="Momento de compra detectado" icon={Target} color="pink" loading={loading} />
          <MetricCard title="Score Médio" value={metricas ? `${metricas.score_medio}/100` : '—'} icon={TrendingUp} color="purple" loading={loading} />
          <MetricCard title="Conta Média" value={metricas ? fmtMoeda(metricas.conta_media) : '—'} sub={metricas ? `Economia est.: ${fmtMoeda(metricas.economia_media_estimada)}/mês` : ''} icon={DollarSign} color="amber" loading={loading} />
        </div>

        {/* Funil */}
        {metricas && <FunilBar por_estagio={metricas.por_estagio} />}

        {/* Tabela de Leads */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Buscar por número, nome ou cidade..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={filtroEstagio}
              onChange={e => setFiltroEstagio(e.target.value)}
            >
              <option value="todos">Todos os estágios</option>
              {Object.entries(ESTAGIO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Contato</th>
                  <th className="px-5 py-3 font-medium">Dados</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Estágio</th>
                  <th className="px-5 py-3 font-medium">Perfil</th>
                  <th className="px-5 py-3 font-medium">Atualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
                {!loading && leadsFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                      Nenhum lead encontrado
                    </td>
                  </tr>
                )}
                {!loading && leadsFiltrados.map(l => (
                  <tr key={l.usuario_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{l.dados?.nome || `Lead ${l.numero?.slice(-4)}`}</p>
                      <p className="text-xs text-gray-400">{l.numero}</p>
                      {l.momento_de_compra && (
                        <span className="inline-flex items-center gap-1 text-xs text-pink-600 font-semibold mt-1">
                          <Zap size={10} /> Quente
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-700">{l.dados?.cidade || '—'}</p>
                      <p className="text-xs text-gray-400">{l.dados?.conta ? fmtMoeda(l.dados.conta) + '/mês' : 'Conta não informada'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <ScoreBadge score={l.lead_score} />
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTAGIO_COR[l.estagio] || 'bg-gray-100 text-gray-600'}`}>
                        {ESTAGIO_LABEL[l.estagio] || l.estagio}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold ${PERFIL_COR[l.perfil_detectado] || 'text-gray-500'}`}>
                        {l.perfil_detectado || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {fmtData(l.atualizado_em)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && leadsFiltrados.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              {leadsFiltrados.length} lead{leadsFiltrados.length !== 1 ? 's' : ''} exibido{leadsFiltrados.length !== 1 ? 's' : ''}
              {leads.length !== leadsFiltrados.length && ` de ${leads.length}`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

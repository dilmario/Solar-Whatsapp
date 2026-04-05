'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Download, RefreshCw, AlertCircle, Zap, MapPin, Phone, DollarSign } from 'lucide-react'

// CORRIGIDO: usa variável de ambiente — não mais IP hardcoded
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

const ESTAGIO_LABEL = {
  inicio: 'Início', descoberta: 'Descoberta', qualificacao: 'Qualificação',
  simulacao: 'Simulação', proposta: 'Proposta', agendamento: 'Agendamento', followup: 'Follow-up',
}

const ESTAGIO_COR = {
  inicio: 'bg-gray-100 text-gray-600', descoberta: 'bg-blue-100 text-blue-700',
  qualificacao: 'bg-yellow-100 text-yellow-700', simulacao: 'bg-purple-100 text-purple-700',
  proposta: 'bg-orange-100 text-orange-700', agendamento: 'bg-emerald-100 text-emerald-700',
  followup: 'bg-pink-100 text-pink-700',
}

function fmtMoeda(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v || 0)
}

function fmtData(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroEstagio, setFiltroEstagio] = useState('todos')
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    setErro('')
    try {
      const res = await fetch(`${API_BASE}/api/leads?limit=500`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setLeads(data.leads || [])
    } catch (e) {
      setErro('Não foi possível carregar os leads.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const leadsFiltrados = leads.filter(l => {
    const termo = busca.toLowerCase()
    const match = !busca
      || (l.numero || '').includes(termo)
      || (l.dados?.nome || '').toLowerCase().includes(termo)
      || (l.dados?.cidade || '').toLowerCase().includes(termo)
      || (l.dados?.email || '').toLowerCase().includes(termo)
    const matchEstagio = filtroEstagio === 'todos' || l.estagio === filtroEstagio
    return match && matchEstagio
  })

  function exportarCSV() {
    const cols = ['Número', 'Nome', 'Cidade', 'Imóvel', 'Telhado', 'Email', 'Conta', 'Score', 'Estágio', 'Perfil', 'Quente', 'Atualizado']
    const rows = leadsFiltrados.map(l => [
      l.numero, l.dados?.nome || '', l.dados?.cidade || '', l.dados?.imovel || '',
      l.dados?.telhado || '', l.dados?.email || '', l.dados?.conta || '',
      l.lead_score, ESTAGIO_LABEL[l.estagio] || l.estagio,
      l.perfil_detectado || '', l.momento_de_compra ? 'Sim' : 'Não',
      fmtData(l.atualizado_em),
    ])
    const csv = [cols, ...rows].map(r => r.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-5">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-sm text-gray-500 mt-0.5">{leads.length} lead{leads.length !== 1 ? 's' : ''} no total</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportarCSV} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
              <Download size={15} /> CSV
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

        {/* Filtros */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Buscar por número, nome, cidade ou email..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={filtroEstagio}
            onChange={e => setFiltroEstagio(e.target.value)}
          >
            <option value="todos">Todos os estágios</option>
            {Object.entries(ESTAGIO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Cards de leads */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}

          {!loading && leadsFiltrados.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">Nenhum lead encontrado</div>
          )}

          {!loading && leadsFiltrados.map(l => (
            <div key={l.usuario_id} className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow ${l.momento_de_compra ? 'border-pink-200' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{l.dados?.nome || `Lead ${l.numero?.slice(-4)}`}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Phone size={10} /> {l.numero}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTAGIO_COR[l.estagio] || 'bg-gray-100 text-gray-600'}`}>
                    {ESTAGIO_LABEL[l.estagio] || l.estagio}
                  </span>
                  {l.momento_de_compra && (
                    <span className="text-xs text-pink-600 font-semibold flex items-center gap-1">
                      <Zap size={10} /> Quente
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                {l.dados?.cidade && (
                  <p className="flex items-center gap-1.5 text-gray-600">
                    <MapPin size={13} className="text-gray-400" /> {l.dados.cidade}
                    {l.dados?.imovel && <span className="text-gray-400">· {l.dados.imovel}</span>}
                  </p>
                )}
                {l.dados?.conta && (
                  <p className="flex items-center gap-1.5 text-gray-600">
                    <DollarSign size={13} className="text-gray-400" />
                    Conta: {fmtMoeda(l.dados.conta)}/mês
                    <span className="text-emerald-600 text-xs">→ ec. {fmtMoeda(l.dados.conta * 0.83)}</span>
                  </p>
                )}
                {l.dados?.email && (
                  <p className="text-xs text-gray-400 truncate">{l.dados.email}</p>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className={`h-1.5 rounded-full ${l.lead_score >= 33 ? 'bg-emerald-500' : 'bg-gray-200'} w-4`} />
                    <div className={`h-1.5 rounded-full ${l.lead_score >= 66 ? 'bg-emerald-500' : 'bg-gray-200'} w-4`} />
                    <div className={`h-1.5 rounded-full ${l.lead_score >= 90 ? 'bg-emerald-500' : 'bg-gray-200'} w-4`} />
                  </div>
                  <span className="text-xs text-gray-500">Score {l.lead_score}</span>
                </div>
                <span className="text-xs text-gray-400">{fmtData(l.atualizado_em)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw
} from 'lucide-react'

// Componente de Card para métricas
function MetricCard({ title, value, change, icon: Icon, color = 'emerald' }) {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-xs text-emerald-600 mt-1">↑ {change} em relação ao mês passado</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

// Componente de Gráfico Simples (barras)
function SimpleBarChart({ data }) {
  const max = Math.max(...data.map(d => d.valor))

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

// Componente de Tabela de Leads
function TabelaLeads({ leads }) {
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

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [dados, setDados] = useState(null)
  const [periodo, setPeriodo] = useState('7dias')
  
  const response = await fetch('http://192.168.0.30:5000/consultor/stats')
const data = await response.json()
}
  

  return (
    <div className="space-y-6">
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
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm">
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Leads Hoje"
          value={dados.metrics.leadsHoje}
          change="+15%"
          icon={Users}
          color="emerald"
        />
        <MetricCard
          title="Leads no Mês"
          value={dados.metrics.leadsMes}
          change="+8%"
          icon={TrendingUp}
          color="blue"
        />
        <MetricCard
          title="Taxa de Conversão"
          value={`${dados.metrics.conversao}%`}
          change="+5%"
          icon={CheckCircle}
          color="purple"
        />
        <MetricCard
          title="Economia Gerada"
          value={`R$ ${(dados.metrics.economiaGerada / 1000).toFixed(1)}k`}
          change="+12%"
          icon={DollarSign}
          color="amber"
        />
      </div>

      {/* Segunda linha de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Agendamentos"
          value={dados.metrics.agendamentos}
          change="+23%"
          icon={Calendar}
          color="purple"
        />
        <MetricCard
          title="Taxa de Resposta"
          value={`${dados.metrics.taxaResposta}%`}
          change="+2%"
          icon={Clock}
          color="blue"
        />
      </div>

      {/* Gráfico e Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads por Dia</h2>
          <SimpleBarChart data={dados.grafico} />
        </div>

        {/* Resumo Rápido */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo Rápido</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total de leads</span>
              <span className="font-semibold text-gray-900">{dados.metrics.leadsMes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Agendamentos</span>
              <span className="font-semibold text-gray-900">{dados.metrics.agendamentos}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taxa de agendamento</span>
              <span className="font-semibold text-gray-900">
                {Math.round((dados.metrics.agendamentos / dados.metrics.leadsMes) * 100)}%
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Economia média</span>
                <span className="text-sm text-gray-600">
                  R$ {Math.round(dados.metrics.economiaGerada / dados.metrics.leadsMes)} por lead
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Leads Recentes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Leads Recentes</h2>
          <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            Ver todos
          </button>
        </div>
        <TabelaLeads leads={dados.leads} />
      </div>
    </div>
  )
}
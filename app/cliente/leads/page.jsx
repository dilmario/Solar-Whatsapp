'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Download, Calendar, MapPin, Phone, Mail, DollarSign, RefreshCw } from 'lucide-react'

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState('')

  // Função para carregar leads do backend
  const carregarLeads = async () => {
    setLoading(true)
    setErro('')
    
    try {
      const response = await fetch('http://192.168.0.30:5000/consultor/leads')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Leads recebidos:', data)
      
      if (data.leads && Array.isArray(data.leads)) {
        // Mapear os dados do backend para o formato da tabela
        const leadsFormatados = data.leads.map((lead, index) => ({
          id: index + 1,
          numero: lead.numero,
          nome: `Lead ${lead.numero.slice(-4)}`, // Pode ser melhorado se tiver nome
          cidade: lead.cidade || 'Não informada',
          conta: lead.conta || 0,
          rede: lead.rede || 'Não informada',
          email: lead.email || 'sem@email.com',
          status: lead.agendamento ? 'agendado' : 'qualificado',
          data: lead.fim ? new Date(lead.fim).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
          economia: Math.round((lead.conta || 0) * 0.85)
        }))
        setLeads(leadsFormatados)
      } else {
        setLeads([])
      }
    } catch (error) {
      console.error('Erro ao carregar leads:', error)
      setErro('Não foi possível carregar os leads. Tente novamente.')
      // Dados simulados para fallback
      setLeads([
        {
          id: 1,
          numero: '(21) 99999-0001',
          nome: 'João Silva',
          cidade: 'Rio de Janeiro - RJ',
          conta: 450,
          rede: 'bifásica',
          email: 'joao@email.com',
          status: 'agendado',
          data: '08/03/2026',
          economia: 385
        },
        {
          id: 2,
          numero: '(11) 98888-0002',
          nome: 'Maria Santos',
          cidade: 'São Paulo - SP',
          conta: 380,
          rede: 'trifásica',
          email: 'maria@email.com',
          status: 'qualificado',
          data: '08/03/2026',
          economia: 323
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarLeads()
  }, [])

  const leadsFiltrados = leads.filter(lead => {
    if (filtro !== 'todos' && lead.status !== filtro) return false
    if (busca && !lead.nome.toLowerCase().includes(busca.toLowerCase()) && 
        !lead.numero.includes(busca) && 
        !lead.cidade.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const statusColors = {
    agendado: 'bg-green-100 text-green-700',
    qualificado: 'bg-blue-100 text-blue-700',
    pendente: 'bg-yellow-100 text-yellow-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500">Gerencie todos os leads qualificados</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={carregarLeads}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <RefreshCw size={16} className="text-gray-500" />
            Atualizar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm">
            <Download size={16} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Mensagem de erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {erro}
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou cidade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Todos os leads</option>
              <option value="agendado">Agendados</option>
              <option value="qualificado">Qualificados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Leads */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Contato</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Localização</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Conta</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Economia</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Data</th>
               </tr>
            </thead>
            <tbody>
              {leadsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    Nenhum lead encontrado
                  </td>
                </tr>
              ) : (
                leadsFiltrados.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{lead.nome}</div>
                      <div className="text-xs text-gray-500">Rede {lead.rede}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Phone size={14} className="text-gray-400" />
                        {lead.numero}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Mail size={12} className="text-gray-400" />
                        {lead.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <MapPin size={14} className="text-gray-400" />
                        {lead.cidade}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                        <DollarSign size={14} className="text-gray-400" />
                        R$ {lead.conta}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-emerald-600">
                        R$ {lead.economia}/mês
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Calendar size={14} className="text-gray-400" />
                        {lead.data}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação simples */}
      {leadsFiltrados.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando {leadsFiltrados.length} de {leads.length} leads
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Anterior
            </button>
            <button className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
              1
            </button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
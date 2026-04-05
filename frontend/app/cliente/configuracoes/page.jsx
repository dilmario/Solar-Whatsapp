'use client'

import { useState } from 'react'
import { Save, Bell, Shield, Globe, Smartphone, CreditCard, Users, CalendarDays, RefreshCw, Zap } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const handleSalvar = () => {
    setSalvando(true)
    setTimeout(() => {
      setSalvando(false)
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500">Gerencie as configurações da sua conta</p>
      </div>

      {/* Notificação de sucesso */}
      {sucesso && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Save size={16} />
          Configurações salvas com sucesso!
        </div>
      )}

      {/* Perfil da Empresa */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={20} className="text-emerald-600" />
          Perfil da Empresa
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Empresa
            </label>
            <input
              type="text"
              defaultValue="Consultor Solar AI"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ
            </label>
            <input
              type="text"
              defaultValue="12.345.678/0001-90"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço Completo
            </label>
            <input
              type="text"
              defaultValue="Av. Paulista, 1000 - São Paulo, SP"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Integrações */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe size={20} className="text-emerald-600" />
          Integrações
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Smartphone size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">WhatsApp Business</p>
                <p className="text-xs text-gray-500">Conectado via Evolution API</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Ativo
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <CalendarDays size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Cal.com</p>
                <p className="text-xs text-gray-500">Agendamento automático</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Conectado
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Claude AI</p>
                <p className="text-xs text-gray-500">Consultoria inteligente</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Ativo
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                <CreditCard size={16} className="text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Mercado Pago</p>
                <p className="text-xs text-gray-500">Não configurado</p>
              </div>
            </div>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
              Configurar
            </button>
          </div>
        </div>
      </div>

      {/* Notificações */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell size={20} className="text-emerald-600" />
          Notificações
        </h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Novo lead qualificado</span>
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Reunião agendada</span>
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Relatório diário por email</span>
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
          </label>
        </div>
      </div>

      {/* Segurança */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={20} className="text-emerald-600" />
          Segurança
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email atual
            </label>
            <input
              type="email"
              defaultValue="contato@empresa.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nova senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar nova senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <button
          onClick={handleSalvar}
          disabled={salvando}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {salvando ? 'Salvando...' : 'Salvar Configurações'}
          {!salvando && <Save size={18} />}
        </button>
      </div>
    </div>
  )
}
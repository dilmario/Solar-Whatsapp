'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sun, Mail, Lock, ArrowRight, Zap, Shield, Users, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const whatsappLink = "https://wa.me/5521999999999?text=Olá! Gostaria de saber mais sobre o Consultor Solar"

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    // Simulação de login (depois integrar com backend real)
    setTimeout(() => {
      if (email === 'demo@consultorsolar.com' && senha === '123456') {
        localStorage.setItem('auth', 'true')
        router.push('/cliente/dashboard')
      } else {
        setErro('Email ou senha inválidos')
        setLoading(false)
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Lado Esquerdo - Imagem e Conteúdo (2/3 da página) */}
      <div className="hidden lg:block lg:w-2/3 relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 overflow-hidden">
        {/* Padrão de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Conteúdo da imagem */}
        <div className="relative h-full flex flex-col items-center justify-center text-white p-12">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
                <Sun className="text-white" size={36} />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Consultor Solar</h2>
                <p className="text-emerald-100">Automação para WhatsApp</p>
              </div>
            </div>
          </div>

          {/* Imagem ilustrativa (simulada com ícones) */}
          <div className="relative w-full max-w-lg mx-auto mt-8">
            {/* Card de exemplo */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500">
                  <Zap className="text-white" size={24} />
                </div>
                <div>
                  <p className="font-semibold">+2.500 leads gerados</p>
                  <p className="text-sm text-emerald-100">este mês</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-emerald-300 rounded-full"></div>
                  <p className="text-sm">Qualificação inteligente de leads</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-emerald-300 rounded-full"></div>
                  <p className="text-sm">Agendamento automático</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-emerald-300 rounded-full"></div>
                  <p className="text-sm">Follow-up em 3 etapas</p>
                </div>
              </div>
            </div>

            {/* Estatísticas flutuantes */}
            <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-emerald-200" />
                <span className="text-sm font-medium">+50% conversão</span>
              </div>
            </div>
            
            <div className="absolute -bottom-8 -left-4 bg-white/10 backdrop-blur-lg rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-200" />
                <span className="text-sm font-medium">ROI em 30 dias</span>
              </div>
            </div>
          </div>

          {/* Depoimento */}
          <div className="absolute bottom-8 left-8 right-8 text-center">
            <p className="text-sm text-emerald-100 italic">
              "Aumentamos nossa conversão em 50% no primeiro mês."
            </p>
            <p className="text-xs text-emerald-200 mt-2">— João Silva, Solar Energy SP</p>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login (1/3 da página) */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-sm w-full">
          {/* Logo para mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 mb-4">
              <Sun className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Consultor Solar</h1>
            <p className="text-sm text-gray-600">Área do Cliente</p>
          </div>

          {/* Card de Login */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Bem-vindo de volta! 👋</h2>
            <p className="text-sm text-gray-500 mb-6">Acesse sua conta para gerenciar seus leads</p>

            {erro && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                <Shield size={16} />
                {erro}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                    placeholder="••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarSenha ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm text-gray-600">Lembrar-me</span>
                </label>
                <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-2.5 px-4 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <a 
                  href={whatsappLink} 
                  className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Fale conosco
                  <ArrowRight size={14} />
                </a>
              </p>
            </div>

            {/* Credenciais de teste */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Credenciais de teste: <span className="font-mono bg-gray-100 px-2 py-1 rounded">demo@consultorsolar.com / 123456</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
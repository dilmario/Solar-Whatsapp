'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Sun, Mail, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  // Adicione esta linha dentro do componente LoginPage
  const whatsappLink = useMemo(() => {
  const phone = "5521999999999"  // 👈 Substitua pelo seu número
  const text = encodeURIComponent(
    "Olá! Gostaria de saber mais sobre o Consultor Solar"
  )
  return `https://wa.me/${phone}?text=${text}`
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    // Simulação de login (depois integrar com backend real)
    setTimeout(() => {
      if (email === 'demo@consultorsolar.com' && senha === '123456') {
        router.push('/cliente/dashboard')
      } else {
        setErro('Email ou senha inválidos')
        setLoading(false)
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 mb-4">
            <Sun className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Consultor Solar</h1>
          <p className="text-sm text-gray-600">Área do Cliente</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Acesse sua conta</h2>

          {erro && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                <span className="text-sm text-gray-600">Lembrar-me</span>
              </label>
              <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700">
                Esqueceu a senha?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <a href={whatsappLink} className="text-emerald-600 hover:text-emerald-700 font-medium">
                Fale conosco
              </a>
            </p>
          </div>
        </div>

        {/* Credenciais de teste */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Demo: demo@consultorsolar.com / 123456
          </p>
        </div>
      </div>
    </div>
  )
}
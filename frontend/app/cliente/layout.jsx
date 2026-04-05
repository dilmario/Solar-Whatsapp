'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Sun
} from 'lucide-react'

// Componente do Menu (só aparece após login)
function MenuLateral({ pathname, setSidebarOpen, sidebarOpen }) {
  const router = useRouter()

  const menuItems = [
    { 
      name: 'Dashboard', 
      href: '/cliente/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      name: 'Leads', 
      href: '/cliente/leads', 
      icon: Users 
    },
    { 
      name: 'Configurações', 
      href: '/cliente/configuracoes', 
      icon: Settings 
    }
  ]

  const handleLogout = () => {
    // Limpar dados de autenticação (depois implementar)
    localStorage.removeItem('auth')
    router.push('/cliente')
  }

  const isActive = (path) => pathname === path

  return (
    <>
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-200 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
              <Sun className="text-white" size={16} />
            </div>
            <span className="font-semibold text-gray-900">Consultor Solar</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive(item.href)
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}

          <div className="pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Sair</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  )
}

export default function ClienteLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar se está na página de login
  const isLoginPage = pathname === '/cliente'

  // Verificar autenticação (simulado - depois implementar com backend real)
  useEffect(() => {
    const auth = localStorage.getItem('auth')
    setIsAuthenticated(!!auth)

    // Se não estiver na página de login e não estiver autenticado, redirecionar
    if (!isLoginPage && !auth) {
      router.push('/cliente')
    }
  }, [pathname, router, isLoginPage])

  // Se estiver na página de login, mostrar apenas o conteúdo (sem menu)
  if (isLoginPage) {
    return <>{children}</>
  }

  // Se não estiver autenticado, não mostrar nada (redirecionamento acontece no useEffect)
  if (!isAuthenticated) {
    return null
  }

  // Páginas autenticadas - mostrar com menu
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>
            <Link href="/cliente/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 lg:hidden">
                <Sun className="text-white" size={16} />
              </div>
              <span className="font-semibold text-gray-900 lg:hidden">Consultor Solar</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-emerald-700">AD</span>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Lateral */}
      <MenuLateral 
        pathname={pathname} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

      {/* Conteúdo Principal */}
      <main className="lg:ml-64">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
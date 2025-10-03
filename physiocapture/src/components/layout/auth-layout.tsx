'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { 
  Users, 
  FileText, 
  Home,
  LogOut,
  User,
  Settings,
  Activity,
  Bell,
  Search,
  Menu,
  X,
  UserCog
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { canManageUsers } from '@/lib/permissions'
import type { UserRole } from '@/lib/permissions'

const baseNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Visão geral do sistema', roles: ['ADMIN', 'MANAGER', 'PHYSIOTHERAPIST', 'RECEPTIONIST'] },
  { name: 'Pacientes', href: '/patients', icon: Users, description: 'Gerenciar pacientes', roles: ['ADMIN', 'MANAGER', 'PHYSIOTHERAPIST', 'RECEPTIONIST'] },
  { name: 'Documentos', href: '/documents', icon: FileText, description: 'Upload e gerenciamento de arquivos', roles: ['ADMIN', 'MANAGER', 'PHYSIOTHERAPIST', 'RECEPTIONIST'] },
  { name: 'Usuários', href: '/users', icon: UserCog, description: 'Gerenciar usuários da clínica', roles: ['ADMIN'] },
]

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Filtrar navegação baseado no role do usuário
  const navigation = useMemo(() => {
    const userRole = session?.user?.role as UserRole | undefined
    if (!userRole) return []
    
    return baseNavigation.filter(item => item.roles.includes(userRole))
  }, [session?.user?.role])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo e header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200/50 bg-gradient-to-r from-primary-50/30 to-secondary-50/30">
          <Logo variant="compact" size="md" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-6 py-8 space-y-3 flex-1">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Menu Principal
            </p>
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'group flex items-center space-x-4 px-4 py-4 rounded-2xl text-sm font-medium transition-all duration-200 relative overflow-hidden',
                    isActive
                      ? 'bg-gradient-primary text-white shadow-primary-lg transform scale-[1.02]'
                      : 'text-gray-700 hover:text-primary-700 hover:bg-primary-50/70 hover-lift'
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 animate-pulse" />
                  )}
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 relative z-10',
                    isActive 
                      ? 'bg-white/20 text-white group-hover:scale-110' 
                      : 'bg-primary-100 text-primary-600 group-hover:bg-primary-200 group-hover:scale-110'
                  )}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 relative z-10">
                    <span className="block font-semibold">{item.name}</span>
                    <span className={cn(
                      'text-xs opacity-80',
                      isActive ? 'text-white/80' : 'text-gray-500'
                    )}>
                      {item.description}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User info e logout */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-gray-100/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-primary">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 hover-lift"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          {/* Role badge */}
          {session?.user?.role && (
            <div className="flex items-center justify-center">
              <span className={cn(
                "inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium",
                session.user.role === 'ADMIN' && "bg-purple-100 text-purple-700",
                session.user.role === 'MANAGER' && "bg-blue-100 text-blue-700",
                session.user.role === 'PHYSIOTHERAPIST' && "bg-green-100 text-green-700",
                session.user.role === 'RECEPTIONIST' && "bg-orange-100 text-orange-700"
              )}>
                {session.user.role === 'ADMIN' && 'Administrador'}
                {session.user.role === 'MANAGER' && 'Gestor'}
                {session.user.role === 'PHYSIOTHERAPIST' && 'Fisioterapeuta'}
                {session.user.role === 'RECEPTIONIST' && 'Recepcionista'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top bar mobile */}
        <div className="lg:hidden flex items-center justify-between h-16 px-6 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Logo variant="compact" size="sm" />
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Main content area */}
        <main className="p-6 lg:p-8 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
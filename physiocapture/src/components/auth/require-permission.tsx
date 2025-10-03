'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { UserRole } from '@/lib/permissions'
import { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface RequirePermissionProps {
  children: ReactNode
  allowedRoles: UserRole[]
  fallback?: ReactNode
}

export function RequirePermission({ children, allowedRoles, fallback }: RequirePermissionProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    redirect('/auth/signin')
  }

  const userRole = session.user?.role as UserRole

  if (!allowedRoles.includes(userRole)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
        <p className="text-gray-600 text-center max-w-md">
          Você não tem permissão para acessar esta página. Esta funcionalidade é restrita a determinados perfis de usuário.
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          Voltar
        </button>
      </div>
    )
  }

  return <>{children}</>
}

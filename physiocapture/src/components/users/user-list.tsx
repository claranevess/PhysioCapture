'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Search, 
  Plus, 
  Shield, 
  Briefcase, 
  Stethoscope, 
  UserCircle,
  Edit,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'PHYSIOTHERAPIST' | 'RECEPTIONIST'
  crm?: string | null
  phone?: string | null
  isActive: boolean
  createdAt: string
  lastLoginAt?: string | null
  _count: {
    assignedPatients: number
    consultations: number
  }
}

const roleConfig = {
  ADMIN: {
    label: 'Administrador',
    icon: Shield,
    color: 'bg-red-100 text-red-700 border-red-200',
  },
  MANAGER: {
    label: 'Gestor',
    icon: Briefcase,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  PHYSIOTHERAPIST: {
    label: 'Fisioterapeuta',
    icon: Stethoscope,
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  RECEPTIONIST: {
    label: 'Recepcionista',
    icon: UserCircle,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
}

interface UserListProps {
  onAddUser?: () => void
  onEditUser?: (user: User) => void
}

export function UserList({ onAddUser, onEditUser }: UserListProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadUsers()
  }, [search, roleFilter, statusFilter])

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (statusFilter !== 'all') params.append('isActive', statusFilter)

      const response = await fetch(`/api/users?${params}`)
      const data = await response.json()

      if (response.ok) {
        setUsers(data.data)
      } else {
        toast.error(data.error || 'Erro ao carregar usuários')
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        toast.success(currentStatus ? 'Usuário desativado' : 'Usuário ativado')
        loadUsers()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao alterar status')
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status do usuário')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Carregando usuários...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Usuários da Clínica</CardTitle>
              <Badge variant="secondary">{users.length}</Badge>
            </div>
            {onAddUser && (
              <Button onClick={onAddUser}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Usuário
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as funções" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as funções</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="MANAGER">Gestor</SelectItem>
                <SelectItem value="PHYSIOTHERAPIST">Fisioterapeuta</SelectItem>
                <SelectItem value="RECEPTIONIST">Recepcionista</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="true">Ativos</SelectItem>
                <SelectItem value="false">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuários */}
      <div className="grid grid-cols-1 gap-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Nenhum usuário encontrado
            </CardContent>
          </Card>
        ) : (
          users.map((user) => {
            const RoleIcon = roleConfig[user.role].icon

            return (
              <Card key={user.id} className={!user.isActive ? 'opacity-60' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg border ${roleConfig[user.role].color}`}>
                        <RoleIcon className="h-6 w-6" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          {!user.isActive && (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>📧 {user.email}</div>
                          {user.phone && <div>📞 {user.phone}</div>}
                          {user.crm && <div>🏥 CRM: {user.crm}</div>}
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="outline" className={roleConfig[user.role].color}>
                            {roleConfig[user.role].label}
                          </Badge>

                          {user.role === 'PHYSIOTHERAPIST' && (
                            <>
                              <span className="text-muted-foreground">
                                👥 {user._count.assignedPatients} pacientes
                              </span>
                              <span className="text-muted-foreground">
                                📋 {user._count.consultations} consultas
                              </span>
                            </>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Cadastrado{' '}
                          {formatDistanceToNow(new Date(user.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                          {user.lastLoginAt && (
                            <>
                              {' • Último acesso '}
                              {formatDistanceToNow(new Date(user.lastLoginAt), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onEditUser && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant={user.isActive ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                      >
                        {user.isActive ? (
                          <>
                            <ToggleLeft className="h-4 w-4 mr-1" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <ToggleRight className="h-4 w-4 mr-1" />
                            Ativar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { UserRole } from '@prisma/client'

const userFormSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  role: z.enum(['ADMIN', 'MANAGER', 'PHYSIOTHERAPIST', 'RECEPTIONIST']),
  crm: z.string().optional(),
  cpf: z.string().optional(),
  phone: z.string().optional(),
})

type UserFormData = z.infer<typeof userFormSchema>

interface UserFormProps {
  user?: any
  onSuccess?: () => void
  onCancel?: () => void
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gestor',
  PHYSIOTHERAPIST: 'Fisioterapeuta',
  RECEPTIONIST: 'Recepcionista',
}

const roleDescriptions: Record<UserRole, string> = {
  ADMIN: 'Acesso total à clínica, pode gerenciar usuários e configurações',
  MANAGER: 'Visualiza todos os pacientes, gera relatórios e métricas',
  PHYSIOTHERAPIST: 'Atende pacientes atribuídos, cria consultas e documentos',
  RECEPTIONIST: 'Cadastra pacientes e faz upload de documentos',
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!user

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user
      ? {
          email: user.email,
          name: user.name,
          role: user.role,
          crm: user.crm || '',
          cpf: user.cpf || '',
          phone: user.phone || '',
        }
      : {
          role: 'PHYSIOTHERAPIST',
        },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: UserFormData) => {
    setLoading(true)
    try {
      const url = isEditing ? `/api/users/${user.id}` : '/api/users'
      const method = isEditing ? 'PATCH' : 'POST'

      // Remover password se estiver vazio no modo edição
      const payload = { ...data }
      if (isEditing && !data.password) {
        delete payload.password
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar usuário')
      }

      toast.success(isEditing ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!')
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar usuário')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome */}
        <div className="md:col-span-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Ex: Dr. João Silva"
            className="mt-1"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="email@exemplo.com"
            className="mt-1"
            disabled={isEditing} // Não permite alterar email ao editar
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Senha */}
        <div>
          <Label htmlFor="password">
            {isEditing ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha *'}
          </Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder="••••••••"
            className="mt-1"
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Role */}
        <div className="md:col-span-2">
          <Label htmlFor="role">Função *</Label>
          <Select
            value={selectedRole}
            onValueChange={(value) => setValue('role', value as UserRole)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(roleLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">
                      {roleDescriptions[value as UserRole]}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
          )}
        </div>

        {/* CRM (apenas para fisioterapeutas) */}
        {selectedRole === 'PHYSIOTHERAPIST' && (
          <div>
            <Label htmlFor="crm">CRM/CREFITO</Label>
            <Input
              id="crm"
              {...register('crm')}
              placeholder="Ex: 12345-SP"
              className="mt-1"
            />
          </div>
        )}

        {/* CPF */}
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            {...register('cpf')}
            placeholder="000.000.000-00"
            className="mt-1"
          />
        </div>

        {/* Telefone */}
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="(11) 99999-9999"
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : isEditing ? 'Atualizar Usuário' : 'Criar Usuário'}
        </Button>
      </div>
    </form>
  )
}

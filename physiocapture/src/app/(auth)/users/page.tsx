'use client'

import { useState } from 'react'
import { UserList } from '@/components/users/user-list'
import { UserForm } from '@/components/users/user-form'
import { RequirePermission } from '@/components/auth/require-permission'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Shield } from 'lucide-react'

export default function UsersPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const handleAddUser = () => {
    setSelectedUser(null)
    setShowDialog(true)
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setShowDialog(true)
  }

  const handleSuccess = () => {
    setShowDialog(false)
    setSelectedUser(null)
    // A lista se recarrega automaticamente
  }

  return (
    <RequirePermission allowedRoles={['ADMIN']}>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Gestão de Usuários
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie os profissionais da sua clínica
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-900">Apenas Administradores</p>
              <p className="text-blue-700">
                Esta área é exclusiva para administradores. Você pode criar novos usuários,
                editar permissões e ativar/desativar acessos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <UserList onAddUser={handleAddUser} onEditUser={handleEditUser} />

      {/* Dialog para criar/editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onSuccess={handleSuccess}
            onCancel={() => setShowDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
    </RequirePermission>
  )
}

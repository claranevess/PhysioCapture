// Sistema de permissões baseado em roles

export type UserRole = 'ADMIN' | 'MANAGER' | 'PHYSIOTHERAPIST' | 'RECEPTIONIST'

// Permissões de usuários
export function canManageUsers(role: UserRole): boolean {
  return role === 'ADMIN'
}

// Permissões de pacientes
export function canViewAllPatients(role: UserRole): boolean {
  return ['ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(role)
}

export function canCreatePatient(role: UserRole): boolean {
  return true // Todos podem criar
}

export function canEditPatient(role: UserRole): boolean {
  return true // Todos podem editar (seus pacientes ou todos, dependendo do role)
}

export function canDeletePatient(role: UserRole): boolean {
  return ['ADMIN', 'MANAGER'].includes(role)
}

export function canAssignPatient(role: UserRole): boolean {
  return ['ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(role)
}

// Permissões de consultas
export function canCreateConsultation(role: UserRole): boolean {
  return ['ADMIN', 'MANAGER', 'PHYSIOTHERAPIST'].includes(role)
}

export function canViewAllConsultations(role: UserRole): boolean {
  return ['ADMIN', 'MANAGER'].includes(role)
}

// Permissões de documentos
export function canUploadDocument(role: UserRole): boolean {
  return true // Todos podem fazer upload
}

export function canDeleteDocument(role: UserRole): boolean {
  return ['ADMIN', 'MANAGER'].includes(role)
}

// Permissões de configurações
export function canManageClinicSettings(role: UserRole): boolean {
  return role === 'ADMIN'
}

export function canViewReports(role: UserRole): boolean {
  return ['ADMIN', 'MANAGER'].includes(role)
}

// Helper para verificar múltiplas permissões
export function hasAnyPermission(role: UserRole, permissions: ((role: UserRole) => boolean)[]): boolean {
  return permissions.some(permission => permission(role))
}

export function hasAllPermissions(role: UserRole, permissions: ((role: UserRole) => boolean)[]): boolean {
  return permissions.every(permission => permission(role))
}

// Mensagens de erro por permissão
export function getPermissionErrorMessage(role: UserRole, action: string): string {
  const roleNames = {
    ADMIN: 'Administrador',
    MANAGER: 'Gestor',
    PHYSIOTHERAPIST: 'Fisioterapeuta',
    RECEPTIONIST: 'Recepcionista',
  }

  return `Seu perfil (${roleNames[role]}) não tem permissão para ${action}.`
}

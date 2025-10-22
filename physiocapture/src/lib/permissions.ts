// Sistema de permissões baseado em roles

import { db } from "@/lib/db";
import type { Session } from 'next-auth';

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

type SessionUser = Session['user'];


export async function canAccessPatientDocuments(user: SessionUser, patientId: string): Promise<boolean> {
  // 1. Busca o paciente e garante que ele pertence à mesma clínica do usuário
  const patient = await db.patient.findFirst({
    where: {
      id: patientId,
      clinicId: user.clinicId, // Garante o isolamento de dados entre clínicas
    },
  });

  // Se o paciente não existe ou não pertence à clínica do usuário, nega o acesso.
  if (!patient) {
    return false;
  }

  // ADMIN, MANAGER e RECEPTIONIST podem ver todos os pacientes da clínica.
  if (user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'RECEPTIONIST') {
    return true;
  }

  // PHYSIOTHERAPIST só pode acessar pacientes que são atribuídos a ele.
  if (user.role === 'PHYSIOTHERAPIST') {
    return patient.assignedTherapistId === user.id;
  }

  // Nega por padrão se nenhuma regra for atendida.
  return false;
}

export function canDeleteDocuments(user: SessionUser): boolean {
  return user.role === 'ADMIN' || user.role === 'MANAGER';
}
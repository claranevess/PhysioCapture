// Onde colar: src/lib/audit/auditLog.ts

import { db } from '@/lib/db' // Importa a conexão com o banco de dados Prisma
import { UserRole } from '@prisma/client' // Importa o tipo UserRole do Prisma

// Define os dados que a função precisa receber
interface CreateAuditLogParams {
  userId: string      // Quem fez a ação
  userName: string    // Nome de quem fez (para facilitar exibição)
  userRole: UserRole  // Role de quem fez
  patientId: string   // Qual paciente foi afetado
  action: string      // O código da ação (ex: 'UPDATE_PATIENT_PHONE')
  details: string     // A descrição detalhada do que mudou
  entityType?: string // Opcional: Tipo da entidade (ex: 'Document')
  entityId?: string   // Opcional: ID da entidade específica
}

// Função assíncrona para criar o log
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    // Usa o Prisma para criar um novo registro na tabela auditLog (mapeada para 'audit_logs')
    await db.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        userRole: params.userRole,
        patientId: params.patientId,
        action: params.action,
        details: params.details,
        entityType: params.entityType, // Será null se não for passado
        entityId: params.entityId,     // Será null se não for passado
        // 'timestamp' é preenchido automaticamente (@default(now()))
      },
    })

    // Log no console do servidor (útil para debug)
    console.log(`[Audit Log] User: ${params.userName}, Action: ${params.action}, Patient: ${params.patientId}`)

  } catch (error) {
    // Se der erro ao salvar o log, apenas registra no console
    // IMPORTANTE: A falha ao salvar o log NÃO deve impedir a ação principal
    console.error('Falha ao criar registro de auditoria:', error)
  }
}
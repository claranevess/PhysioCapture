import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { patientSchema } from '@/lib/validations/patient'
import { calculateAge } from '@/lib/utils/formatters'
import { z } from 'zod'
import { createAuditLog } from '@/lib/audit/auditLog'

// GET - Buscar paciente por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = await params

    // Construir where baseado na clínica e role
    const where: any = {
      id,
      clinicId: session.user.clinicId, // Sempre da mesma clínica
    }

    // Fisioterapeutas veem apenas seus pacientes
    if (session.user.role === 'PHYSIOTHERAPIST') {
      where.assignedTherapistId = session.user.id
    }

    const patient = await db.patient.findFirst({
      where,
      include: {
        assignedTherapist: {
          select: {
            id: true,
            name: true,
            crm: true,
          },
        },
        consultations: {
          orderBy: { date: 'desc' },
          take: 10,
          include: {
            performer: {
              select: {
                id: true,
                name: true,
                crm: true,
              },
            },
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            consultations: true,
            documents: true,
          },
        },
      },
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Erro ao buscar paciente:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar paciente' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar paciente
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.name || !session.user.role) {
      return NextResponse.json(
        { error: 'Não autenticado ou dados de sessão incompletos' },
        { status: 401 }
      )
    }

    const { id: patientId } = await params

    const existingPatient = await db.patient.findFirst({
      where: {
        id: patientId,
        clinicId: session.user.clinicId, // Garante que pertence à clínica
      },
    })

    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado ou acesso negado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validated = patientSchema.parse(body)

    // Verificar se CPF já existe (excluindo o próprio paciente)
    if (
      validated.cpf &&
      existingPatient.cpf &&
      validated.cpf !== existingPatient.cpf
    ) {
      const cpfExists = await db.patient.findFirst({
        where: {
          cpf: validated.cpf.replace(/\D/g, ''),
          id: { not: patientId },
          clinicId: session.user.clinicId,
        },
      })

      if (cpfExists) {
        return NextResponse.json(
          { error: 'Este CPF já está cadastrado no sistema' },
          { status: 400 }
        )
      }
    }

    const birthDate = new Date(validated.dateOfBirth)
    const age = calculateAge(birthDate)

    // --- PREPARAÇÃO PARA O LOG ---
    let logDetails = 'Informações do paciente atualizadas.'
    const changes: string[] = []
    ;(Object.keys(validated) as Array<keyof typeof validated>).forEach((key) => {
      let oldValue = existingPatient[key as keyof typeof existingPatient]
      let newValue = validated[key]

      if (key === 'dateOfBirth' && oldValue instanceof Date) {
        oldValue = oldValue.toISOString().split('T')[0]
        // Certifique-se que newValue está no mesmo formato para comparação
        newValue =
          typeof validated.dateOfBirth === 'string'
            ? validated.dateOfBirth
            : new Date(validated.dateOfBirth).toISOString().split('T')[0]
      }
      if (
        key === 'cpf' &&
        typeof oldValue === 'string' &&
        typeof newValue === 'string'
      ) {
        oldValue = oldValue.replace(/\D/g, '')
        newValue = newValue.replace(/\D/g, '')
      }
      // Transforma null/undefined em 'vazio' para clareza no log
      const oldValueStr =
        oldValue === null || oldValue === undefined ? 'vazio' : String(oldValue)
      const newValueStr =
        newValue === null || newValue === undefined ? 'vazio' : String(newValue)

      // Adiciona ao log apenas se o valor realmente mudou
      if (newValue !== undefined && oldValueStr !== newValueStr) {
        // Limita o tamanho dos valores no log para não ficar muito extenso
        const oldValueDisplay =
          oldValueStr.length > 50
            ? oldValueStr.substring(0, 47) + '...'
            : oldValueStr
        const newValueDisplay =
          newValueStr.length > 50
            ? newValueStr.substring(0, 47) + '...'
            : newValueStr
        changes.push(
          `Campo '${key}' alterado de '${oldValueDisplay}' para '${newValueDisplay}'.`
        )
      }
    })

    if (changes.length > 0) {
      logDetails = changes.join(' ')
    }
    // --- FIM DA PREPARAÇÃO PARA O LOG ---

    const updatedPatient = await db.patient.update({
      where: { id: patientId },
      data: {
        ...validated,
        dateOfBirth: birthDate,
        cpf: validated.cpf.replace(/\D/g, ''),
        age,
      },
      include: {
        _count: {
          select: {
            consultations: true,
            documents: true,
          },
        },
      },
    })

    // --- CRIAÇÃO DO LOG DE AUDITORIA ---
    await createAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      patientId: patientId,
      action: 'UPDATE_PATIENT_INFO', // Código da ação
      details: logDetails, // Detalhes gerados acima
      entityType: 'Patient', // Tipo da entidade
      entityId: patientId, // ID da entidade
    })
    // --- FIM DA CRIAÇÃO DO LOG ---

    return NextResponse.json(updatedPatient)
  } catch (error) {
    console.error('Erro no PATCH /api/patients/[id]:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', issues: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erro interno ao atualizar paciente' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir paciente
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = await params

    // Construir where - Admin e Manager podem deletar qualquer paciente da clínica
    const where: any = {
      id,
      clinicId: session.user.clinicId,
    }

    // Fisioterapeutas só podem deletar seus próprios pacientes
    if (session.user.role === 'PHYSIOTHERAPIST') {
      where.assignedTherapistId = session.user.id
    }

    // Recepcionista não pode deletar pacientes
    if (session.user.role === 'RECEPTIONIST') {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir pacientes' },
        { status: 403 }
      )
    }

    // Verificar se o paciente existe e se usuário tem permissão
    const existingPatient = await db.patient.findFirst({
      where,
    })

    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado ou você não tem permissão para excluí-lo' },
        { status: 404 }
      )
    }

    // Excluir paciente (cascade irá remover consultas e documentos)
    await db.patient.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Paciente excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir paciente:', {
      error,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor ao excluir paciente',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { patientSchema } from '@/lib/validations/patient'
import { calculateAge } from '@/lib/utils/formatters'
import { z } from 'zod'

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
    console.log('=== PATCH /api/patients/[id] ===')
    
    const session = await getServerSession(authOptions)
    console.log('Session:', session ? { 
      userId: session.user?.id, 
      userEmail: session.user?.email 
    } : 'null')
    
    if (!session?.user) {
      console.log('Usuário não autenticado')
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = await params
    console.log('Patient ID:', id)

    // Construir where baseado na clínica e role
    const where: any = {
      id,
      clinicId: session.user.clinicId,
    }

    // Fisioterapeutas só podem editar seus pacientes
    if (session.user.role === 'PHYSIOTHERAPIST') {
      where.assignedTherapistId = session.user.id
    }

    // Verificar se o paciente pertence à clínica e se usuário tem permissão
    const existingPatient = await db.patient.findFirst({
      where,
    })

    if (!existingPatient) {
      console.log('Paciente não encontrado ou sem permissão')
      return NextResponse.json(
        { error: 'Paciente não encontrado ou você não tem permissão para editá-lo' },
        { status: 404 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    // Separar dados do paciente e dados do prontuário (anamnese)
    const medicalRecordFields = [
      'chiefComplaint',
      'currentIllness', 
      'medicalHistory',
      'medications',
      'allergies',
      'lifestyle',
      'physicalAssessment',
      'generalNotes'
    ]
    
    // Validar apenas se campos obrigatórios de paciente foram enviados
    // ou se é apenas atualização de prontuário
    const isOnlyMedicalRecordUpdate = Object.keys(body).every(key => 
      medicalRecordFields.includes(key)
    )
    
    let validated
    if (isOnlyMedicalRecordUpdate) {
      // Validação simplificada para atualização apenas de prontuário
      validated = body
    } else {
      // Validação completa do schema de paciente
      validated = patientSchema.parse(body)
      
      // Verificar se CPF já existe (excluindo o próprio paciente)
      if (validated.cpf !== existingPatient.cpf) {
        const cpfExists = await db.patient.findFirst({
          where: {
            cpf: validated.cpf.replace(/\D/g, ''),
            id: { not: id },
          },
        })

        if (cpfExists) {
          return NextResponse.json(
            { error: 'Este CPF já está cadastrado no sistema' },
            { status: 400 }
          )
        }
      }
    }
    
    console.log('Dados validados:', validated)

    // Calcular idade apenas se dateOfBirth foi fornecido
    let updateData: any = { ...validated }
    
    if (!isOnlyMedicalRecordUpdate && validated.dateOfBirth) {
      const birthDate = new Date(validated.dateOfBirth)
      const age = calculateAge(birthDate)
      console.log('Data de nascimento convertida:', birthDate)
      console.log('Idade calculada:', age)
      
      updateData = {
        ...validated,
        dateOfBirth: birthDate,
        cpf: validated.cpf.replace(/\D/g, ''),
        age,
      }
    } else if (isOnlyMedicalRecordUpdate) {
      // Para atualização apenas de prontuário, não modificar campos de data e CPF
      updateData = validated
    }

    // Atualizar paciente
    const patient = await db.patient.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            consultations: true,
            documents: true,
          },
        },
      },
    })

    return NextResponse.json(patient)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Erro de validação:', error.issues)
      return NextResponse.json({ 
        error: error.issues,
        message: 'Dados inválidos fornecidos'
      }, { status: 400 })
    }
    
    console.error('Erro ao atualizar paciente:', {
      error,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor ao atualizar paciente',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
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
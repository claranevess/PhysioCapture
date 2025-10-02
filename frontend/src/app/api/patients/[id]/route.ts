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

    const patient = await db.patient.findFirst({
      where: {
        id,
        userId: session.user.id, // Apenas pacientes do usuário logado
      },
      include: {
        consultations: {
          orderBy: { date: 'desc' },
          take: 10, // Últimas 10 consultas
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Últimos 10 documentos
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

    // Verificar se o paciente pertence ao usuário
    const existingPatient = await db.patient.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingPatient) {
      console.log('Paciente não encontrado para o usuário')
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const validated = patientSchema.parse(body)
    console.log('Dados validados:', validated)

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

    // Calcular idade
    const birthDate = new Date(validated.dateOfBirth)
    const age = calculateAge(birthDate)
    console.log('Data de nascimento convertida:', birthDate)
    console.log('Idade calculada:', age)

    // Atualizar paciente
    const patient = await db.patient.update({
      where: { id },
      data: {
        ...validated,
        dateOfBirth: birthDate, // Convert to Date object
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

    // Verificar se o paciente pertence ao usuário
    const existingPatient = await db.patient.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
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
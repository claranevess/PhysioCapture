import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { medicalRecordSchema } from '@/lib/validations/medical-record'

// GET - Buscar prontuário do paciente
export async function GET(
  request: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { patientId } = await params

    // Verificar se o paciente pertence à clínica
    const patient = await db.patient.findFirst({
      where: {
        id: patientId,
        clinicId: session.user.clinicId,
      },
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    // Fisioterapeutas só podem ver prontuários de seus pacientes
    if (session.user.role === 'PHYSIOTHERAPIST') {
      if (patient.assignedTherapistId !== session.user.id) {
        return NextResponse.json(
          { error: 'Você não tem permissão para acessar este prontuário' },
          { status: 403 }
        )
      }
    }

    // Buscar prontuário
    const medicalRecord = await db.medicalRecord.findUnique({
      where: { patientId },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            cpf: true,
            dateOfBirth: true,
            age: true,
          },
        },
      },
    })

    if (!medicalRecord) {
      return NextResponse.json(
        { error: 'Prontuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(medicalRecord)
  } catch (error) {
    console.error('Erro ao buscar prontuário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar prontuário' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar prontuário
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { patientId } = await params
    const body = await request.json()

    // Verificar se o paciente pertence à clínica
    const patient = await db.patient.findFirst({
      where: {
        id: patientId,
        clinicId: session.user.clinicId,
      },
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    // Fisioterapeutas só podem editar prontuários de seus pacientes
    if (session.user.role === 'PHYSIOTHERAPIST') {
      if (patient.assignedTherapistId !== session.user.id) {
        return NextResponse.json(
          { error: 'Você não tem permissão para editar este prontuário' },
          { status: 403 }
        )
      }
    }

    // Validar dados do prontuário
    const validated = medicalRecordSchema.parse(body)

    // Verificar se prontuário existe
    const existingRecord = await db.medicalRecord.findUnique({
      where: { patientId },
    })

    let medicalRecord

    if (existingRecord) {
      // Atualizar prontuário existente
      medicalRecord = await db.medicalRecord.update({
        where: { patientId },
        data: {
          ...validated,
          lastUpdatedBy: session.user.id,
        },
        include: {
          patient: {
            select: {
              id: true,
              fullName: true,
              cpf: true,
            },
          },
        },
      })
    } else {
      // Criar novo prontuário
      medicalRecord = await db.medicalRecord.create({
        data: {
          ...validated,
          patientId,
          clinicId: session.user.clinicId,
          lastUpdatedBy: session.user.id,
        },
        include: {
          patient: {
            select: {
              id: true,
              fullName: true,
              cpf: true,
            },
          },
        },
      })
    }

    return NextResponse.json(medicalRecord)
  } catch (error) {
    console.error('Erro ao atualizar prontuário:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar prontuário' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir prontuário
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { patientId } = await params

    // Verificar se o paciente pertence à clínica
    const patient = await db.patient.findFirst({
      where: {
        id: patientId,
        clinicId: session.user.clinicId,
      },
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    // Apenas Admin e Manager podem excluir prontuários
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir prontuários' },
        { status: 403 }
      )
    }

    // Verificar se prontuário existe
    const existingRecord = await db.medicalRecord.findUnique({
      where: { patientId },
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Prontuário não encontrado' },
        { status: 404 }
      )
    }

    // Excluir prontuário
    await db.medicalRecord.delete({
      where: { patientId },
    })

    return NextResponse.json({ message: 'Prontuário excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir prontuário:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir prontuário' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = await params

    const clinicId = session.user.clinicId
    const role = session.user.role
    
    // Apenas ADMIN, MANAGER e RECEPTIONIST podem reatribuir pacientes
    if (!['ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(role)) {
      return NextResponse.json(
        { error: 'Sem permissão para reatribuir pacientes' },
        { status: 403 }
      )
    }

    const { assignedTherapistId } = await req.json()

    // Validar que o paciente existe e pertence à clínica
    const patient = await db.patient.findUnique({
      where: { id },
    })

    if (!patient || patient.clinicId !== clinicId) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    // Se um fisioterapeuta foi especificado, validar que ele existe e pertence à clínica
    if (assignedTherapistId) {
      const therapist = await db.user.findUnique({
        where: { id: assignedTherapistId },
      })

      if (!therapist || therapist.clinicId !== clinicId || therapist.role !== 'PHYSIOTHERAPIST') {
        return NextResponse.json(
          { error: 'Fisioterapeuta inválido' },
          { status: 400 }
        )
      }
    }

    // Atualizar a atribuição
    const updatedPatient = await db.patient.update({
      where: { id },
      data: {
        assignedTherapistId: assignedTherapistId || null,
      },
      include: {
        assignedTherapist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updatedPatient)
  } catch (error) {
    console.error('Erro ao reatribuir paciente:', error)
    return NextResponse.json(
      { error: 'Erro ao reatribuir paciente' },
      { status: 500 }
    )
  }
}

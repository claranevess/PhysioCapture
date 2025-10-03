import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const clinicId = session.user.clinicId
    
    if (!clinicId) {
      return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 400 })
    }

    // Buscar todos os fisioterapeutas ativos da clínica
    const therapists = await db.user.findMany({
      where: {
        clinicId,
        role: 'PHYSIOTHERAPIST',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        crm: true,
        _count: {
          select: {
            assignedPatients: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(therapists)
  } catch (error) {
    console.error('Erro ao buscar fisioterapeutas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar fisioterapeutas' },
      { status: 500 }
    )
  }
}

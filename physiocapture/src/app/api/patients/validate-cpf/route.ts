import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  cpf: z.string(),
  excludeId: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { cpf, excludeId } = schema.parse(body)

    const cleanCPF = cpf.replace(/\D/g, '')

    const where: any = {
      cpf: cleanCPF,
      clinicId: session.user.clinicId, // Verificar apenas na mesma clínica
    }

    if (excludeId) {
      where.id = { not: excludeId }
    }

    const existingPatient = await db.patient.findFirst({
      where,
      select: {
        id: true,
        fullName: true,
      },
    })

    if (existingPatient) {
      return NextResponse.json({
        available: false,
        patient: existingPatient,
      })
    }

    return NextResponse.json({ available: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Erro ao validar CPF:', error)
    return NextResponse.json(
      { error: 'Erro ao validar CPF' },
      { status: 500 }
    )
  }
}
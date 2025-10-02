import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { userSchema } from '@/lib/validations/patient'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = userSchema.parse(body)

    // Verificar se usuário já existe
    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe com este email' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(validated.password, 12)

    // Criar usuário
    const user = await db.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        crm: validated.crm,
      },
      select: {
        id: true,
        name: true,
        email: true,
        crm: true,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
}
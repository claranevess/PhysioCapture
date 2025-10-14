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

    // Buscar ou criar clínica padrão
    let clinic = await db.clinic.findFirst({
      where: { name: 'Clínica Padrão' },
    })

    if (!clinic) {
      // Criar clínica padrão se não existir
      clinic = await db.clinic.create({
        data: {
          name: 'Clínica Padrão',
          cnpj: '00.000.000/0001-00',
          email: 'contato@clinicapadrao.com',
          phone: '(11) 99999-9999',
          zipCode: '00000-000',
          street: 'Rua Exemplo',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
        },
      })
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
        clinicId: clinic.id,
        role: 'ADMIN', // Primeiro usuário é admin
      },
      select: {
        id: true,
        name: true,
        email: true,
        crm: true,
        clinicId: true,
        role: true,
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
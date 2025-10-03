import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const userSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  role: z.enum(['ADMIN', 'MANAGER', 'PHYSIOTHERAPIST', 'RECEPTIONIST']),
  crm: z.string().optional(),
  cpf: z.string().optional(),
  phone: z.string().optional(),
})

// GET - Listar usuários da clínica
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('🔐 Sessão na API /users:', session?.user)
    
    if (!session?.user) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Apenas ADMIN pode listar usuários
    if (session.user.role !== 'ADMIN') {
      console.log('❌ Usuário sem permissão:', session.user.role)
      return NextResponse.json(
        { error: 'Sem permissão para listar usuários' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')

    console.log('🔍 Filtros:', { search, role, isActive, clinicId: session.user.clinicId })

    // Construir where clause
    const where: any = {
      clinicId: session.user.clinicId, // Apenas usuários da mesma clínica
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { crm: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role) {
      where.role = role
    }

    if (isActive && isActive !== 'all') {
      where.isActive = isActive === 'true'
    }

    console.log('📊 Where clause:', JSON.stringify(where, null, 2))

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        crm: true,
        cpf: true,
        phone: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            assignedPatients: true,
            consultations: true,
          },
        },
      },
    })

    console.log('✅ Usuários encontrados:', users.length)
    return NextResponse.json({ data: users })
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    )
  }
}

// POST - Criar novo usuário
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Apenas ADMIN pode criar usuários
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão para criar usuários' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = userSchema.parse(body)

    // Verificar se email já existe
    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }

    // Verificar limite de usuários do plano
    const clinic = await db.clinic.findUnique({
      where: { id: session.user.clinicId },
      include: {
        _count: {
          select: { users: true },
        },
      },
    })

    if (clinic && clinic._count.users >= clinic.maxUsers) {
      return NextResponse.json(
        {
          error: `Limite de usuários atingido. Seu plano permite até ${clinic.maxUsers} usuários. Faça upgrade para adicionar mais.`,
        },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(validated.password, 10)

    // Criar usuário
    const user = await db.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        role: validated.role,
        crm: validated.crm,
        cpf: validated.cpf,
        phone: validated.phone,
        clinicId: session.user.clinicId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        crm: true,
        cpf: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
}

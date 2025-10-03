import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const updateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'PHYSIOTHERAPIST', 'RECEPTIONIST']).optional(),
  crm: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

// GET - Buscar usuário por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Apenas ADMIN pode ver detalhes de outros usuários
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão' },
        { status: 403 }
      )
    }

    const { id } = await params

    const user = await db.user.findFirst({
      where: {
        id,
        clinicId: session.user.clinicId,
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
        updatedAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            assignedPatients: true,
            consultations: true,
            documentsUploaded: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar usuário
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Apenas ADMIN pode editar usuários
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão para editar usuários' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Verificar se usuário existe e pertence à clínica
    const existingUser = await db.user.findFirst({
      where: {
        id,
        clinicId: session.user.clinicId,
      },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Não pode editar a si mesmo (para evitar perder acesso admin)
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Você não pode editar seu próprio usuário. Peça a outro administrador.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validated = updateUserSchema.parse(body)

    // Se estiver alterando email, verificar se já existe
    if (validated.email && validated.email !== existingUser.email) {
      const emailExists = await db.user.findUnique({
        where: { email: validated.email },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Este email já está cadastrado' },
          { status: 400 }
        )
      }
    }

    // Preparar dados para atualização
    const updateData: any = {
      ...validated,
    }

    // Se estiver alterando senha, fazer hash
    if (validated.password) {
      updateData.password = await bcrypt.hash(validated.password, 10)
    }

    // Remover password se não foi fornecido
    if (!validated.password) {
      delete updateData.password
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        crm: true,
        cpf: true,
        phone: true,
        isActive: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir usuário (na verdade, apenas desativa)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Apenas ADMIN pode deletar usuários
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão para deletar usuários' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Verificar se usuário existe e pertence à clínica
    const existingUser = await db.user.findFirst({
      where: {
        id,
        clinicId: session.user.clinicId,
      },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Não pode deletar a si mesmo
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Você não pode deletar seu próprio usuário' },
        { status: 400 }
      )
    }

    // Desativar ao invés de deletar (soft delete)
    await db.user.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Usuário desativado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar usuário' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { patientSchema } from '@/lib/validations/patient'
import { calculateAge } from '@/lib/utils/formatters'
import { z } from 'zod'
import { createAuditLog } from '@/lib/audit/auditLog'

// GET - Listar pacientes
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'created_desc'

    // Construir where clause baseado na clínica e role do usuário
    const where: any = {
      clinicId: session.user.clinicId, // Sempre filtrar pela clínica
    }

    // Fisioterapeutas veem apenas seus pacientes atribuídos
    if (session.user.role === 'PHYSIOTHERAPIST') {
      where.assignedTherapistId = session.user.id
    }
    // Admin, Manager e Receptionist veem todos os pacientes da clínica

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search.replace(/\D/g, '') } },
        { phone: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    // Construir order by
    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'name_asc':
        orderBy = { fullName: 'asc' }
        break
      case 'name_desc':
        orderBy = { fullName: 'desc' }
        break
      case 'created_asc':
        orderBy = { createdAt: 'asc' }
        break
      case 'last_visit_desc':
        orderBy = { lastVisitDate: 'desc' }
        break
    }

    const skip = (page - 1) * limit

    const [patients, total] = await Promise.all([
      db.patient.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          assignedTherapist: {
            select: {
              id: true,
              name: true,
              crm: true,
            },
          },
          _count: {
            select: {
              consultations: true,
              documents: true,
            },
          },
        },
      }),
      db.patient.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: patients,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pacientes' },
      { status: 500 }
    )
  }
}

// POST - Criar paciente
export async function POST(request: Request) {
  try {
    console.log('=== POST /api/patients ===')

    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.name || !session.user.role) {
      console.log('Usuário não autenticado ou dados de sessão incompletos')
      return NextResponse.json(
        { error: 'Não autenticado ou dados de sessão incompletos' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = patientSchema.parse(body)

    // Verificar se CPF já existe
    const existingPatient = await db.patient.findUnique({
      where: { cpf: validated.cpf.replace(/\D/g, '') },
    })

    if (existingPatient) {
      console.log('CPF já existe:', existingPatient.cpf)
      return NextResponse.json(
        { error: 'Este CPF já está cadastrado no sistema' },
        { status: 400 }
      )
    }

    // Calcular idade
    const birthDate = new Date(validated.dateOfBirth)
    const age = calculateAge(birthDate)

    const patientData = {
      ...validated,
      dateOfBirth: birthDate,
      cpf: validated.cpf.replace(/\D/g, ''),
      age,
      clinicId: session.user.clinicId,
      assignedTherapistId:
        validated.assignedTherapistId ||
        (session.user.role === 'PHYSIOTHERAPIST' ? session.user.id : undefined),
    }

    // --- CRIAÇÃO DO PACIENTE ---
    const patient = await db.patient.create({
      data: patientData,
      include: {
        assignedTherapist: {
          select: {
            id: true,
            name: true,
            crm: true,
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
    // --- FIM DA CRIAÇÃO DO PACIENTE ---

    // --- CRIAÇÃO DO LOG DE AUDITORIA ---
    const logDetails = `Paciente '${patient.fullName}' (${patient.cpf}) criado.`
    await createAuditLog({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      patientId: patient.id, // Usamos o ID do paciente que ACABOU de ser criado
      action: 'CREATE_PATIENT', // Código da ação
      details: logDetails, // Detalhes
      entityType: 'Patient', // Tipo da entidade
      entityId: patient.id, // ID da entidade
    })
    // --- FIM DA CRIAÇÃO DO LOG ---

    console.log('Paciente criado:', patient)
    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    console.error('Erro no POST /api/patients:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', issues: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erro interno ao criar paciente' },
      { status: 500 }
    )
  }
}
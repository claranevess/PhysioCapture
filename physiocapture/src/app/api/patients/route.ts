import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { patientSchema } from '@/lib/validations/patient'
import { calculateAge } from '@/lib/utils/formatters'
import { z } from 'zod'

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
    console.log('Session:', session ? { 
      userId: session.user?.id, 
      userEmail: session.user?.email 
    } : 'null')
    
    if (!session?.user) {
      console.log('Usuário não autenticado')
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const validated = patientSchema.parse(body)
    console.log('Dados validados:', validated)

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
    console.log('Data de nascimento convertida:', birthDate)
    console.log('Idade calculada:', age)

    // Criar paciente
    const patientData = {
      ...validated,
      dateOfBirth: birthDate, // Convert to Date object
      cpf: validated.cpf.replace(/\D/g, ''), // Salvar CPF sem formatação
      age,
      clinicId: session.user.clinicId, // Paciente pertence à clínica
      // Lógica de atribuição:
      // 1. Se foi fornecido assignedTherapistId no formulário, usar ele
      // 2. Se não foi fornecido E o criador é fisioterapeuta, auto-atribuir a ele
      // 3. Caso contrário, deixar sem atribuição (null)
      assignedTherapistId: validated.assignedTherapistId || 
        (session.user.role === 'PHYSIOTHERAPIST' ? session.user.id : undefined),
    }
    
    console.log('Dados para criar paciente:', patientData)
    
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

    console.log('Paciente criado:', patient)
    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Erro de validação:', error.issues)
      return NextResponse.json({ 
        error: error.issues,
        message: 'Dados inválidos fornecidos'
      }, { status: 400 })
    }
    
    console.error('Erro ao criar paciente:', {
      error,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor ao criar paciente',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { uploadFileLocally, validateFileType, validateFileSize } from '@/lib/local-storage'
import { canViewAllPatients } from '@/lib/permissions'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: patientId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.clinicId || !session?.user?.role) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se o paciente pertence à clínica e se usuário tem permissão
    const where: any = {
      id: patientId,
      clinicId: session.user.clinicId,
    }

    // Fisioterapeutas só veem seus pacientes
    if (!canViewAllPatients(session.user.role as any)) {
      where.assignedTherapistId = session.user.id
    }

    const patient = await prisma.patient.findFirst({ where })

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo é obrigatório' },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria é obrigatória' },
        { status: 400 }
      )
    }

    // Validações
    if (!validateFileType(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido' },
        { status: 400 }
      )
    }

    if (!validateFileSize(file.size)) {
      return NextResponse.json(
        { error: 'Arquivo muito grande (máximo 10MB)' },
        { status: 400 }
      )
    }

    // Converter arquivo para buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload local
    const uploadResult = await uploadFileLocally({
      patientId,
      category,
      file: {
        name: file.name,
        buffer,
        mimetype: file.type,
        size: file.size,
      },
    })

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: 'Erro ao fazer upload do arquivo' },
        { status: 500 }
      )
    }

    // Salvar metadados no banco
    const document = await prisma.document.create({
      data: {
        fileName: file.name,
        fileUrl: uploadResult.url!,
        fileSize: file.size,
        mimeType: file.type,
        category: category as any,
        title: title || file.name,
        description: description || null,
        clinicId: session.user.clinicId, // Documento pertence à clínica
        patientId,
        uploadedBy: session.user.id,
      },
      include: {
        uploader: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Documento uploaded com sucesso',
      document,
    })

  } catch (error) {
    console.error('Erro ao fazer upload do documento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: patientId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.clinicId || !session?.user?.role) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Verificar se o paciente pertence à clínica e se usuário tem permissão
    const where: any = {
      id: patientId,
      clinicId: session.user.clinicId,
    }

    // Fisioterapeutas só veem seus pacientes
    if (!canViewAllPatients(session.user.role as any)) {
      where.assignedTherapistId = session.user.id
    }

    const patient = await prisma.patient.findFirst({ where })

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    // Buscar documentos
    const documents = await prisma.document.findMany({
      where: {
        patientId,
        ...(category && { category: category as any }),
      },
      include: {
        uploader: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ documents })

  } catch (error) {
    console.error('Erro ao buscar documentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
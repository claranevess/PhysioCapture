import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { deleteFileLocally } from '@/lib/local-storage'
import { canViewAllPatients, canEditDocument } from '@/lib/permissions'
import { updateDocumentSchema } from '@/lib/validations/document'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id: patientId, documentId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.clinicId || !session?.user?.role) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Buscar documento e verificar permissões
    const where: any = {
      id: documentId,
      patientId,
      patient: {
        clinicId: session.user.clinicId,
      },
    }

    // Fisioterapeutas só acessam documentos de seus pacientes
    if (!canViewAllPatients(session.user.role as any)) {
      where.patient.assignedTherapistId = session.user.id
    }

    const document = await prisma.document.findFirst({ where })

    if (!document) {
      return NextResponse.json(
        { error: 'Documento não encontrado' },
        { status: 404 }
      )
    }

    // Extrair chave do arquivo da URL
    const urlParts = document.fileUrl.split('/')
    const fileKey = urlParts.slice(3).join('/') // Remove /api/files/

    // Deletar arquivo local
    const deleteResult = await deleteFileLocally(fileKey)
    
    if (!deleteResult.success) {
      console.error('Erro ao deletar arquivo local:', deleteResult.error)
      // Continuar mesmo se falhar no arquivo local, para limpar o banco
    }

    // Deletar do banco
    await prisma.document.delete({
      where: { id: documentId },
    })

    return NextResponse.json({
      message: 'Documento deletado com sucesso',
    })

  } catch (error) {
    console.error('Erro ao deletar documento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id: patientId, documentId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.clinicId || !session?.user?.role) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Buscar documento e verificar permissões
    const where: any = {
      id: documentId,
      patientId,
      patient: {
        clinicId: session.user.clinicId,
      },
    }

    // Fisioterapeutas só acessam documentos de seus pacientes
    if (!canViewAllPatients(session.user.role as any)) {
      where.patient.assignedTherapistId = session.user.id
    }

    const document = await prisma.document.findFirst({ where })

    if (!document) {
      return NextResponse.json(
        { error: 'Documento não encontrado' },
        { status: 404 }
      )
    }

    // Para arquivos locais, retornamos a URL diretamente
    // pois já temos autenticação na rota /api/files
    return NextResponse.json({
      downloadUrl: document.fileUrl,
      document,
    })

  } catch (error) {
    console.error('Erro ao gerar link de download:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id: patientId, documentId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.clinicId || !session?.user?.role) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Obter dados do corpo da requisição
    const body = await request.json()
    
    // Validar dados com Zod
    const validationResult = updateDocumentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validationResult.error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const { title, description, category } = validationResult.data

    // Buscar documento e verificar permissões
    const where: any = {
      id: documentId,
      patientId,
      patient: {
        clinicId: session.user.clinicId,
      },
    }

    // Fisioterapeutas só acessam documentos de seus pacientes
    if (!canViewAllPatients(session.user.role as any)) {
      where.patient.assignedTherapistId = session.user.id
    }

    const document = await prisma.document.findFirst({ where })

    if (!document) {
      return NextResponse.json(
        { error: 'Documento não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões para editar documento
    if (!canEditDocument(session.user.role as any)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar este documento' },
        { status: 403 }
      )
    }

    // Preparar dados para atualização
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category

    // Atualizar documento no banco
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            fullName: true
          }
        },
        uploader: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(updatedDocument, { status: 200 })

  } catch (error) {
    console.error('Erro ao atualizar documento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
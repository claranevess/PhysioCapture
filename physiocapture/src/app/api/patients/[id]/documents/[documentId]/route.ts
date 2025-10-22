import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { deleteFileLocally } from '@/lib/local-storage'
import { canViewAllPatients, canDeleteDocument } from '@/lib/permissions'
import { documentEditSchema } from '@/lib/validations/document'
import { z } from 'zod'

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

    //verificação pra que recepcionista e fisioterapeuta não possam deletar
    if (!canDeleteDocument(session.user.role as any)) {
      return NextResponse.json(
        { error: 'Sua função não tem permissão para excluir documentos' },
        { status: 403 } // 403 (Proibido) é o status correto
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
      where.patient = {
        ...where.patient,
        assignedTherapistId: session.user.id,
      }
    }

    const document = await prisma.document.findFirst({ 
      where,
      include: {
        patient: true,
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Documento não encontrado' },
        { status: 404 }
      )
    }

    // Obter dados do corpo da requisição
    const body = await request.json()

    // Validar dados usando Zod
    let validatedData
    try {
      validatedData = documentEditSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Dados inválidos',
            details: error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
          { status: 400 }
        )
      }
      throw error
    }

    const { title, description, category } = validatedData

    // Atualizar documento
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        ...(category && { category: category as any }),
        updatedAt: new Date(),
      },
      include: {
        uploader: {
          select: {
            name: true,
          },
        },
        patient: {
          select: {
            fullName: true,
          },
        },
      },
    })

    return NextResponse.json(updatedDocument)

  } catch (error) {
    console.error('Erro ao atualizar documento:', error)
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
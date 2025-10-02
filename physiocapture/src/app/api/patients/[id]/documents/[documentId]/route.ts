import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { deleteFileLocally } from '@/lib/local-storage'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id: patientId, documentId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Buscar documento
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        patientId,
        patient: {
          userId: session.user.id,
        },
      },
    })

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

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Buscar documento
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        patientId,
        patient: {
          userId: session.user.id,
        },
      },
    })

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
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getLocalFilePath, fileExistsLocally } from '@/lib/local-storage'
import { db as prisma } from '@/lib/db'
import fs from 'fs'
import path from 'path'
import { canViewAllPatients } from '@/lib/permissions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: filePath } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Reconstituir caminho do arquivo
    const fileKey = filePath.join('/')
    const fullPath = getLocalFilePath(fileKey)

    // Verificar se arquivo existe
    if (!fileExistsLocally(fileKey)) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário tem acesso ao arquivo
    const [patientId] = filePath
    
    const where: any = {
      id: patientId,
      clinicId: session.user.clinicId,
    }

    // Fisioterapeutas só acessam arquivos de seus pacientes
    if (!canViewAllPatients(session.user.role as any)) {
      where.assignedTherapistId = session.user.id
    }

    const patient = await prisma.patient.findFirst({ where })

    if (!patient) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Ler arquivo
    const fileBuffer = fs.readFileSync(fullPath)
    const fileName = path.basename(fullPath)
    const fileExtension = path.extname(fileName)

    // Determinar Content-Type
    let contentType = 'application/octet-stream'
    switch (fileExtension.toLowerCase()) {
      case '.pdf':
        contentType = 'application/pdf'
        break
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        break
      case '.png':
        contentType = 'image/png'
        break
      case '.webp':
        contentType = 'image/webp'
        break
      case '.doc':
        contentType = 'application/msword'
        break
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break
      case '.txt':
        contentType = 'text/plain'
        break
    }

    // Retornar arquivo
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })

  } catch (error) {
    console.error('Erro ao servir arquivo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

// Garantir que o diretório de upload existe
export function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

export interface LocalUploadParams {
  patientId: string
  category: string
  file: {
    name: string
    buffer: Buffer
    mimetype: string
    size: number
  }
}

// Upload local para desenvolvimento
export async function uploadFileLocally({ patientId, category, file }: LocalUploadParams) {
  try {
    ensureUploadDir()
    
    // Criar subdiretório para o paciente
    const patientDir = path.join(UPLOAD_DIR, patientId, category)
    if (!fs.existsSync(patientDir)) {
      fs.mkdirSync(patientDir, { recursive: true })
    }

    // Gerar nome único para o arquivo
    const fileExtension = path.extname(file.name)
    const uniqueName = `${uuidv4()}${fileExtension}`
    const filePath = path.join(patientDir, uniqueName)

    // Salvar arquivo
    fs.writeFileSync(filePath, file.buffer)

    return {
      success: true,
      key: `${patientId}/${category}/${uniqueName}`,
      url: `/api/files/${patientId}/${category}/${uniqueName}`,
      localPath: filePath,
    }
  } catch (error) {
    console.error('Erro no upload local:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Deletar arquivo local
export async function deleteFileLocally(fileKey: string) {
  try {
    const filePath = path.join(UPLOAD_DIR, fileKey)
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar arquivo local:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Verificar se arquivo existe localmente
export function fileExistsLocally(fileKey: string): boolean {
  const filePath = path.join(UPLOAD_DIR, fileKey)
  return fs.existsSync(filePath)
}

// Obter caminho completo do arquivo
export function getLocalFilePath(fileKey: string): string {
  return path.join(UPLOAD_DIR, fileKey)
}

// Validar tipo de arquivo
export function validateFileType(contentType: string): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/tiff',
    'text/plain',
  ]
  return allowedTypes.includes(contentType)
}

// Validar tamanho do arquivo (máx 10MB)
export function validateFileSize(size: number): boolean {
  const maxSize = 10 * 1024 * 1024 // 10MB
  return size <= maxSize
}
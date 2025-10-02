import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Configuração do cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'fisiogest-documents'

export interface UploadFileParams {
  key: string
  body: Buffer
  contentType: string
  metadata?: Record<string, string>
}

export interface DocumentMetadata {
  originalName: string
  size: number
  uploadedBy: string
  patientId: string
  category: string
}

// Upload de arquivo para S3
export async function uploadFileToS3({ key, body, contentType, metadata }: UploadFileParams) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    })

    const result = await s3Client.send(command)
    return {
      success: true,
      key,
      url: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
      etag: result.ETag,
    }
  } catch (error) {
    console.error('Erro ao fazer upload para S3:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Gerar URL assinada para download
export async function getSignedDownloadUrl(key: string, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn })
    return { success: true, url }
  } catch (error) {
    console.error('Erro ao gerar URL assinada:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Deletar arquivo do S3
export async function deleteFileFromS3(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(command)
    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar arquivo do S3:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Gerar chave única para o arquivo
export function generateFileKey(patientId: string, category: string, originalName: string) {
  const timestamp = Date.now()
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `patients/${patientId}/${category}/${timestamp}_${sanitizedName}`
}

// Validar tipo de arquivo
export function validateFileType(contentType: string): boolean {
  const allowedTypes = [
    // Documentos
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Imagens
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/tiff',
    // Outros
    'text/plain',
  ]
  
  return allowedTypes.includes(contentType)
}

// Validar tamanho do arquivo (máx 10MB)
export function validateFileSize(size: number): boolean {
  const maxSize = 10 * 1024 * 1024 // 10MB
  return size <= maxSize
}
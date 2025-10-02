import { Patient, Consultation, Document, User, PatientStatus, ConsultationType, DocumentCategory } from '@prisma/client'

// Tipos básicos do Prisma exportados
export { PatientStatus, ConsultationType, DocumentCategory }

// Tipos extendidos com relacionamentos
export type PatientWithRelations = Patient & {
  consultations?: Consultation[]
  documents?: Document[]
  user?: User
  _count?: {
    consultations: number
    documents: number
  }
}

export type ConsultationWithRelations = Consultation & {
  patient?: Patient
  performer?: User
}

export type DocumentWithRelations = Document & {
  patient?: Patient
  uploader?: User
}

// Tipos para dashboard/estatísticas
export type PatientDashboard = {
  totalConsultations: number
  lastConsultation?: Date
  nextConsultation?: Date
  totalDocuments: number
  treatmentDuration: number // em dias
  status: PatientStatus
}

// Tipos para filtros e busca
export type PatientFilters = {
  search?: string
  status?: PatientStatus
  insurance?: string
  ageRange?: {
    min: number
    max: number
  }
}

export type PatientSort = 'name_asc' | 'name_desc' | 'created_desc' | 'created_asc' | 'last_visit_desc'

// Tipos para documentos
export type DocumentUpload = {
  file: File
  category: DocumentCategory
  title?: string
  description?: string
}

// Tipos para API responses
export type ApiResponse<T> = {
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
import { 
  Patient, 
  Consultation, 
  Document, 
  User, 
  Clinic,
  PatientStatus, 
  ConsultationType, 
  DocumentCategory,
  UserRole,
  ClinicPlan,
  PlanStatus
} from '@prisma/client'

// Tipos básicos do Prisma exportados
export { 
  PatientStatus, 
  ConsultationType, 
  DocumentCategory,
  UserRole,
  ClinicPlan,
  PlanStatus
}

// Tipos extendidos com relacionamentos
export type ClinicWithRelations = Clinic & {
  users?: User[]
  patients?: Patient[]
  documents?: Document[]
  consultations?: Consultation[]
  _count?: {
    users: number
    patients: number
    documents: number
    consultations: number
  }
}

export type UserWithRelations = User & {
  clinic?: Clinic
  assignedPatients?: Patient[]
  consultations?: Consultation[]
  documentsUploaded?: Document[]
  _count?: {
    assignedPatients: number
    consultations: number
    documentsUploaded: number
  }
}

export type PatientWithRelations = Patient & {
  clinic?: Clinic
  assignedTherapist?: User
  consultations?: Consultation[]
  documents?: Document[]
  _count?: {
    consultations: number
    documents: number
  }
}

export type ConsultationWithRelations = Consultation & {
  clinic?: Clinic
  patient?: Patient
  performer?: User
}

export type DocumentWithRelations = Document & {
  clinic?: Clinic
  patient?: Patient
  uploader?: User
}

// Tipos para dashboard/estatísticas da clínica
export type ClinicDashboard = {
  totalPatients: number
  activePatients: number
  totalConsultations: number
  consultationsThisMonth: number
  totalDocuments: number
  storageUsed: number // em bytes
  activeUsers: number
  planInfo: {
    plan: ClinicPlan
    status: PlanStatus
    maxUsers: number
    maxPatients: number
    maxStorage: number
    expirationDate?: Date
  }
}

// Tipos para dashboard/estatísticas de paciente
export type PatientDashboard = {
  totalConsultations: number
  lastConsultation?: Date
  nextConsultation?: Date
  totalDocuments: number
  treatmentDuration: number // em dias
  status: PatientStatus
  assignedTherapist?: {
    id: string
    name: string
  }
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
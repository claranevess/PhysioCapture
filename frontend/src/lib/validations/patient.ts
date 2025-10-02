import { z } from 'zod'

// Função para validar CPF
function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '')
  
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit > 9) digit = 0
  if (parseInt(cpf.charAt(9)) !== digit) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit > 9) digit = 0
  if (parseInt(cpf.charAt(10)) !== digit) return false

  return true
}

export const patientSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo'),
    
  cpf: z
    .string()
    .refine(validateCPF, 'CPF inválido'),
    
  dateOfBirth: z
    .string()
    .or(z.date())
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 0 && age <= 150
    }, 'Data de nascimento inválida'),
    
  phone: z
    .string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido'),
    
  phoneSecondary: z
    .string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido')
    .optional()
    .or(z.literal('')),
    
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
    
  zipCode: z
    .string()
    .regex(/^\d{5}-\d{3}$/, 'CEP inválido')
    .optional()
    .or(z.literal('')),
    
  street: z.string().max(200).optional().or(z.literal('')),
  number: z.string().max(20).optional().or(z.literal('')),
  complement: z.string().max(100).optional().or(z.literal('')),
  neighborhood: z.string().max(100).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().refine((val) => {
    if (!val || val === '') return true // Campo opcional
    return val.length === 2 && /^[A-Z]{2}$/.test(val)
  }, 'Estado deve ter 2 letras maiúsculas (ex: SP)').optional().or(z.literal('')),
  
  occupation: z.string().max(100).optional().or(z.literal('')),
  insurance: z.string().max(100).optional().or(z.literal('')),
  insuranceNumber: z.string().max(50).optional().or(z.literal('')),
  
  generalNotes: z.string().optional().or(z.literal('')),
  
  // Anamnese (campos opcionais)
  chiefComplaint: z.string().optional().or(z.literal('')),
  currentIllness: z.string().optional().or(z.literal('')),
  medicalHistory: z.string().optional().or(z.literal('')),
  medications: z.string().optional().or(z.literal('')),
  allergies: z.string().optional().or(z.literal('')),
  lifestyle: z.string().optional().or(z.literal('')),
  physicalAssessment: z.string().optional().or(z.literal('')),
})

export const consultationSchema = z.object({
  date: z.string().or(z.date()),
  type: z.enum(['INITIAL_EVALUATION', 'REASSESSMENT', 'TREATMENT_SESSION', 'DISCHARGE', 'RETURN']),
  subjective: z.string().optional().nullable(),
  objective: z.string().optional().nullable(),
  assessment: z.string().optional().nullable(),
  plan: z.string().optional().nullable(),
  exercises: z.string().optional().nullable(),
  nextVisit: z.string().or(z.date()).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const userSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  crm: z.string().optional().nullable(),
})

export type PatientFormData = z.infer<typeof patientSchema>
export type ConsultationFormData = z.infer<typeof consultationSchema>
export type UserFormData = z.infer<typeof userSchema>
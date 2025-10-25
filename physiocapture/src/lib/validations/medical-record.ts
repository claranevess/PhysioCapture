import { z } from 'zod'

/**
 * Schema de validação para o Prontuário/Anamnese do paciente
 * Todos os campos são opcionais para permitir preenchimento gradual
 */
export const medicalRecordSchema = z.object({
  // Queixa Principal
  chiefComplaint: z.string()
    .min(10, 'A queixa principal deve ter no mínimo 10 caracteres')
    .max(1000, 'A queixa principal deve ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),

  // História da Doença Atual
  currentIllness: z.string()
    .min(10, 'A história da doença atual deve ter no mínimo 10 caracteres')
    .max(2000, 'A história da doença atual deve ter no máximo 2000 caracteres')
    .optional()
    .or(z.literal('')),

  // Histórico Médico
  medicalHistory: z.string()
    .min(10, 'O histórico médico deve ter no mínimo 10 caracteres')
    .max(2000, 'O histórico médico deve ter no máximo 2000 caracteres')
    .optional()
    .or(z.literal('')),

  // Medicamentos em Uso
  medications: z.string()
    .min(5, 'Medicamentos devem ter no mínimo 5 caracteres')
    .max(1000, 'Medicamentos devem ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),

  // Alergias
  allergies: z.string()
    .min(3, 'Alergias devem ter no mínimo 3 caracteres')
    .max(500, 'Alergias devem ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),

  // Hábitos de Vida
  lifestyle: z.string()
    .min(10, 'Hábitos de vida devem ter no mínimo 10 caracteres')
    .max(1000, 'Hábitos de vida devem ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),

  // Avaliação Física Inicial
  physicalAssessment: z.string()
    .min(10, 'A avaliação física deve ter no mínimo 10 caracteres')
    .max(2000, 'A avaliação física deve ter no máximo 2000 caracteres')
    .optional()
    .or(z.literal('')),

  // Observações Clínicas (campo do MedicalRecord)
  clinicalNotes: z.string()
    .max(2000, 'Observações clínicas devem ter no máximo 2000 caracteres')
    .optional()
    .or(z.literal('')),
})

export type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>
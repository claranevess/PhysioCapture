import { z } from 'zod'
import { DocumentCategory } from '@prisma/client'

// Lista de categorias válidas para validação
const documentCategories: DocumentCategory[] = [
  'EXAME_IMAGEM',
  'EXAME_LABORATORIAL',
  'RECEITA',
  'ATESTADO',
  'CONSENTIMENTO',
  'ANAMNESE',
  'RELATORIO_EVOLUCAO',
  'OUTROS',
]

// Schema para criação de documento (upload)
export const documentUploadSchema = z.object({
  file: z.any().refine((file) => file instanceof File, {
    message: 'Arquivo é obrigatório',
  }),
  category: z.enum(documentCategories as [string, ...string[]], {
    message: 'Categoria inválida',
  }),
  title: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(200, 'Título muito longo')
    .optional(),
  description: z
    .string()
    .max(1000, 'Descrição muito longa')
    .optional(),
})

// Schema para edição de documento
export const documentEditSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(200, 'Título muito longo'),
  category: z.enum(documentCategories as [string, ...string[]], {
    message: 'Categoria inválida',
  }),
  description: z
    .string()
    .max(1000, 'Descrição muito longa')
    .optional()
    .nullable(),
})

// Schema parcial para atualização (todos os campos opcionais)
export const documentUpdateSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(200, 'Título muito longo')
    .optional(),
  category: z.enum(documentCategories as [string, ...string[]], {
    message: 'Categoria inválida',
  }).optional(),
  description: z
    .string()
    .max(1000, 'Descrição muito longa')
    .optional()
    .nullable(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Pelo menos um campo deve ser fornecido para atualização' }
)

// Tipos exportados
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>
export type DocumentEditInput = z.infer<typeof documentEditSchema>
export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>

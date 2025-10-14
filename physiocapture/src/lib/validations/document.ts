import { z } from 'zod'

// Schema para atualização de documentos
export const updateDocumentSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título muito longo')
    .optional(),
    
  description: z
    .string()
    .max(1000, 'Descrição muito longa')
    .optional(),
    
  category: z
    .enum([
      'EXAME_IMAGEM',
      'EXAME_LABORATORIAL', 
      'RECEITA',
      'ATESTADO',
      'CONSENTIMENTO',
      'ANAMNESE',
      'RELATORIO_EVOLUCAO',
      'OUTROS'
    ])
    .optional()
}).refine(
  (data) => data.title !== undefined || data.description !== undefined || data.category !== undefined,
  {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
    path: ['title', 'description', 'category']
  }
)

// Schema para criação de documentos (upload)
export const createDocumentSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título muito longo')
    .optional(),
    
  description: z
    .string()
    .max(1000, 'Descrição muito longa')
    .optional(),
    
  category: z
    .enum([
      'EXAME_IMAGEM',
      'EXAME_LABORATORIAL', 
      'RECEITA',
      'ATESTADO',
      'CONSENTIMENTO',
      'ANAMNESE',
      'RELATORIO_EVOLUCAO',
      'OUTROS'
    ])
})

export type UpdateDocumentData = z.infer<typeof updateDocumentSchema>
export type CreateDocumentData = z.infer<typeof createDocumentSchema>

// Onde colar: src/components/documents/DocumentEditForm.tsx

// 'use client' informa ao Next.js que este é um componente interativo, que roda no navegador.
'use client'

// --- 1. IMPORTAÇÕES ---
// Importamos tudo que precisamos: React, hooks, componentes de UI, ícones, etc.
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { DocumentWithRelations, DocumentCategory } from '@/types'

// --- 2. DEFINIÇÃO DAS CATEGORIAS ---
// Reutilizamos a mesma lista de categorias que existe no componente de Upload.
const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'EXAME_IMAGEM', label: 'Exame de Imagem' },
  { value: 'EXAME_LABORATORIAL', label: 'Exame Laboratorial' },
  { value: 'RECEITA', label: 'Receita Médica' },
  { value: 'ATESTADO', label: 'Atestado' },
  { value: 'CONSENTIMENTO', label: 'Termo de Consentimento' },
  { value: 'ANAMNESE', label: 'Anamnese' },
  { value: 'RELATORIO_EVOLUCAO', label: 'Relatório de Evolução' },
  { value: 'OUTROS', label: 'Outros' },
]

// --- 3. VALIDAÇÃO DO FORMULÁRIO (Schema) ---
// Usamos a biblioteca Zod para definir as regras dos nossos campos.
// Isso garante que o usuário não enviará dados inválidos.

// MUDANÇA 1: Criamos um array com os valores do nosso enum DocumentCategory.
// Isso torna o código mais limpo e fácil de manter.
const documentCategories: DocumentCategory[] = [
  'EXAME_IMAGEM',
  'EXAME_LABORATORIAL',
  'RECEITA',
  'ATESTADO',
  'CONSENTIMENTO',
  'ANAMNESE',
  'RELATORIO_EVOLUCAO',
  'OUTROS',
];

const documentEditSchema = z.object({
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres.'),
  description: z.string().optional(), // Descrição é opcional
  
  category: z.enum(documentCategories as [string, ...string[]], {
    message: "Selecione uma categoria válida."
  }),
});

// Extraímos o "tipo" dos dados do formulário a partir do schema.
type DocumentEditFormData = z.infer<typeof documentEditSchema>;

// --- 4. PROPRIEDADES DO COMPONENTE ---
// Definimos o que nosso componente vai receber de "fora".
interface DocumentEditFormProps {
  document: DocumentWithRelations // Os dados iniciais do documento a ser editado.
  onSuccess: (updatedDocument: DocumentWithRelations) => void // Uma função para ser chamada quando a edição for bem-sucedida.
  onCancel: () => void // Uma função para ser chamada ao cancelar.
}

// --- 5. O COMPONENTE PRINCIPAL ---
export function DocumentEditForm({ document, onSuccess, onCancel }: DocumentEditFormProps) {
  // O hook `useState` cria uma "caixa" para guardar um estado que pode mudar.
  // Aqui, guardamos se o formulário está em processo de envio ou não.
  const [loading, setLoading] = useState(false)

  // `useForm` é o hook principal do React Hook Form. Ele gerencia todo o estado do formulário.
  const {
    register, // Conecta os inputs ao formulário.
    handleSubmit, // Lida com a submissão, chamando nossa função `onSubmit` apenas se a validação passar.
    setValue, // Permite alterar o valor de um campo programaticamente.
    watch, // "Assiste" a um campo para sabermos seu valor em tempo real.
    formState: { errors }, // Contém os erros de validação.
  } = useForm<DocumentEditFormData>({
    resolver: zodResolver(documentEditSchema), // Diz ao `react-hook-form` para usar nosso schema Zod para validação.
    defaultValues: { // Preenche o formulário com os dados iniciais do documento.
      title: document.title || '',
      description: document.description || '',
      category: document.category,
    },
  })

  // "Assistimos" o campo 'category' para poder exibi-lo corretamente no componente Select.
  const selectedCategory = watch('category')

  // --- 6. FUNÇÃO DE SUBMISSÃO ---
  // Esta função será chamada pelo `handleSubmit` quando o formulário for enviado e os dados forem válidos.
  const onSubmit = async (data: DocumentEditFormData) => {
    setLoading(true) // Ativa o estado de "carregando".
    toast.loading('Salvando alterações...')

    try {
      // Aqui fazemos a chamada para a API que seu amigo está criando!
      const response = await fetch(`/api/patients/${document.patientId}/documents/${document.id}`, {
        method: 'PATCH', // Usamos o método PATCH, como combinado no contrato.
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // Enviamos os novos dados no corpo da requisição.
      })

      const updatedDocument = await response.json()

      if (!response.ok) {
        // Se a resposta não for de sucesso, lançamos um erro.
        throw new Error(updatedDocument.error || 'Não foi possível salvar as alterações.')
      }

      toast.success('Documento atualizado com sucesso!')
      onSuccess(updatedDocument) // Chamamos a função de sucesso que recebemos por props.

    } catch (error) {
      console.error('Erro ao atualizar documento:', error)
      toast.error(error instanceof Error ? error.message : 'Ocorreu um erro.')
    } finally {
      setLoading(false) // Desativa o estado de "carregando", independentemente de sucesso ou erro.
    }
  }

  // --- 7. A ESTRUTURA VISUAL (JSX) ---
  // Isso é o que será renderizado na tela. Parece HTML, mas com "superpoderes".
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Campo Título */}
      <div className="space-y-2">
        <Label htmlFor="title">Título do Documento</Label>
        <Input
          id="title"
          {...register('title')} // Conecta este input ao campo 'title' do formulário.
          placeholder="Ex: Raio-X do Joelho Direito"
          disabled={loading} // Desabilita o campo enquanto estiver carregando.
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Campo Categoria */}
      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select
          value={selectedCategory}
          // A MUDANÇA ESTÁ AQUI: de (value) para (value: string)
          onValueChange={(value: string) => setValue('category', value as DocumentCategory)}
          disabled={loading}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>
      
      {/* Campo Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição (Opcional)</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Adicione observações sobre o documento..."
          rows={3}
          disabled={loading}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
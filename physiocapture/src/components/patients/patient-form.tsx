'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { patientSchema, updatePatientSchema, type PatientFormData } from '@/lib/validations/patient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TherapistSelect } from './therapist-select'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatPhone } from '@/lib/utils/formatters'
import { formatCPF } from '@/lib/utils/cpf'
import { fetchAddressByCEP } from '@/lib/utils/cep'

interface PatientFormProps {
  initialData?: Partial<PatientFormData>
  isEditing?: boolean
  patientId?: string
}

export function PatientForm({ initialData, isEditing = false, patientId }: PatientFormProps) {
  const [loading, setLoading] = useState(false)
  const [isCEPLoading, setIsCEPLoading] = useState(false)
  const router = useRouter()

  // Converter null para string vazia em campos opcionais
  const processedInitialData = initialData ? Object.fromEntries(
    Object.entries(initialData).map(([key, value]) => [key, value === null ? '' : value])
  ) as Partial<PatientFormData> : undefined

  // Usar o schema correto baseado no modo (criação ou edição)
  const validationSchema = isEditing ? updatePatientSchema : patientSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm<Partial<PatientFormData>>({
    resolver: zodResolver(validationSchema) as any,
    defaultValues: processedInitialData,
  })

  const watchedCPF = watch('cpf')
  const watchedZipCode = watch('zipCode')
  const watchedTherapist = watch('assignedTherapistId')

  // Buscar CEP automaticamente
  const handleCEPBlur = async (cep: string) => {
    if (!cep || cep.length < 8) return

    // Validar formato antes de buscar
    const cleanCEP = cep.replace(/\D/g, '')
    if (cleanCEP.length !== 8) {
      toast.error('CEP deve ter 8 dígitos', { id: 'cep-search' })
      return
    }

    // Validar se não é CEP sequencial
    if (/^(\d)\1{7}$/.test(cleanCEP)) {
      toast.error('CEP inválido. Digite um CEP válido.', { id: 'cep-search' })
      return
    }

    // Mostrar loading
    setIsCEPLoading(true)
    toast.loading('Buscando endereço...', { id: 'cep-search' })

    try {
      const address = await fetchAddressByCEP(cep)
      
      // Atualizar os campos apenas se trouxeram dados
      if (address.street) setValue('street', address.street)
      if (address.neighborhood) setValue('neighborhood', address.neighborhood)
      if (address.city) setValue('city', address.city)
      if (address.state) setValue('state', address.state)
      
      toast.success('Endereço encontrado!', { id: 'cep-search' })
      
      // Se algum campo não foi preenchido, avisar o usuário
      if (!address.street && !address.neighborhood) {
        toast.info('CEP encontrado, mas preencha os campos manualmente.', { id: 'cep-info' })
      }
      
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      
      // Mensagens de erro mais amigáveis
      let errorMessage = 'Erro ao buscar endereço pelo CEP'
      
      if (error instanceof Error) {
        if (error.message.includes('não encontrado')) {
          errorMessage = 'CEP não encontrado. Verifique e tente novamente, ou preencha manualmente.'
        } else if (error.message.includes('conexão') || error.message.includes('rede')) {
          errorMessage = 'Erro de conexão. Verifique sua internet ou preencha manualmente.'
        } else if (error.message.includes('timeout') || error.message.includes('Tempo limite')) {
          errorMessage = 'Tempo esgotado. Tente novamente ou preencha manualmente.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage, { id: 'cep-search' })
      
      // Não limpar os campos - deixar o usuário preencher manualmente
      
    } finally {
      setIsCEPLoading(false)
    }
  }

  // Validar CPF em tempo real
  const handleCPFBlur = async (cpf: string) => {
    if (!cpf || cpf.length !== 14) return

    try {
      const response = await fetch('/api/patients/validate-cpf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf,
          excludeId: patientId,
        }),
      })

      const data = await response.json()

      if (!data.available) {
        setError('cpf', {
          type: 'manual',
          message: `CPF já cadastrado para: ${data.patient.fullName}`,
        })
      } else {
        clearErrors('cpf')
      }
    } catch (error) {
      console.error('Erro ao validar CPF:', error)
    }
  }

  const onSubmit = async (data: Partial<PatientFormData>) => {
    setLoading(true)

    try {
      // Validar dados antes de enviar
      console.log('Dados do formulário:', data)
      
      // Limpar campos vazios para evitar problemas de validação
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === '' ? undefined : value
        ])
      ) as Partial<PatientFormData>

      console.log('Dados limpos:', cleanedData)

      // Validar se campos obrigatórios estão presentes (apenas para criação)
      if (!isEditing) {
        if (!cleanedData.fullName || cleanedData.fullName.trim().length < 3) {
          throw new Error('Nome completo é obrigatório e deve ter pelo menos 3 caracteres')
        }
        
        if (!cleanedData.cpf) {
          throw new Error('CPF é obrigatório')
        }
        
        if (!cleanedData.dateOfBirth) {
          throw new Error('Data de nascimento é obrigatória')
        }
        
        if (!cleanedData.phone) {
          throw new Error('Telefone é obrigatório')
        }
      }
      
      // Validate and format date if present
      if (cleanedData.dateOfBirth) {
        const birthDate = new Date(cleanedData.dateOfBirth)
        if (isNaN(birthDate.getTime())) {
          throw new Error('Data de nascimento inválida')
        }
        
        // Ensure date is in ISO format for API
        cleanedData.dateOfBirth = birthDate.toISOString().split('T')[0] as any // YYYY-MM-DD format
      }

      const url = isEditing ? `/api/patients/${patientId}` : '/api/patients'
      const method = isEditing ? 'PATCH' : 'POST'
      
      console.log('Enviando requisição:', { url, method, data: cleanedData })

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      })

      if (!response.ok) {
        let errorMessage = 'Erro ao salvar paciente'
        let errorData: any = {}
        
        try {
          errorData = await response.json()
          console.error('Erro da API:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          })
          
          // Handle different error formats
          if (errorData.error) {
            if (Array.isArray(errorData.error)) {
              // Zod validation errors
              errorMessage = errorData.error.map((e: any) => `${e.path?.join('.')}: ${e.message}`).join(', ')
            } else if (typeof errorData.error === 'string') {
              errorMessage = errorData.error
            } else {
              errorMessage = 'Erro de validação nos dados'
            }
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (parseError) {
          console.error('Erro ao fazer parse da resposta:', parseError)
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`
        }
        
        throw new Error(errorMessage)
      }

      const patient = await response.json()

      toast.success(
        isEditing ? 'Paciente atualizado com sucesso!' : 'Paciente cadastrado com sucesso!'
      )

      router.push(`/patients/${patient.id}`)
    } catch (error) {
      console.error('Erro ao salvar paciente:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar paciente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Informações sobre o formulário */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Informações sobre o cadastro</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Campos obrigatórios:</strong> Nome Completo, CPF, Data de Nascimento e Telefone</p>
                <p><strong>Campos opcionais:</strong> Todos os demais podem ser preenchidos posteriormente</p>
                <p className="text-blue-600">💡 Você pode começar com os dados básicos e completar as informações depois</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Pessoais */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Dados Pessoais
            <span className="text-sm font-normal text-muted-foreground">
              (* Campos obrigatórios)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName" className="flex items-center gap-1">
                Nome Completo 
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="Ex: Maria da Silva Santos"
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cpf" className="flex items-center gap-1">
                CPF 
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cpf"
                {...register('cpf')}
                placeholder="000.000.000-00"
                maxLength={14}
                className={errors.cpf ? 'border-red-500' : ''}
                onChange={(e) => {
                  const formatted = formatCPF(e.target.value)
                  setValue('cpf', formatted)
                }}
                onBlur={(e) => handleCPFBlur(e.target.value)}
              />
              {errors.cpf && (
                <p className="text-sm text-destructive mt-1">{errors.cpf.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dateOfBirth" className="flex items-center gap-1">
                Data de Nascimento 
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
                className={errors.dateOfBirth ? 'border-red-500' : ''}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive mt-1">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center gap-1">
                Telefone 
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className={errors.phone ? 'border-red-500' : ''}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value)
                  setValue('phone', formatted)
                }}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phoneSecondary">Telefone Adicional</Label>
              <Input
                id="phoneSecondary"
                {...register('phoneSecondary')}
                placeholder="(00) 00000-0000"
                maxLength={15}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value)
                  setValue('phoneSecondary', formatted)
                }}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="exemplo@email.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Atribuição de Fisioterapeuta */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Fisioterapeuta Responsável
            <span className="text-sm font-normal text-muted-foreground">
              (Opcional)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TherapistSelect
            value={watchedTherapist}
            onChange={(value) => setValue('assignedTherapistId', value)}
            disabled={loading}
          />
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card className="border-l-4 border-l-gray-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Endereço
            <span className="text-sm font-normal text-muted-foreground">
              (Opcional)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">CEP</Label>
              <div className="relative">
                <Input
                  id="zipCode"
                  {...register('zipCode')}
                  placeholder="00000-000"
                  maxLength={9}
                  disabled={isCEPLoading}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    const formatted = value.replace(/(\d{5})(\d{3})/, '$1-$2')
                    setValue('zipCode', formatted)
                  }}
                  onBlur={(e) => handleCEPBlur(e.target.value)}
                />
                {isCEPLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              {errors.zipCode ? (
                <p className="text-sm text-destructive mt-1">{errors.zipCode.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Digite o CEP para preencher automaticamente o endereço
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="street">Rua</Label>
              <Input id="street" {...register('street')} />
            </div>

            <div>
              <Label htmlFor="number">Número</Label>
              <Input id="number" {...register('number')} />
            </div>

            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" {...register('complement')} placeholder="Apto, Bloco, etc" />
            </div>

            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input id="neighborhood" {...register('neighborhood')} />
            </div>

            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" {...register('city')} />
            </div>

            <div>
              <Label htmlFor="state">Estado (UF)</Label>
              <Input
                id="state"
                {...register('state')}
                placeholder="SP"
                maxLength={2}
                onChange={(e) => setValue('state', e.target.value.toUpperCase())}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card className="border-l-4 border-l-gray-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Informações Adicionais
            <span className="text-sm font-normal text-muted-foreground">
              (Opcional)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="occupation">Profissão</Label>
              <Input id="occupation" {...register('occupation')} />
            </div>

            <div>
              <Label htmlFor="insurance">Convênio</Label>
              <Input id="insurance" {...register('insurance')} />
            </div>

            <div>
              <Label htmlFor="insuranceNumber">Número do Convênio</Label>
              <Input id="insuranceNumber" {...register('insuranceNumber')} />
            </div>
          </div>

          <div>
            <Label htmlFor="generalNotes">Observações Gerais</Label>
            <Textarea
              id="generalNotes"
              {...register('generalNotes')}
              placeholder="Informações adicionais sobre o paciente..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="min-w-[180px]"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading 
            ? (isEditing ? 'Atualizando...' : 'Salvando...') 
            : (isEditing ? 'Atualizar Paciente' : 'Salvar Paciente')
          }
        </Button>
      </div>

      {/* Resumo de validação se houver erros */}
      {Object.keys(errors).length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Campos obrigatórios pendentes</h3>
                <div className="text-sm text-red-800 space-y-1">
                  <p>Verifique os campos marcados em vermelho acima:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    {errors.fullName && <li>Nome Completo</li>}
                    {errors.cpf && <li>CPF</li>}
                    {errors.dateOfBirth && <li>Data de Nascimento</li>}
                    {errors.phone && <li>Telefone</li>}
                    {Object.keys(errors).filter(key => !['fullName', 'cpf', 'dateOfBirth', 'phone'].includes(key)).length > 0 && (
                      <li>Outros campos com formato inválido</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  )
}
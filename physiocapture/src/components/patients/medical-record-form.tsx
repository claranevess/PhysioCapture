'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, FileText, Heart, Pill, AlertTriangle, Activity, Clipboard, FileCheck } from 'lucide-react'
import { medicalRecordSchema, type MedicalRecordFormData } from '@/lib/validations/medical-record'

interface MedicalRecordFormProps {
  patientId: string
  patientName: string
  initialData?: Partial<MedicalRecordFormData>
}

export function MedicalRecordForm({ patientId, patientName, initialData }: MedicalRecordFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      chiefComplaint: initialData?.chiefComplaint || '',
      currentIllness: initialData?.currentIllness || '',
      medicalHistory: initialData?.medicalHistory || '',
      medications: initialData?.medications || '',
      allergies: initialData?.allergies || '',
      lifestyle: initialData?.lifestyle || '',
      physicalAssessment: initialData?.physicalAssessment || '',
      generalNotes: initialData?.generalNotes || '',
    },
  })

  const onSubmit = async (data: MedicalRecordFormData) => {
    if (!isDirty) {
      toast.info('Nenhuma alteração foi feita')
      return
    }

    setLoading(true)

    try {
      // Remove campos vazios antes de enviar
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value && value.trim() !== '')
      )

      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar prontuário')
      }

      toast.success('Prontuário atualizado com sucesso!')
      router.push(`/patients/${patientId}`)
      router.refresh()
    } catch (error) {
      console.error('Erro ao salvar prontuário:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar prontuário')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header com informações do paciente */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 text-lg mb-1">
                Prontuário Médico
              </h3>
              <p className="text-blue-700 mb-2">
                Paciente: <span className="font-medium">{patientName}</span>
              </p>
              <p className="text-sm text-blue-600">
                💡 Preencha as informações clínicas e histórico do paciente. Todos os campos são opcionais e podem ser completados gradualmente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queixa Principal */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5 text-red-500" />
            Queixa Principal
          </CardTitle>
          <CardDescription>
            Motivo principal da consulta ou tratamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              {...register('chiefComplaint')}
              placeholder="Ex: Dor lombar intensa há 3 semanas, com irradiação para membro inferior direito..."
              rows={4}
              className={errors.chiefComplaint ? 'border-red-500' : ''}
            />
            {errors.chiefComplaint && (
              <p className="text-sm text-red-500">{errors.chiefComplaint.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Descreva os sintomas principais e quando começaram
            </p>
          </div>
        </CardContent>
      </Card>

      {/* História da Doença Atual */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-orange-500" />
            História da Doença Atual (HDA)
          </CardTitle>
          <CardDescription>
            Evolução dos sintomas e tratamentos já realizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              {...register('currentIllness')}
              placeholder="Ex: Paciente relata início súbito após esforço físico. Procurou atendimento emergencial onde recebeu analgésicos. Sintomas persistem apesar da medicação..."
              rows={5}
              className={errors.currentIllness ? 'border-red-500' : ''}
            />
            {errors.currentIllness && (
              <p className="text-sm text-red-500">{errors.currentIllness.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Descreva a evolução do quadro clínico e tratamentos anteriores
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Histórico Médico */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clipboard className="w-5 h-5 text-purple-500" />
            Histórico Médico
          </CardTitle>
          <CardDescription>
            Doenças prévias, cirurgias e condições de saúde
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              {...register('medicalHistory')}
              placeholder="Ex: Hipertensão arterial controlada há 5 anos. Cirurgia de menisco em 2018. Sem outras comorbidades..."
              rows={5}
              className={errors.medicalHistory ? 'border-red-500' : ''}
            />
            {errors.medicalHistory && (
              <p className="text-sm text-red-500">{errors.medicalHistory.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Inclua doenças crônicas, cirurgias e hospitalizações
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Medicamentos e Alergias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Medicamentos */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-green-500" />
              Medicamentos em Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                {...register('medications')}
                placeholder="Ex: Losartana 50mg - 1x/dia&#10;Paracetamol 500mg - SOS"
                rows={6}
                className={errors.medications ? 'border-red-500' : ''}
              />
              {errors.medications && (
                <p className="text-sm text-red-500">{errors.medications.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Liste medicamentos, doses e frequência
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Alergias */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Alergias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                {...register('allergies')}
                placeholder="Ex: Dipirona - reação alérgica cutânea&#10;Lactose - intolerância&#10;Sem alergias conhecidas"
                rows={6}
                className={errors.allergies ? 'border-red-500' : ''}
              />
              {errors.allergies && (
                <p className="text-sm text-red-500">{errors.allergies.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Medicamentos, alimentos ou outras alergias
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hábitos de Vida */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-blue-500" />
            Hábitos de Vida
          </CardTitle>
          <CardDescription>
            Atividade física, alimentação, sono e hábitos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              {...register('lifestyle')}
              placeholder="Ex: Sedentário. Trabalha sentado 8h/dia. Alimentação irregular. Tabagismo: 10 cigarros/dia há 15 anos. Etilismo ocasional..."
              rows={5}
              className={errors.lifestyle ? 'border-red-500' : ''}
            />
            {errors.lifestyle && (
              <p className="text-sm text-red-500">{errors.lifestyle.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Inclua tabagismo, etilismo, atividade física e sono
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Avaliação Física Inicial */}
      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileCheck className="w-5 h-5 text-indigo-500" />
            Avaliação Física Inicial
          </CardTitle>
          <CardDescription>
            Exame físico e avaliação funcional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              {...register('physicalAssessment')}
              placeholder="Ex: Inspeção: postura cifótica. Palpação: dor à palpação de L4-L5. ADM: flexão lombar limitada (60°). Força muscular: 4/5 em flexores de quadril. Testes especiais: Lasègue positivo à direita..."
              rows={6}
              className={errors.physicalAssessment ? 'border-red-500' : ''}
            />
            {errors.physicalAssessment && (
              <p className="text-sm text-red-500">{errors.physicalAssessment.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Descreva inspeção, palpação, ADM, força muscular e testes especiais
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Observações Gerais */}
      <Card className="border-l-4 border-l-gray-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-gray-500" />
            Observações Gerais
          </CardTitle>
          <CardDescription>
            Outras informações relevantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              {...register('generalNotes')}
              placeholder="Ex: Paciente ansioso em relação ao tratamento. Expectativas de retorno ao esporte em 2 meses. Necessita acompanhamento psicológico..."
              rows={4}
              className={errors.generalNotes ? 'border-red-500' : ''}
            />
            {errors.generalNotes && (
              <p className="text-sm text-red-500">{errors.generalNotes.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4 pt-4 border-t sticky bottom-0 bg-white py-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !isDirty}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Salvando...' : 'Salvar Prontuário'}
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
                <h3 className="font-semibold text-red-900 mb-2">Erros de validação</h3>
                <div className="text-sm text-red-800 space-y-1">
                  <p>Verifique os campos marcados em vermelho acima</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  )
}
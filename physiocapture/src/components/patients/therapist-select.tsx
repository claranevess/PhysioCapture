'use client'

import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2, Stethoscope, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface Therapist {
  id: string
  name: string
  email: string
  crm: string | null
  _count: {
    assignedPatients: number
  }
}

interface TherapistSelectProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function TherapistSelect({ value, onChange, disabled }: TherapistSelectProps) {
  const { data: session } = useSession()
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(true)

  const userRole = session?.user?.role
  const isPhysiotherapist = userRole === 'PHYSIOTHERAPIST'

  useEffect(() => {
    loadTherapists()
  }, [])

  const loadTherapists = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/therapists')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar fisioterapeutas')
      }

      const data = await response.json()
      setTherapists(data)

      // Se o usuário é fisioterapeuta e não há valor selecionado, auto-selecionar ele mesmo
      if (isPhysiotherapist && !value && session?.user?.id) {
        const currentTherapist = data.find((t: Therapist) => t.id === session.user.id)
        if (currentTherapist) {
          onChange(currentTherapist.id)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar fisioterapeutas:', error)
      toast.error('Erro ao carregar lista de fisioterapeutas')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Fisioterapeuta Responsável</Label>
        <div className="flex items-center justify-center h-10 border border-gray-200 rounded-xl bg-gray-50">
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          <span className="ml-2 text-sm text-gray-500">Carregando...</span>
        </div>
      </div>
    )
  }

  // Se é fisioterapeuta, mostrar apenas ele mesmo (desabilitado)
  if (isPhysiotherapist) {
    const currentTherapist = therapists.find(t => t.id === session?.user?.id)
    return (
      <div className="space-y-2">
        <Label>Fisioterapeuta Responsável</Label>
        <div className="flex items-center gap-3 p-3 border border-green-200 rounded-xl bg-green-50">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {currentTherapist?.name || session?.user?.name}
            </p>
            <p className="text-xs text-gray-500">
              Você será automaticamente atribuído a este paciente
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="therapist">
        Fisioterapeuta Responsável
        <span className="ml-1 text-xs text-gray-500 font-normal">(opcional)</span>
      </Label>
      <Select value={value || 'unassigned'} onValueChange={(val) => onChange(val === 'unassigned' ? '' : val)} disabled={disabled}>
        <SelectTrigger id="therapist" className="h-12">
          <SelectValue placeholder="Selecione um fisioterapeuta (ou deixe sem atribuição)" />
        </SelectTrigger>
        <SelectContent>
          {/* Opção para não atribuir */}
          <SelectItem value="unassigned">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Sem atribuição</p>
                <p className="text-xs text-gray-500">Atribuir posteriormente</p>
              </div>
            </div>
          </SelectItem>

          {/* Lista de fisioterapeutas */}
          {therapists.map((therapist) => (
            <SelectItem key={therapist.id} value={therapist.id}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{therapist.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {therapist.crm && (
                      <span>CRM {therapist.crm}</span>
                    )}
                    <span>•</span>
                    <span>{therapist._count.assignedPatients} pacientes</span>
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!value && (
        <p className="text-xs text-gray-500 mt-1">
          💡 Você pode atribuir um fisioterapeuta agora ou deixar para depois
        </p>
      )}
    </div>
  )
}

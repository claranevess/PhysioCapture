'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Stethoscope,
  Edit,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { PatientWithRelations } from '@/types'
import { formatPhone, formatDateBR, calculateTreatmentDuration } from '@/lib/utils/formatters'
import { formatCPF } from '@/lib/utils/cpf'

interface PatientDashboardProps {
  patient: PatientWithRelations
}

const statusColors = {
  ACTIVE: 'bg-green-500',
  INACTIVE: 'bg-gray-500',
  EVALUATION: 'bg-yellow-500',
  DISCHARGED: 'bg-blue-500',
}

const statusLabels = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  EVALUATION: 'Em Avaliação',
  DISCHARGED: 'Alta',
}

export function PatientDashboard({ patient }: PatientDashboardProps) {
  const initials = patient.fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const lastConsultation = patient.consultations?.[0]
  const treatmentDuration = patient.consultations && patient.consultations.length > 0
    ? calculateTreatmentDuration(patient.consultations[patient.consultations.length - 1].date)
    : 0

  return (
    <div className="space-y-6">
      {/* Header do Paciente */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{patient.fullName}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-muted-foreground">
                {patient.age} anos • {formatCPF(patient.cpf)}
              </span>
              <Badge 
                className={`${statusColors[patient.status]} text-white`}
              >
                {statusLabels[patient.status]}
              </Badge>
            </div>
          </div>
        </div>
        
        <Button asChild>
          <Link href={`/patients/${patient.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Paciente
          </Link>
        </Button>
      </div>

      {/* Cards de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Contato */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>{formatPhone(patient.phone)}</div>
            {patient.phoneSecondary && (
              <div className="text-muted-foreground">
                {formatPhone(patient.phoneSecondary)}
              </div>
            )}
            {patient.email && (
              <div className="flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {patient.email}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {patient.street || patient.city ? (
              <div className="space-y-1">
                {patient.street && (
                  <div>
                    {patient.street}
                    {patient.number && `, ${patient.number}`}
                  </div>
                )}
                {patient.neighborhood && (
                  <div className="text-muted-foreground">{patient.neighborhood}</div>
                )}
                {patient.city && (
                  <div className="text-muted-foreground">
                    {patient.city}{patient.state && ` - ${patient.state}`}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">Não informado</div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas de Consultas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Stethoscope className="h-4 w-4 mr-2" />
              Consultas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-semibold">{patient._count?.consultations || 0}</span>
            </div>
            {lastConsultation && (
              <div className="flex justify-between">
                <span>Última:</span>
                <span className="font-semibold">
                  {formatDateBR(lastConsultation.date)}
                </span>
              </div>
            )}
            {treatmentDuration > 0 && (
              <div className="flex justify-between">
                <span>Tratamento:</span>
                <span className="font-semibold">{treatmentDuration} dias</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documentos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-semibold">{patient._count?.documents || 0}</span>
            </div>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`/patients/${patient.id}/documents`}>
                Ver Documentos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      {(patient.occupation || patient.insurance || patient.generalNotes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {patient.occupation && (
                <div>
                  <span className="font-medium">Profissão:</span>
                  <div className="text-muted-foreground">{patient.occupation}</div>
                </div>
              )}
              {patient.insurance && (
                <div>
                  <span className="font-medium">Convênio:</span>
                  <div className="text-muted-foreground">
                    {patient.insurance}
                    {patient.insuranceNumber && ` - ${patient.insuranceNumber}`}
                  </div>
                </div>
              )}
            </div>
            
            {patient.generalNotes && (
              <div>
                <span className="font-medium text-sm">Observações:</span>
                <div className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {patient.generalNotes}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
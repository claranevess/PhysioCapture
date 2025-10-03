'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  MoreHorizontal, 
  User, 
  Phone, 
  Calendar,
  FileText,
  Stethoscope
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PatientWithRelations, PatientStatus } from '@/types'
import { formatPhone, formatDateBR, calculateAge } from '@/lib/utils/formatters'
import { formatCPF } from '@/lib/utils/cpf'

interface PatientCardProps {
  patient: PatientWithRelations
  onEdit?: () => void
  onDelete?: () => void
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

export function PatientCard({ patient, onEdit, onDelete }: PatientCardProps) {
  const initials = patient.fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const lastConsultation = patient.consultations?.[0]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                <Link 
                  href={`/patients/${patient.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {patient.fullName}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground">
                {patient.age} anos • {formatCPF(patient.cpf)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant="secondary" 
              className={`${statusColors[patient.status]} text-white`}
            >
              {statusLabels[patient.status]}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/patients/${patient.id}`}>
                    Ver Prontuário
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/patients/${patient.id}/edit`}>
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-destructive"
                >
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Phone className="h-4 w-4 mr-2" />
            {formatPhone(patient.phone)}
          </div>
          
          {patient.email && (
            <div className="flex items-center text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              {patient.email}
            </div>
          )}

          {patient.assignedTherapist && (
            <div className="flex items-center text-green-600">
              <Stethoscope className="h-4 w-4 mr-2" />
              Fisio: {patient.assignedTherapist.name}
            </div>
          )}

          {lastConsultation && (
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              Última consulta: {formatDateBR(lastConsultation.date)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Stethoscope className="h-4 w-4 mr-1" />
              {patient._count?.consultations || 0} consultas
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              {patient._count?.documents || 0} documentos
            </div>
          </div>
          
          <Button variant="outline" size="sm" asChild>
            <Link href={`/patients/${patient.id}`}>
              Ver Prontuário
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
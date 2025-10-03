'use client'

import { useState } from 'react'
import { Phone, Mail, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Patient {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  lastVisitDate: Date | null
}

interface FollowUpNotificationProps {
  patients: Patient[]
}

export function FollowUpNotification({ patients }: FollowUpNotificationProps) {
  const [dismissed, setDismissed] = useState(false)

  if (patients.length === 0 || dismissed) {
    return null
  }

  const calculateDays = (lastVisit: Date | null) => {
    if (!lastVisit) return null
    return Math.floor((new Date().getTime() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              {patients.length} {patients.length === 1 ? 'Paciente Precisa' : 'Pacientes Precisam'} de Retorno
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Mais de 30 dias sem consulta - Entre em contato
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {patients.slice(0, 5).map((patient) => {
            const days = calculateDays(patient.lastVisitDate)
            
            return (
              <div
                key={patient.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200 hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/patients/${patient.id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {patient.fullName}
                  </Link>
                  <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                    {patient.phone && (
                      <a 
                        href={`tel:${patient.phone}`}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </a>
                    )}
                    {patient.email && (
                      <a 
                        href={`mailto:${patient.email}`}
                        className="flex items-center gap-1 hover:text-primary truncate"
                      >
                        <Mail className="h-3 w-3" />
                        {patient.email}
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="text-sm font-semibold text-orange-700">
                    {days ? `${days} dias` : 'Nunca'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {patient.lastVisitDate 
                      ? new Date(patient.lastVisitDate).toLocaleDateString('pt-BR')
                      : 'Sem consultas'
                    }
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        {patients.length > 5 && (
          <p className="text-sm text-muted-foreground text-center mt-3">
            + {patients.length - 5} pacientes adicionais precisam de retorno
          </p>
        )}
      </CardContent>
    </Card>
  )
}

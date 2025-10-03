'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Activity, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { FollowUpNotification } from '@/components/dashboard/follow-up-notification'
import { ConsultationChart } from '@/components/dashboard/consultation-chart'
import { groupConsultationsByDate } from '@/lib/utils/dashboard'

interface PhysiotherapistDashboardClientProps {
  myPatients: number
  myActivePatients: number
  monthConsultations: number
  todayConsultations: number
  recentConsultations: Array<{
    id: string
    patientId: string
    date: Date
    type: string
    patient: {
      id: string
      fullName: string
    }
  }>
  patientsNeedingFollowup: Array<{
    id: string
    fullName: string
    lastVisitDate: Date | null
    phone: string | null
    email: string | null
  }>
  last7DaysConsultations: Array<{ date: Date }>
}

export function PhysiotherapistDashboardClient({
  myPatients,
  myActivePatients,
  monthConsultations,
  todayConsultations,
  recentConsultations,
  patientsNeedingFollowup,
  last7DaysConsultations
}: PhysiotherapistDashboardClientProps) {
  const chartData = groupConsultationsByDate(last7DaysConsultations, 7)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meus Pacientes</h1>
        <p className="text-muted-foreground">Acompanhamento clínico e consultas</p>
      </div>

      {/* Notificação de Follow-up */}
      <FollowUpNotification patients={patientsNeedingFollowup} />

      {/* Métricas do fisioterapeuta */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meus Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myPatients}</div>
            <p className="text-xs text-muted-foreground">{myActivePatients} ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{todayConsultations}</div>
            <p className="text-xs text-muted-foreground">Atendimentos hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas no Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{monthConsultations}</div>
            <p className="text-xs text-muted-foreground">Neste mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisam Retorno</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{patientsNeedingFollowup.length}</div>
            <p className="text-xs text-muted-foreground">&gt;30 dias sem consulta</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de evolução */}
      <ConsultationChart 
        data={chartData}
        title="Minhas Consultas - Últimos 7 Dias"
        description="Acompanhamento dos seus atendimentos realizados"
      />

      {/* Consultas recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Atendimentos Recentes</CardTitle>
          <CardDescription>Suas últimas consultas realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentConsultations.length > 0 ? (
              recentConsultations.map((consultation) => (
                <Link
                  key={consultation.id}
                  href={`/patients/${consultation.patientId}`}
                  className="flex items-center justify-between hover:bg-accent p-2 rounded-md transition-colors"
                >
                  <div>
                    <p className="font-medium">{consultation.patient.fullName}</p>
                    <p className="text-sm text-muted-foreground">{consultation.type}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(consultation.date).toLocaleDateString('pt-BR')}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma consulta realizada ainda
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

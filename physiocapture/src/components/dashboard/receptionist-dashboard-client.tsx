'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { ConsultationChart } from './consultation-chart'
import { StatCardWithTrend } from './stat-card-with-trend'

interface ReceptionistDashboardClientProps {
  totalPatients: number
  activePatients: number
  monthRegistrations: number
  todayConsultations: number
  monthConsultations: number
  recentPatients: Array<{
    id: string
    fullName: string
    phone: string | null
    status: string
    createdAt: Date
  }>
  todayConsultations_list: Array<{
    id: string
    date: Date
    type: string
    status: string
    patient: {
      fullName: string
    }
  }>
  last7DaysRegistrations: Array<{
    id: string
    createdAt: Date
  }>
  previousWeekRegistrations: number
  previousMonthRegistrations: number
}

export function ReceptionistDashboardClient({
  totalPatients,
  activePatients,
  monthRegistrations,
  todayConsultations,
  monthConsultations,
  recentPatients,
  todayConsultations_list,
  last7DaysRegistrations,
  previousWeekRegistrations,
  previousMonthRegistrations,
}: ReceptionistDashboardClientProps) {
  // Cálculo de tendências
  const weekGrowth = previousWeekRegistrations > 0
    ? ((last7DaysRegistrations.length - previousWeekRegistrations) / previousWeekRegistrations) * 100
    : 0

  const monthGrowth = previousMonthRegistrations > 0
    ? ((monthRegistrations - previousMonthRegistrations) / previousMonthRegistrations) * 100
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recepção</h1>
        <p className="text-muted-foreground">Gestão de cadastros e agendamentos</p>
      </div>

      {/* Métricas principais com tendências */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCardWithTrend
          title="Total de Pacientes"
          value={totalPatients}
          description={`${activePatients} ativos`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          trend={0}
        />

        <StatCardWithTrend
          title="Cadastros no Mês"
          value={monthRegistrations}
          description="Novos pacientes"
          icon={<UserPlus className="h-4 w-4 text-blue-500" />}
          trend={monthGrowth}
        />

        <StatCardWithTrend
          title="Consultas Hoje"
          value={todayConsultations}
          description="Agendamentos hoje"
          icon={<Calendar className="h-4 w-4 text-green-500" />}
          trend={0}
        />

        <StatCardWithTrend
          title="Consultas no Mês"
          value={monthConsultations}
          description="Total do mês"
          icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
          trend={weekGrowth}
        />
      </div>

      {/* Gráfico de cadastros */}
      <ConsultationChart
        data={last7DaysRegistrations}
        title="Novos Cadastros (7 dias)"
        description="Pacientes cadastrados nos últimos 7 dias"
      />

      {/* Grid com consultas de hoje e pacientes recentes */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Consultas de hoje */}
        <Card>
          <CardHeader>
            <CardTitle>Consultas Agendadas Hoje</CardTitle>
            <CardDescription>{todayConsultations} consultas programadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayConsultations_list.map((consultation) => (
                <Link
                  key={consultation.id}
                  href={`/patients/${consultation.patient}`}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{consultation.patient.fullName}</p>
                    <p className="text-sm text-muted-foreground">{consultation.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      consultation.status === 'SCHEDULED' ? 'outline' :
                      consultation.status === 'COMPLETED' ? 'default' :
                      consultation.status === 'CANCELLED' ? 'destructive' : 'outline'
                    }>
                      {consultation.status === 'SCHEDULED' ? 'Agendado' :
                       consultation.status === 'COMPLETED' ? 'Concluído' :
                       consultation.status === 'CANCELLED' ? 'Cancelado' : consultation.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(consultation.date).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </Link>
              ))}
              {todayConsultations_list.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma consulta agendada para hoje
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pacientes recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Cadastros Recentes</CardTitle>
            <CardDescription>Últimos pacientes cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{patient.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.phone || 'Sem telefone'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={patient.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {patient.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(patient.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </Link>
              ))}
              {recentPatients.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum paciente cadastrado recentemente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

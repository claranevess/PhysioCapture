'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, Activity, TrendingUp, Calendar, Shield } from 'lucide-react'
import Link from 'next/link'
import { ConsultationChart } from './consultation-chart'
import { DistributionChart } from './distribution-chart'
import { StatCardWithTrend } from './stat-card-with-trend'
import { groupConsultationsByDate } from '@/lib/utils/dashboard'

interface AdminDashboardClientProps {
  totalUsers: number
  activeUsers: number
  totalPatients: number
  activePatients: number
  totalConsultations: number
  monthConsultations: number
  todayConsultations: number
  clinic: {
    id: string
    name: string
    _count: { users: number; patients: number }
  } | null
  recentUsers: Array<{
    id: string
    name: string
    email: string
    role?: string
    createdAt: Date
  }>
  usersByRole: Array<{
    name: string
    value: number
  }>
  last7DaysConsultations: Array<{
    id: string
    date: Date
  }>
  previousWeekConsultations: number
  previousMonthConsultations: number
}

export function AdminDashboardClient({
  totalUsers,
  activeUsers,
  totalPatients,
  activePatients,
  totalConsultations,
  monthConsultations,
  todayConsultations,
  clinic,
  recentUsers,
  usersByRole,
  last7DaysConsultations,
  previousWeekConsultations,
  previousMonthConsultations,
}: AdminDashboardClientProps) {
  // Cálculo de tendências
  const weekGrowth = previousWeekConsultations > 0
    ? ((last7DaysConsultations.length - previousWeekConsultations) / previousWeekConsultations) * 100
    : 0

  const monthGrowth = previousMonthConsultations > 0
    ? ((monthConsultations - previousMonthConsultations) / previousMonthConsultations) * 100
    : 0

  // Transformar dados para o gráfico
  const chartData = groupConsultationsByDate(last7DaysConsultations, 7)

  // Tradução dos roles
  const roleLabels: Record<string, string> = {
    'ADMIN': 'Administrador',
    'MANAGER': 'Gerente',
    'PHYSIOTHERAPIST': 'Fisioterapeuta',
    'RECEPTIONIST': 'Recepcionista'
  }

  // Traduzir nomes dos roles no gráfico
  const translatedUsersByRole = usersByRole.map(role => ({
    name: roleLabels[role.name] || role.name,
    value: role.value
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Administração</h1>
        <p className="text-muted-foreground">Gestão geral do sistema e clínicas</p>
      </div>

      {/* Métricas principais com tendências */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCardWithTrend
          title="Total de Usuários"
          value={totalUsers}
          description={`${activeUsers} ativos`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          trend={0}
        />

        <StatCardWithTrend
          title="Total de Pacientes"
          value={totalPatients}
          description={`${activePatients} ativos`}
          icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
          trend={0}
        />

        <StatCardWithTrend
          title="Consultas no Mês"
          value={monthConsultations}
          description={`${todayConsultations} hoje`}
          icon={<Calendar className="h-4 w-4 text-green-500" />}
          trend={monthGrowth}
        />

        <StatCardWithTrend
          title="Total de Consultas"
          value={totalConsultations}
          description="Desde o início"
          icon={<Activity className="h-4 w-4 text-blue-500" />}
          trend={weekGrowth}
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Evolução de consultas */}
        <ConsultationChart
          data={chartData}
          title="Evolução de Consultas (7 dias)"
          description="Total de consultas nos últimos 7 dias"
        />

        {/* Distribuição de usuários por função */}
        <DistributionChart
          data={translatedUsersByRole}
          title="Distribuição de Usuários"
          description="Usuários por função no sistema"
        />
      </div>

      {/* Grid com informações da clínica e usuários recentes */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Informações da Clínica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Minha Clínica
            </CardTitle>
            <CardDescription>Visão geral da sua clínica</CardDescription>
          </CardHeader>
          <CardContent>
            {clinic ? (
              <div className="space-y-3">
                <div className="p-4 rounded-md border bg-accent/50">
                  <p className="font-semibold text-lg mb-2">{clinic.name}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Usuários</span>
                      <span className="font-medium text-lg">{clinic._count.users}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Pacientes</span>
                      <span className="font-medium text-lg">{clinic._count.patients}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Informações da clínica não disponíveis
              </p>
            )}
          </CardContent>
        </Card>

        {/* Usuários recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Recentes</CardTitle>
            <CardDescription>Últimos cadastros no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      user.role === 'ADMIN' ? 'default' :
                      user.role === 'MANAGER' ? 'secondary' :
                      user.role === 'PHYSIOTHERAPIST' ? 'outline' : 'outline'
                    }>
                      {user.role ? roleLabels[user.role] || user.role : 'N/A'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum usuário recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

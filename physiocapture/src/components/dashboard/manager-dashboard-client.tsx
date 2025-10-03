'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Activity, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { ConsultationChart } from '@/components/dashboard/consultation-chart'
import { groupConsultationsByDate } from '@/lib/utils/dashboard'

interface ManagerDashboardClientProps {
  totalPatients: number
  activePatients: number
  todayConsultationsCount: number
  monthConsultations: number
  todayConsultations: Array<{
    id: string
    patientId: string
    date: Date
    type: string
    patient: {
      id: string
      fullName: string
    }
    performedBy: string
  }>
  recentPatients: Array<{
    id: string
    fullName: string
    createdAt: Date
  }>
  therapistStats: Array<{
    id: string
    name: string
  }>
  last7DaysConsultations: Array<{ date: Date }>
}

export function ManagerDashboardClient({
  totalPatients,
  activePatients,
  todayConsultationsCount,
  monthConsultations,
  todayConsultations,
  recentPatients,
  therapistStats,
  last7DaysConsultations
}: ManagerDashboardClientProps) {
  const chartData = groupConsultationsByDate(last7DaysConsultations, 7)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão Operacional</h1>
        <p className="text-muted-foreground">Acompanhamento de atividades e desempenho da equipe</p>
      </div>

      {/* Métricas do dia */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayConsultationsCount}</div>
            <p className="text-xs text-muted-foreground">Atendimentos de hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas no Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthConsultations}</div>
            <p className="text-xs text-muted-foreground">Até o momento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePatients}</div>
            <p className="text-xs text-muted-foreground">de {totalPatients} cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">Base de pacientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de consultas */}
      <ConsultationChart 
        data={chartData}
        title="Evolução de Consultas - Últimos 7 Dias"
        description="Acompanhamento diário de atendimentos realizados"
      />

      {/* Grid com duas colunas */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Consultas de hoje detalhadas */}
        <Card>
          <CardHeader>
            <CardTitle>Consultas de Hoje</CardTitle>
            <CardDescription>
              {todayConsultations.length > 0 
                ? `${todayConsultations.length} atendimento${todayConsultations.length > 1 ? 's' : ''} agendado${todayConsultations.length > 1 ? 's' : ''}`
                : 'Nenhuma consulta agendada'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayConsultations.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todayConsultations.map((consultation) => (
                  <Link
                    key={consultation.id}
                    href={`/patients/${consultation.patientId}`}
                    className="flex items-center justify-between hover:bg-accent p-3 rounded-md transition-colors border"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{consultation.patient.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {consultation.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(consultation.date).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Sem atendimentos programados para hoje
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cadastros Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Cadastros Recentes</CardTitle>
            <CardDescription>Últimos pacientes registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentPatients.map((patient) => (
                <Link 
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="flex items-center justify-between hover:bg-accent p-2 rounded-md transition-colors"
                >
                  <span className="font-medium">{patient.fullName}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(patient.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance dos fisioterapeutas */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho da Equipe</CardTitle>
          <CardDescription>Fisioterapeutas da clínica</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {therapistStats.length > 0 ? (
              therapistStats.map((therapist) => (
                <div key={therapist.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{therapist.name}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum fisioterapeuta cadastrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

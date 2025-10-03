'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, FileText, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface TherapistPatient {
  id: string
  fullName: string
  age: number
  lastVisitDate: Date | null
  consultationCount: number
  status: string
}

interface RecentConsultation {
  id: string
  date: Date
  patient: {
    id: string
    fullName: string
  }
  type: string
}

interface TherapistDashboardProps {
  therapistName: string
  stats: {
    totalPatients: number
    activePatients: number
    totalConsultations: number
    consultationsThisMonth: number
    avgConsultationsPerPatient: number
  }
  recentPatients: TherapistPatient[]
  upcomingConsultations: RecentConsultation[]
  patientsNeedingFollowup: TherapistPatient[]
}

export function TherapistDashboard({ 
  therapistName, 
  stats, 
  recentPatients,
  upcomingConsultations,
  patientsNeedingFollowup 
}: TherapistDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Saudação */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Olá, {therapistName}! 👋</h2>
        <p className="text-green-100">
          Aqui está um resumo dos seus pacientes e consultas
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Pacientes */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Meus Pacientes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.activePatients} ativos
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total de Consultas */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Consultas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalConsultations}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Todas as consultas
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consultas Este Mês */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Este Mês</p>
                <p className="text-3xl font-bold text-gray-900">{stats.consultationsThisMonth}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Consultas realizadas
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Média por Paciente */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Média/Paciente</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.avgConsultationsPerPatient.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Consultas por paciente
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pacientes Recentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Pacientes Recentes
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/patients">Ver Todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum paciente atribuído ainda</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/patients/new">Adicionar Primeiro Paciente</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPatients.map((patient) => (
                  <Link 
                    key={patient.id} 
                    href={`/patients/${patient.id}`}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {patient.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-blue-600">
                          {patient.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {patient.age} anos • {patient.consultationCount} consultas
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {patient.lastVisitDate 
                        ? new Date(patient.lastVisitDate).toLocaleDateString('pt-BR')
                        : 'Sem consultas'
                      }
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pacientes Precisam Acompanhamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Precisam Acompanhamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patientsNeedingFollowup.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-300" />
                <p className="font-medium text-green-600">Tudo em dia!</p>
                <p className="text-sm mt-1">Todos os pacientes estão com acompanhamento em dia</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patientsNeedingFollowup.map((patient) => (
                  <div 
                    key={patient.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{patient.fullName}</p>
                        <p className="text-xs text-gray-600">
                          Última consulta: {patient.lastVisitDate 
                            ? new Date(patient.lastVisitDate).toLocaleDateString('pt-BR')
                            : 'Nunca'
                          }
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/patients/${patient.id}`}>Agendar</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link href="/patients/new">
                <Users className="w-6 h-6" />
                <span>Novo Paciente</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link href="/patients">
                <Calendar className="w-6 h-6" />
                <span>Ver Meus Pacientes</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link href="/documents/upload">
                <FileText className="w-6 h-6" />
                <span>Enviar Documento</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

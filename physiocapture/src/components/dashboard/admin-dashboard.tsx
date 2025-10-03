'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface ClinicStats {
  totalUsers: number
  maxUsers: number
  totalPatients: number
  maxPatients: number
  totalStorage: number // em GB
  maxStorage: number // em GB
  activeUsers: number
  inactiveUsers: number
  usersByRole: {
    ADMIN: number
    MANAGER: number
    PHYSIOTHERAPIST: number
    RECEPTIONIST: number
  }
  patientsByTherapist: {
    therapistId: string
    therapistName: string
    patientCount: number
  }[]
}

interface AdminDashboardProps {
  stats: ClinicStats
  planName: string
}

export function AdminDashboard({ stats, planName }: AdminDashboardProps) {
  const usersPercentage = (stats.totalUsers / stats.maxUsers) * 100
  const patientsPercentage = (stats.totalPatients / stats.maxPatients) * 100
  const storagePercentage = (stats.totalStorage / stats.maxStorage) * 100

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Visão Geral da Clínica</h2>
        <p className="text-gray-600 mt-1">
          Plano <span className="font-semibold">{planName}</span> - Gerencie os recursos da sua clínica
        </p>
      </div>

      {/* Cards de Limite do Plano */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Usuários */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Usuários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-gray-900">{stats.totalUsers}</span>
              <span className="text-sm text-gray-500">de {stats.maxUsers}</span>
            </div>
            <Progress value={usersPercentage} className={getProgressColor(usersPercentage)} />
            <div className="flex items-center justify-between text-xs">
              <span className={getStatusColor(usersPercentage)}>
                {usersPercentage.toFixed(0)}% utilizado
              </span>
              {usersPercentage >= 80 && (
                <span className="flex items-center gap-1 text-yellow-600">
                  <AlertCircle className="w-3 h-3" />
                  Atenção
                </span>
              )}
            </div>
            <div className="pt-2 border-t text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Ativos:</span>
                <span className="font-medium">{stats.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inativos:</span>
                <span className="font-medium">{stats.inactiveUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pacientes */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pacientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-gray-900">{stats.totalPatients}</span>
              <span className="text-sm text-gray-500">de {stats.maxPatients}</span>
            </div>
            <Progress value={patientsPercentage} className={getProgressColor(patientsPercentage)} />
            <div className="flex items-center justify-between text-xs">
              <span className={getStatusColor(patientsPercentage)}>
                {patientsPercentage.toFixed(0)}% utilizado
              </span>
              {patientsPercentage >= 80 && (
                <span className="flex items-center gap-1 text-yellow-600">
                  <AlertCircle className="w-3 h-3" />
                  Atenção
                </span>
              )}
            </div>
            {patientsPercentage >= 90 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">
                Limite próximo! Considere fazer upgrade do plano.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Armazenamento */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Armazenamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-gray-900">{stats.totalStorage}GB</span>
              <span className="text-sm text-gray-500">de {stats.maxStorage}GB</span>
            </div>
            <Progress value={storagePercentage} className={getProgressColor(storagePercentage)} />
            <div className="flex items-center justify-between text-xs">
              <span className={getStatusColor(storagePercentage)}>
                {storagePercentage.toFixed(0)}% utilizado
              </span>
              {storagePercentage >= 80 && (
                <span className="flex items-center gap-1 text-yellow-600">
                  <AlertCircle className="w-3 h-3" />
                  Atenção
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {(stats.maxStorage - stats.totalStorage).toFixed(1)}GB disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de Usuários por Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Distribuição da Equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="text-xs text-purple-600 font-medium mb-1">Administradores</div>
              <div className="text-2xl font-bold text-purple-900">{stats.usersByRole.ADMIN}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="text-xs text-blue-600 font-medium mb-1">Gestores</div>
              <div className="text-2xl font-bold text-blue-900">{stats.usersByRole.MANAGER}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="text-xs text-green-600 font-medium mb-1">Fisioterapeutas</div>
              <div className="text-2xl font-bold text-green-900">{stats.usersByRole.PHYSIOTHERAPIST}</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="text-xs text-orange-600 font-medium mb-1">Recepcionistas</div>
              <div className="text-2xl font-bold text-orange-900">{stats.usersByRole.RECEPTIONIST}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição de Pacientes por Fisioterapeuta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Distribuição de Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.patientsByTherapist.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum fisioterapeuta com pacientes atribuídos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.patientsByTherapist.map((item) => (
                <div key={item.therapistId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.therapistName}</p>
                      <p className="text-xs text-gray-500">Fisioterapeuta</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{item.patientCount}</p>
                    <p className="text-xs text-gray-500">pacientes</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas e Recomendações */}
      {(usersPercentage >= 80 || patientsPercentage >= 80 || storagePercentage >= 80) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertCircle className="w-5 h-5" />
              Atenção: Limites do Plano
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {usersPercentage >= 80 && (
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-900">
                  Você está usando <strong>{usersPercentage.toFixed(0)}%</strong> do limite de usuários. 
                  {usersPercentage >= 90 && ' Considere fazer upgrade do plano.'}
                </p>
              </div>
            )}
            {patientsPercentage >= 80 && (
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-900">
                  Você está usando <strong>{patientsPercentage.toFixed(0)}%</strong> do limite de pacientes. 
                  {patientsPercentage >= 90 && ' Considere fazer upgrade do plano.'}
                </p>
              </div>
            )}
            {storagePercentage >= 80 && (
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-900">
                  Você está usando <strong>{storagePercentage.toFixed(0)}%</strong> do armazenamento. 
                  {storagePercentage >= 90 && ' Considere fazer upgrade do plano ou liberar espaço.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

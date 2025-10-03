import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { StatCard, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-new'
import { PrimaryButton, OutlineButton } from '@/components/ui/button-new'
import { StatusBadge } from '@/components/ui/badge-new'
import { Users, FileText, Stethoscope, Plus, Activity, Calendar, TrendingUp, Upload } from 'lucide-react'
import Link from 'next/link'

async function getDashboardData(userId: string, clinicId: string, userRole: string) {
  try {
    // Construir where baseado na role
    const patientWhere: any = { clinicId }
    if (userRole === 'PHYSIOTHERAPIST') {
      patientWhere.assignedTherapistId = userId
    }

    const [
      totalPatients,
      activePatients,
      totalConsultations,
      totalDocuments,
      recentPatients,
      recentConsultations,
    ] = await Promise.all([
      db.patient.count({ 
        where: patientWhere
      }),
      db.patient.count({ 
        where: { ...patientWhere, status: 'ACTIVE' }
      }),
      db.consultation.count({ 
        where: { clinicId }
      }),
      db.document.count({ 
        where: { clinicId }
      }),
      db.patient.findMany({
        where: patientWhere,
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          fullName: true,
          createdAt: true,
        },
      }),
      db.consultation.findMany({
        where: { clinicId },
        orderBy: { date: 'desc' },
        take: 3,
        select: {
          id: true,
          date: true,
          patient: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      }),
    ])

    return {
      totalPatients,
      activePatients,
      totalConsultations,
      totalDocuments,
      recentPatients,
      recentConsultations,
    }
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error)
    return {
      totalPatients: 0,
      activePatients: 0,
      totalConsultations: 0,
      totalDocuments: 0,
      recentPatients: [],
      recentConsultations: [],
    }
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return null
  }

  const data = await getDashboardData(
    session.user.id, 
    session.user.clinicId,
    session.user.role
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header aprimorado */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50/50 to-secondary-50/50 rounded-3xl"></div>
        <div className="relative p-8 rounded-3xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold font-display text-gray-900 mb-3">
                Olá, {session.user.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-600 text-lg lg:text-xl mb-4 lg:mb-0">
                Bem-vindo ao <span className="text-gradient-primary font-semibold">Physio Capture</span>
              </p>
              <p className="text-gray-500 text-sm">
                Gerencie seus pacientes e documentos de forma inteligente
              </p>
            </div>
            <div className="mt-6 lg:mt-0">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hoje</p>
                    <p className="font-semibold text-gray-900">
                      {new Date().toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de estatísticas aprimorados */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="group">
          <StatCard
            title="Total de Pacientes"
            value={data.totalPatients}
            change={`${data.activePatients} ativos`}
            icon={Users}
            trend="up"
            className="hover-lift hover-scale group-hover:shadow-primary-lg transition-all duration-300"
          />
        </div>
        
        <div className="group">
          <StatCard
            title="Pacientes Ativos"
            value={data.activePatients}
            icon={Activity}
            trend="up"
            className="hover-lift hover-scale group-hover:shadow-secondary-lg transition-all duration-300"
          />
        </div>

        <div className="group">
          <StatCard
            title="Consultas"
            value={data.totalConsultations}
            change="Total realizadas"
            icon={Stethoscope}
            trend="up"
            className="hover-lift hover-scale group-hover:shadow-success-lg transition-all duration-300"
          />
        </div>

        <div className="group">
          <StatCard
            title="Documentos"
            value={data.totalDocuments}
            change="Arquivos armazenados"
            icon={FileText}
            trend="up"
            className="hover-lift hover-scale group-hover:shadow-lg transition-all duration-300"
          />
        </div>
      </div>

      {/* Ações Rápidas aprimoradas */}
      <Card variant="bordered" className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/80 border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5"></div>
        <CardHeader className="relative">
          <CardTitle className="text-xl font-display text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <span>Ações Rápidas</span>
            <div className="ml-auto">
              <TrendingUp className="h-5 w-5 text-primary-500 animate-bounce-gentle" />
            </div>
          </CardTitle>
          <p className="text-gray-600 text-sm">Acelere seu fluxo de trabalho</p>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/patients/new" className="group">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-primary-100 hover:border-primary-300 hover:shadow-primary-lg transition-all duration-200 hover-lift">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-primary group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">Novo Paciente</h4>
                  <p className="text-sm text-gray-600">Cadastrar paciente</p>
                </div>
              </div>
            </Link>
            
            <Link href="/patients" className="group">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-secondary-100 hover:border-secondary-300 hover:shadow-secondary-lg transition-all duration-200 hover-lift">
                <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center shadow-secondary group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-secondary-700 transition-colors">Ver Pacientes</h4>
                  <p className="text-sm text-gray-600">Listar todos</p>
                </div>
              </div>
            </Link>
            
            <Link href="/documents" className="group">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-200 hover-lift">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Upload Documento</h4>
                  <p className="text-sm text-gray-600">Selecionar paciente</p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Grids de atividade recente aprimorados */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Pacientes recentes */}
        <Card className="overflow-hidden bg-white/80 backdrop-blur-sm shadow-xl border-0 hover-lift transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100/50 border-b border-primary-100">
            <CardTitle className="text-lg font-display text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span>Pacientes Recentes</span>
              <div className="ml-auto px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                {data.recentPatients.length}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {data.recentPatients.length > 0 ? (
              <div className="space-y-4">
                {data.recentPatients.map((patient, index) => (
                  <div 
                    key={patient.id} 
                    className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-200 animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-primary group-hover:scale-110 transition-transform">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                          {patient.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Cadastrado em {new Date(patient.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Link href={`/patients/${patient.id}`}>
                      <button className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 hover:border-primary-300 transition-all duration-200 hover-lift">
                        Ver Detalhes
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Nenhum paciente ainda</h3>
                    <p className="text-gray-600 text-sm mb-4">Comece cadastrando seu primeiro paciente</p>
                  </div>
                  <Link href="/patients/new">
                    <button className="px-6 py-3 bg-gradient-primary text-white font-medium rounded-xl shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all duration-200">
                      Cadastrar Primeiro Paciente
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consultas recentes */}
        <Card className="overflow-hidden bg-white/80 backdrop-blur-sm shadow-xl border-0 hover-lift transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-secondary-50 to-secondary-100/50 border-b border-secondary-100">
            <CardTitle className="text-lg font-display text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-secondary">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span>Consultas Recentes</span>
              <div className="ml-auto px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs font-medium">
                {data.recentConsultations.length}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {data.recentConsultations.length > 0 ? (
              <div className="space-y-4">
                {data.recentConsultations.map((consultation, index) => (
                  <div 
                    key={consultation.id} 
                    className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-secondary-200 hover:shadow-md transition-all duration-200 animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center shadow-secondary group-hover:scale-110 transition-transform">
                        <Stethoscope className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-secondary-700 transition-colors">
                          {consultation.patient.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(consultation.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Link href={`/patients/${consultation.patient.id}`}>
                      <button className="px-4 py-2 text-sm font-medium text-secondary-600 bg-secondary-50 hover:bg-secondary-100 rounded-lg border border-secondary-200 hover:border-secondary-300 transition-all duration-200 hover-lift">
                        Ver Paciente
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center">
                    <Stethoscope className="h-8 w-8 text-secondary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Nenhuma consulta registrada</h3>
                    <p className="text-gray-600 text-sm">As consultas aparecerão aqui quando forem adicionadas</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
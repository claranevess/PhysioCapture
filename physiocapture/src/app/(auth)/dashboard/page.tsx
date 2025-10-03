import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Calendar, Activity, UserPlus, TrendingUp } from 'lucide-react'
import Link from 'next/link'

// Dashboard para ADMIN - Visão estratégica da clínica
async function AdminDashboard({ clinicId }: { clinicId: string }) {
  const [totalPatients, activePatients, totalUsers, totalDocuments, usersByRole] = await Promise.all([
    db.patient.count({ where: { clinicId } }),
    db.patient.count({ where: { clinicId, status: 'ACTIVE' } }),
    db.user.count({ where: { clinicId } }),
    db.document.count({ where: { clinicId } }),
    db.user.groupBy({
      by: ['role'],
      where: { clinicId },
      _count: { id: true }
    })
  ])

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administradores',
    MANAGER: 'Gerentes',
    PHYSIOTHERAPIST: 'Fisioterapeutas',
    RECEPTIONIST: 'Recepcionistas'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão da Clínica</h1>
        <p className="text-muted-foreground">Visão geral estratégica e gerenciamento de recursos</p>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Equipe da clínica</p>
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
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">Arquivos armazenados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ativação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPatients > 0 ? Math.round((activePatients / totalPatients) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Pacientes ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição da equipe */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição da Equipe</CardTitle>
          <CardDescription>Usuários por função na clínica</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {usersByRole.map((group) => (
              <div key={group.role} className="flex items-center justify-between">
                <span className="text-sm font-medium">{roleLabels[group.role] || group.role}</span>
                <span className="text-sm text-muted-foreground">{group._count.id} usuário(s)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/users">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="text-base">Gerenciar Usuários</CardTitle>
              <CardDescription>Adicionar ou editar membros da equipe</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/patients">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="text-base">Ver Pacientes</CardTitle>
              <CardDescription>Lista completa de pacientes</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/documents">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="text-base">Documentos</CardTitle>
              <CardDescription>Gerenciar arquivos da clínica</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}

// Dashboard para MANAGER - Operações e performance
async function ManagerDashboard({ clinicId }: { clinicId: string }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const [
    totalPatients,
    todayConsultations,
    monthConsultations,
    recentPatients,
    therapistStats
  ] = await Promise.all([
    db.patient.count({ where: { clinicId } }),
    db.consultation.count({
      where: {
        clinicId,
        date: { gte: today }
      }
    }),
    db.consultation.count({
      where: {
        clinicId,
        date: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1)
        }
      }
    }),
    db.patient.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        fullName: true,
        createdAt: true
      }
    }),
    db.user.findMany({
      where: {
        clinicId,
        role: 'PHYSIOTHERAPIST'
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            assignedPatients: true,
            consultations: true
          }
        }
      }
    })
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão Operacional</h1>
        <p className="text-muted-foreground">Acompanhamento de atividades e desempenho da equipe</p>
      </div>

      {/* Métricas do dia */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayConsultations}</div>
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
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">Base de pacientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance dos fisioterapeutas */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho da Equipe</CardTitle>
          <CardDescription>Carga de trabalho dos fisioterapeutas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {therapistStats.map((therapist) => (
              <div key={therapist.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{therapist.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {therapist._count.assignedPatients} pacientes atribuídos
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{therapist._count.consultations}</p>
                  <p className="text-xs text-muted-foreground">consultas realizadas</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pacientes recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Cadastros Recentes</CardTitle>
          <CardDescription>Últimos pacientes registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
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
  )
}

// Dashboard para PHYSIOTHERAPIST - Trabalho clínico
async function PhysiotherapistDashboard({ userId, clinicId }: { userId: string, clinicId: string }) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    myPatients,
    recentConsultations,
    patientsNeedingFollowup
  ] = await Promise.all([
    db.patient.count({
      where: {
        assignedTherapistId: userId,
        clinicId
      }
    }),
    db.consultation.findMany({
      where: {
        performedBy: userId,
        clinicId
      },
      orderBy: { date: 'desc' },
      take: 10,
      include: {
        patient: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    }),
    db.patient.findMany({
      where: {
        assignedTherapistId: userId,
        clinicId,
        OR: [
          { lastVisitDate: { lt: thirtyDaysAgo } },
          { lastVisitDate: null }
        ]
      },
      select: {
        id: true,
        fullName: true,
        lastVisitDate: true
      },
      take: 10
    })
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meus Pacientes</h1>
        <p className="text-muted-foreground">Acompanhamento clínico e consultas</p>
      </div>

      {/* Métricas do fisioterapeuta */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meus Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myPatients}</div>
            <p className="text-xs text-muted-foreground">Sob meus cuidados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Recentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentConsultations.length}</div>
            <p className="text-xs text-muted-foreground">Últimos atendimentos</p>
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

      {/* Consultas recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Atendimentos Recentes</CardTitle>
          <CardDescription>Suas últimas consultas realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentConsultations.map((consultation) => (
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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pacientes precisando retorno */}
      {patientsNeedingFollowup.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700">Atenção: Pacientes Precisam Retorno</CardTitle>
            <CardDescription>Sem consulta há mais de 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patientsNeedingFollowup.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="flex items-center justify-between hover:bg-orange-50 p-2 rounded-md transition-colors"
                >
                  <span className="font-medium">{patient.fullName}</span>
                  <span className="text-sm text-muted-foreground">
                    {patient.lastVisitDate 
                      ? `Última consulta: ${new Date(patient.lastVisitDate).toLocaleDateString('pt-BR')}`
                      : 'Nunca consultou'
                    }
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Dashboard para RECEPTIONIST - Cadastros e administrativo
async function ReceptionistDashboard({ clinicId }: { clinicId: string }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalPatients,
    todayPatients,
    recentPatients
  ] = await Promise.all([
    db.patient.count({ where: { clinicId } }),
    db.patient.count({
      where: {
        clinicId,
        createdAt: { gte: today }
      }
    }),
    db.patient.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: {
        id: true,
        fullName: true,
        phone: true,
        createdAt: true,
        status: true
      }
    })
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recepção</h1>
        <p className="text-muted-foreground">Cadastros e atendimento de pacientes</p>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">Na base de dados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cadastrados Hoje</CardTitle>
            <UserPlus className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{todayPatients}</div>
            <p className="text-xs text-muted-foreground">Novos pacientes</p>
          </CardContent>
        </Card>

        <Link href="/patients/new">
          <Card className="hover:bg-accent cursor-pointer transition-colors border-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cadastrar Paciente</CardTitle>
              <UserPlus className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Clique para adicionar novo</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Lista de cadastros recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Cadastros Recentes</CardTitle>
          <CardDescription>Últimos pacientes registrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentPatients.map((patient) => (
              <Link
                key={patient.id}
                href={`/patients/${patient.id}`}
                className="flex items-center justify-between hover:bg-accent p-3 rounded-md transition-colors border"
              >
                <div className="flex-1">
                  <p className="font-medium">{patient.fullName}</p>
                  <p className="text-sm text-muted-foreground">{patient.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    {new Date(patient.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    patient.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {patient.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações rápidas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/patients">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="text-base">Ver Todos os Pacientes</CardTitle>
              <CardDescription>Lista completa de pacientes cadastrados</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/documents/upload">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="text-base">Upload de Documentos</CardTitle>
              <CardDescription>Adicionar arquivos de pacientes</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const { id: userId, clinicId, role: userRole } = session.user

  if (!clinicId || !userRole) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Erro de Configuração</CardTitle>
            <CardDescription>Usuário não está associado a uma clínica</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Roteamento para dashboard apropriado baseado no role
  switch (userRole) {
    case 'ADMIN':
      return <AdminDashboard clinicId={clinicId} />
    case 'MANAGER':
      return <ManagerDashboard clinicId={clinicId} />
    case 'PHYSIOTHERAPIST':
      return <PhysiotherapistDashboard userId={userId} clinicId={clinicId} />
    case 'RECEPTIONIST':
      return <ReceptionistDashboard clinicId={clinicId} />
    default:
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Role Não Reconhecido</CardTitle>
              <CardDescription>Entre em contato com o administrador</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )
  }
}

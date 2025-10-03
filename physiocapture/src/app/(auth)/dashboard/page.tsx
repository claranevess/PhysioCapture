import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Calendar, Activity, UserPlus, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { ManagerDashboardClient } from '@/components/dashboard/manager-dashboard-client'
import { PhysiotherapistDashboardClient } from '@/components/dashboard/physiotherapist-dashboard-client'
import { AdminDashboardClient } from '@/components/dashboard/admin-dashboard-client'
import { ReceptionistDashboardClient } from '@/components/dashboard/receptionist-dashboard-client'

// Dashboard para ADMIN - Visão estratégica da clínica
async function AdminDashboard({ clinicId }: { clinicId: string }) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)

  const [
    totalPatients,
    activePatients,
    totalUsers,
    activeUsers,
    totalConsultations,
    monthConsultations,
    todayConsultations,
    clinics,
    recentUsers,
    usersByRoleRaw,
    last7DaysConsultations,
    previousWeekConsultations,
    previousMonthConsultations
  ] = await Promise.all([
    db.patient.count(),
    db.patient.count({ where: { status: 'ACTIVE' } }),
    db.user.count(),
    db.user.count({ where: { status: 'ACTIVE' } }),
    db.consultation.count(),
    db.consultation.count({ where: { date: { gte: firstDayOfMonth } } }),
    db.consultation.count({ where: { date: { gte: today } } }),
    db.clinic.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { users: true, patients: true }
        }
      }
    }),
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    }),
    db.user.groupBy({
      by: ['role'],
      _count: { id: true }
    }),
    db.consultation.findMany({
      where: { date: { gte: sevenDaysAgo } },
      select: { id: true, date: true }
    }),
    db.consultation.count({ 
      where: { 
        date: { gte: fourteenDaysAgo, lt: sevenDaysAgo }
      }
    }),
    db.consultation.count({
      where: {
        date: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth }
      }
    })
  ])

  // Formatar dados para o client
  const usersByRole = usersByRoleRaw.map(group => ({
    name: group.role,
    value: group._count.id
  }))

  return (
    <AdminDashboardClient
      totalUsers={totalUsers}
      activeUsers={activeUsers}
      totalPatients={totalPatients}
      activePatients={activePatients}
      totalConsultations={totalConsultations}
      monthConsultations={monthConsultations}
      todayConsultations={todayConsultations}
      clinics={clinics}
      recentUsers={recentUsers}
      usersByRole={usersByRole}
      last7DaysConsultations={last7DaysConsultations}
      previousWeekConsultations={previousWeekConsultations}
      previousMonthConsultations={previousMonthConsultations}
    />
  )
}

// Dashboard para MANAGER - Operações e performance
async function ManagerDashboard({ clinicId }: { clinicId: string }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const [
    totalPatients,
    activePatients,
    todayConsultationsCount,
    monthConsultations,
    todayConsultations,
    recentPatients,
    therapistStats,
    last7DaysConsultations
  ] = await Promise.all([
    db.patient.count({ where: { clinicId } }),
    db.patient.count({ where: { clinicId, status: 'ACTIVE' } }),
    db.consultation.count({
      where: {
        clinicId,
        date: { gte: today, lt: tomorrow }
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
    db.consultation.findMany({
      where: {
        clinicId,
        date: { gte: today, lt: tomorrow }
      },
      orderBy: { date: 'asc' },
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
        name: true
      }
    }),
    db.consultation.findMany({
      where: {
        clinicId,
        date: { gte: sevenDaysAgo }
      },
      select: {
        date: true
      }
    })
  ])

  return (
    <ManagerDashboardClient
      totalPatients={totalPatients}
      activePatients={activePatients}
      todayConsultationsCount={todayConsultationsCount}
      monthConsultations={monthConsultations}
      todayConsultations={todayConsultations.map(c => ({
        ...c,
        performedBy: c.performedBy || ''
      }))}
      recentPatients={recentPatients}
      therapistStats={therapistStats}
      last7DaysConsultations={last7DaysConsultations}
    />
  )
}

// Dashboard para PHYSIOTHERAPIST - Trabalho clínico
async function PhysiotherapistDashboard({ userId, clinicId }: { userId: string, clinicId: string }) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    myPatients,
    myActivePatients,
    monthConsultations,
    todayConsultations,
    recentConsultations,
    patientsNeedingFollowup,
    last7DaysConsultations
  ] = await Promise.all([
    db.patient.count({
      where: {
        assignedTherapistId: userId,
        clinicId
      }
    }),
    db.patient.count({
      where: {
        assignedTherapistId: userId,
        clinicId,
        status: 'ACTIVE'
      }
    }),
    db.consultation.count({
      where: {
        performedBy: userId,
        clinicId,
        date: { gte: firstDayOfMonth }
      }
    }),
    db.consultation.count({
      where: {
        performedBy: userId,
        clinicId,
        date: { gte: today }
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
        lastVisitDate: true,
        phone: true,
        email: true
      },
      take: 10
    }),
    db.consultation.findMany({
      where: {
        performedBy: userId,
        clinicId,
        date: { gte: sevenDaysAgo }
      },
      select: {
        date: true
      }
    })
  ])

  return (
    <PhysiotherapistDashboardClient
      myPatients={myPatients}
      myActivePatients={myActivePatients}
      monthConsultations={monthConsultations}
      todayConsultations={todayConsultations}
      recentConsultations={recentConsultations}
      patientsNeedingFollowup={patientsNeedingFollowup}
      last7DaysConsultations={last7DaysConsultations}
    />
  )
}

// Dashboard para RECEPTIONIST - Cadastros e administrativo
async function ReceptionistDashboard({ clinicId }: { clinicId: string }) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)

  const [
    totalPatients,
    activePatients,
    monthRegistrations,
    todayConsultations,
    monthConsultations,
    recentPatients,
    todayConsultations_list,
    last7DaysRegistrations,
    previousWeekRegistrations,
    previousMonthRegistrations
  ] = await Promise.all([
    db.patient.count({ where: { clinicId } }),
    db.patient.count({ where: { clinicId, status: 'ACTIVE' } }),
    db.patient.count({
      where: {
        clinicId,
        createdAt: { gte: firstDayOfMonth }
      }
    }),
    db.consultation.count({
      where: {
        clinicId,
        date: { gte: today }
      }
    }),
    db.consultation.count({
      where: {
        clinicId,
        date: { gte: firstDayOfMonth }
      }
    }),
    db.patient.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        fullName: true,
        phone: true,
        status: true,
        createdAt: true
      }
    }),
    db.consultation.findMany({
      where: {
        clinicId,
        date: { gte: today }
      },
      orderBy: { date: 'asc' },
      take: 10,
      include: {
        patient: {
          select: {
            fullName: true
          }
        }
      }
    }),
    db.patient.findMany({
      where: {
        clinicId,
        createdAt: { gte: sevenDaysAgo }
      },
      select: {
        id: true,
        createdAt: true
      }
    }),
    db.patient.count({
      where: {
        clinicId,
        createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo }
      }
    }),
    db.patient.count({
      where: {
        clinicId,
        createdAt: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth }
      }
    })
  ])

  return (
    <ReceptionistDashboardClient
      totalPatients={totalPatients}
      activePatients={activePatients}
      monthRegistrations={monthRegistrations}
      todayConsultations={todayConsultations}
      monthConsultations={monthConsultations}
      recentPatients={recentPatients}
      todayConsultations_list={todayConsultations_list}
      last7DaysRegistrations={last7DaysRegistrations}
      previousWeekRegistrations={previousWeekRegistrations}
      previousMonthRegistrations={previousMonthRegistrations}
    />
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

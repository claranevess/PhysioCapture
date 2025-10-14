import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { PatientDashboard } from '@/components/patients/patient-dashboard'
import { PatientTabs } from '@/components/patients/patient-tabs'
import { canViewAllPatients } from '@/lib/permissions'

interface PatientPageProps {
  params: { id: string }
}

async function getPatient(id: string, clinicId: string, userId: string, userRole: string) {
  // Montar o where baseado nas permissões
  const where: any = {
    id,
    clinicId, // Sempre filtra pela clínica do usuário
  }

  // Se não pode ver todos os pacientes, só pode ver os atribuídos a ele
  if (!canViewAllPatients(userRole as any)) {
    where.assignedTherapistId = userId
  }

  const patient = await db.patient.findFirst({
    where,
    include: {
      assignedTherapist: {
        select: {
          id: true,
          name: true,
          email: true,
          crm: true,
        },
      },
      consultations: {
        orderBy: { date: 'desc' },
        include: {
          performer: {
            select: {
              name: true,
            },
          },
        },
      },
      documents: {
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          consultations: true,
          documents: true,
        },
      },
    },
  })

  return patient
}

export default async function PatientPage({ params }: PatientPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.clinicId || !session?.user?.role) {
    notFound()
  }

  // Await params no Next.js 15+
  const { id } = await params

  const patient = await getPatient(
    id,
    session.user.clinicId,
    session.user.id,
    session.user.role
  )

  if (!patient) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PatientDashboard patient={patient} />
      <PatientTabs patient={patient} />
    </div>
  )
}
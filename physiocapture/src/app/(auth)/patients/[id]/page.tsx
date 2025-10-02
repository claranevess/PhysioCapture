import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { PatientDashboard } from '@/components/patients/patient-dashboard'
import { PatientTabs } from '@/components/patients/patient-tabs'

interface PatientPageProps {
  params: { id: string }
}

async function getPatient(id: string, userId: string) {
  const patient = await db.patient.findFirst({
    where: {
      id,
      userId,
    },
    include: {
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
  
  if (!session?.user) {
    notFound()
  }

  const patient = await getPatient(params.id, session.user.id)

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
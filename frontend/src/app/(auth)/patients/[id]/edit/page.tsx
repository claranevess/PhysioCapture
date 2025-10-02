import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { PatientForm } from '@/components/patients/patient-form'

interface EditPatientPageProps {
  params: { id: string }
}

async function getPatient(id: string, userId: string) {
  const patient = await db.patient.findFirst({
    where: {
      id,
      userId,
    },
  })

  return patient
}

export default async function EditPatientPage({ params }: EditPatientPageProps) {
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Paciente</h1>
        <p className="text-muted-foreground">
          Atualize as informações de {patient.fullName}
        </p>
      </div>

      <PatientForm 
        initialData={patient}
        isEditing={true}
        patientId={patient.id}
      />
    </div>
  )
}
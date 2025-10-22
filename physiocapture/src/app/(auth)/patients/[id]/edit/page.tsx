import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { PatientForm } from '@/components/patients/patient-form'
import { canViewAllPatients } from '@/lib/permissions'

interface EditPatientPageProps {
  params: Promise<{ id: string }>
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
  })

  return patient
}

export default async function EditPatientPage({ params }: EditPatientPageProps) {
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

  // Convert null to undefined for form compatibility
  const initialData = Object.fromEntries(
    Object.entries(patient).map(([key, value]) => [key, value ?? undefined])
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Paciente</h1>
        <p className="text-muted-foreground">
          Atualize as informações de {patient.fullName}
        </p>
      </div>

      <PatientForm 
        initialData={initialData}
        isEditing={true}
        patientId={patient.id}
      />
    </div>
  )
}
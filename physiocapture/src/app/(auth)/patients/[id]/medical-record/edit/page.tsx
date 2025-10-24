import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { MedicalRecordForm } from '@/components/patients/medical-record-form'
import { canViewAllPatients } from '@/lib/permissions'
import { ChevronLeft, FileEdit } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface EditMedicalRecordPageProps {
  params: { id: string }
}

async function getPatient(id: string, clinicId: string, userId: string, userRole: string) {
  const where: any = {
    id,
    clinicId,
  }

  if (!canViewAllPatients(userRole as any)) {
    where.assignedTherapistId = userId
  }

  const patient = await db.patient.findFirst({
    where,
    select: {
      id: true,
      fullName: true,
      cpf: true,
      chiefComplaint: true,
      currentIllness: true,
      medicalHistory: true,
      medications: true,
      allergies: true,
      lifestyle: true,
      physicalAssessment: true,
      generalNotes: true,
    },
  })

  return patient
}

export default async function EditMedicalRecordPage({ params }: EditMedicalRecordPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.clinicId || !session?.user?.role) {
    notFound()
  }

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

  // Preparar dados iniciais do prontuário
  const initialData = {
    chiefComplaint: patient.chiefComplaint || '',
    currentIllness: patient.currentIllness || '',
    medicalHistory: patient.medicalHistory || '',
    medications: patient.medications || '',
    allergies: patient.allergies || '',
    lifestyle: patient.lifestyle || '',
    physicalAssessment: patient.physicalAssessment || '',
    generalNotes: patient.generalNotes || '',
  }

  return (
    <div className="container max-w-5xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/patients/${id}`}>
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileEdit className="h-8 w-8 text-blue-600" />
              Editar Prontuário
            </h1>
            <p className="text-muted-foreground mt-1">
              Atualize o histórico médico e anamnese do paciente
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <MedicalRecordForm
        patientId={patient.id}
        patientName={patient.fullName}
        initialData={initialData}
      />
    </div>
  )
}

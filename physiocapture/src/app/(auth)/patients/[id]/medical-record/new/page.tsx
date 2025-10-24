import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { MedicalRecordForm } from '@/components/patients/medical-record-form'
import { canViewAllPatients } from '@/lib/permissions'
import { ChevronLeft, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface NewMedicalRecordPageProps {
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

export default async function NewMedicalRecordPage({ params }: NewMedicalRecordPageProps) {
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

  // Se já existe prontuário completo, redireciona para edição
  const hasMedicalRecord = !!(
    patient.chiefComplaint ||
    patient.currentIllness ||
    patient.medicalHistory ||
    patient.medications ||
    patient.allergies ||
    patient.lifestyle ||
    patient.physicalAssessment
  )

  if (hasMedicalRecord) {
    redirect(`/patients/${id}/medical-record/edit`)
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
              <FileText className="h-8 w-8 text-blue-600" />
              Cadastrar Prontuário
            </h1>
            <p className="text-muted-foreground mt-1">
              Preencha o histórico médico e anamnese do paciente
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <MedicalRecordForm
        patientId={patient.id}
        patientName={patient.fullName}
      />
    </div>
  )
}

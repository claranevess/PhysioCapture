import React from 'react'
// troque o alias por import relativo se o alias não estiver resolvendo
import { MedicalRecordTab } from '../../../../components/patients/medical-record-tab'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { db } from '@/lib/db'
import type { MedicalRecordFormData } from '@/lib/validations/medical-record'

interface PageProps {
  params: { id: string }
}

const normalizeMedicalRecord = (mr: any): Partial<MedicalRecordFormData> | undefined => {
  if (!mr) return undefined
  return {
    chiefComplaint: mr.chiefComplaint ?? undefined,
    currentIllness: mr.currentIllness ?? undefined,
    medicalHistory: mr.medicalHistory ?? undefined,
    medications: mr.medications ?? undefined,
    allergies: mr.allergies ?? undefined,
    lifestyle: mr.lifestyle ?? undefined,
    physicalAssessment: mr.physicalAssessment ?? undefined,
    clinicalNotes: mr.clinicalNotes ?? undefined,
  }
}

export default async function PatientPage({ params }: PageProps) {
  const patient = await db.patient.findUnique({
    where: { id: params.id },
    include: {
      medicalRecord: true,
      consultations: {
        include: { performer: true },
        orderBy: { date: 'desc' },
      },
      documents: true,
      assignedTherapist: true,
    },
  })

  if (!patient) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-red-600">Paciente não encontrado</h1>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold">{patient.fullName}</h1>
        <p className="text-gray-600">{patient.cpf}</p>
      </header>

      <Tabs defaultValue="informacoes">
        <TabsList>
          <TabsTrigger value="informacoes">Informações</TabsTrigger>
          <TabsTrigger value="consultas">Consultas</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
        </TabsList>

        <TabsContent value="informacoes">
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Dados do Paciente</h2>
          </div>
        </TabsContent>

        <TabsContent value="consultas">
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Consultas</h2>
          </div>
        </TabsContent>

        <TabsContent value="documentos">
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Documentos</h2>
          </div>
        </TabsContent>

        <TabsContent value="anamnese">
          <MedicalRecordTab
            patientId={patient.id}
            patientName={patient.fullName}
            initialData={normalizeMedicalRecord(patient.medicalRecord)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
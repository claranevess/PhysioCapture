'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Pencil,
  X,
  FileText,
  Pill,
  AlertTriangle,
  Activity,
  Clipboard,
  FileCheck,
  Heart,
} from 'lucide-react'
import { MedicalRecordForm } from './medical-record-form'
import type { MedicalRecordFormData } from '@/lib/validations/medical-record'

type MedicalRecord = Partial<MedicalRecordFormData>

interface MedicalRecordTabProps {
  patientId: string
  patientName?: string
  initialData?: MedicalRecord | null
}

export function MedicalRecordTab({ patientId, patientName, initialData }: MedicalRecordTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [record, setRecord] = useState<MedicalRecord | null>(initialData ?? null)

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar Prontuário
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="w-5 h-5 text-red-500" />
                  Queixa Principal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {record?.chiefComplaint ?? 'Não informado'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="w-5 h-5 text-orange-500" />
                  Doença Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {record?.currentIllness ?? 'Não informado'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Pill className="w-5 h-5 text-green-500" />
                  Medicamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {record?.medications ?? 'Nenhum medicamento registrado'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Alergias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {record?.allergies ?? 'Nenhuma alergia registrada'}
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clipboard className="w-5 h-5 text-purple-500" />
                  Histórico Médico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {record?.medicalHistory ?? 'Nenhum histórico registrado'}
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Hábitos de Vida
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {record?.lifestyle ?? 'Não informado'}
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileCheck className="w-5 h-5 text-indigo-500" />
                  Avaliação Física
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {record?.physicalAssessment ?? 'Nenhuma avaliação registrada'}
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-5 h-5 text-gray-500" />
                  Notas Clínicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {record?.clinicalNotes ?? 'Nenhuma nota registrada'}
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div>
          <div className="flex justify-end mb-4 gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>

          <MedicalRecordForm
            patientId={patientId}
            patientName={patientName ?? ''}
            initialData={record ?? undefined}
            onSaved={(newData: Partial<MedicalRecordFormData> | undefined) => {
              setRecord((prev) => ({ ...(prev ?? {}), ...(newData ?? {}) }))
              setIsEditing(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
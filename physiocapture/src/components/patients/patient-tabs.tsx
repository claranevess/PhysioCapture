// Onde colar: src/components/patients/patient-tabs.tsx

'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  User,
  Stethoscope,
  FileText,
  ClipboardList,
  Plus,
  Calendar,
  Edit,
  History // NOVO: Importar ícone History
} from 'lucide-react'
import Link from 'next/link'
import { PatientWithRelations } from '@/types'
import { formatDateTimeBR } from '@/lib/utils/formatters'
import { PatientHistoryLog } from './patientHistoryLog' // NOVO: Importar nosso componente de histórico

interface PatientTabsProps {
  patient: PatientWithRelations
}

// Constante consultationTypeLabels (continua igual)
const consultationTypeLabels: Record<string, string> = {
  INITIAL_EVALUATION: 'Avaliação Inicial',
  REASSESSMENT: 'Reavaliação',
  TREATMENT_SESSION: 'Sessão de Tratamento',
  DISCHARGE: 'Alta',
  RETURN: 'Retorno',
}


export function PatientTabs({ patient }: PatientTabsProps) {
  return (
    // NOVO: Aumentamos o número de colunas no grid para 5 (para a nova aba)
    <Tabs defaultValue="info" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="info" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Informações
        </TabsTrigger>
        <TabsTrigger value="consultations" className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4" />
          Consultas
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documentos
        </TabsTrigger>
        <TabsTrigger value="anamnesis" className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Anamnese
        </TabsTrigger>
        {/* NOVO: TabsTrigger para a aba Histórico */}
        <TabsTrigger value="history" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Histórico
        </TabsTrigger>
      </TabsList>

      {/* Aba Informações (código existente omitido para brevidade) */}
      <TabsContent value="info">
        <Card>
          <CardHeader>
            <CardTitle>Informações Completas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             {/* ... Conteúdo original da aba Informações ... */}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Aba Consultas (código existente omitido para brevidade) */}
      <TabsContent value="consultations">
        <Card>
           <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Histórico de Consultas</CardTitle>
              <Button asChild>
                <Link href={`/patients/${patient.id}/consultations/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Consulta
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
               {/* ... Conteúdo original da aba Consultas ... */}
            </CardContent>
        </Card>
      </TabsContent>

      {/* Aba Documentos (código existente omitido para brevidade) */}
      <TabsContent value="documents">
        <Card>
           <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Documentos ({patient.documents?.length || 0})</CardTitle>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href={`/documents/upload?patientId=${patient.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/patients/${patient.id}/documents`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Gerenciar
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
               {/* ... Conteúdo original da aba Documentos ... */}
            </CardContent>
        </Card>
      </TabsContent>

      {/* Aba Anamnese (código existente omitido para brevidade) */}
      <TabsContent value="anamnesis">
        <Card>
           <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Anamnese</CardTitle>
              <Button variant="outline" asChild>
                <Link href={`/patients/${patient.id}/edit`}> {/* Ajuste o link se necessário */}
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Anamnese
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
               {/* ... Conteúdo original da aba Anamnese ... */}
            </CardContent>
        </Card>
      </TabsContent>

      {/* NOVO: TabsContent para a aba Histórico */}
      <TabsContent value="history">
        {/* Renderizamos nosso componente aqui, passando o ID do paciente */}
        <PatientHistoryLog patientId={patient.id} />
      </TabsContent>
    </Tabs>
  )
}
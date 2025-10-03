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
  Edit
} from 'lucide-react'
import Link from 'next/link'
import { PatientWithRelations } from '@/types'
import { formatDateTimeBR } from '@/lib/utils/formatters'

interface PatientTabsProps {
  patient: PatientWithRelations
}

const consultationTypeLabels = {
  INITIAL_EVALUATION: 'Avaliação Inicial',
  REASSESSMENT: 'Reavaliação', 
  TREATMENT_SESSION: 'Sessão de Tratamento',
  DISCHARGE: 'Alta',
  RETURN: 'Retorno',
}

export function PatientTabs({ patient }: PatientTabsProps) {
  return (
    <Tabs defaultValue="info" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
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
      </TabsList>

      {/* Aba Informações */}
      <TabsContent value="info">
        <Card>
          <CardHeader>
            <CardTitle>Informações Completas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dados Pessoais */}
              <div>
                <h4 className="font-medium mb-3">Dados Pessoais</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nome:</span>
                    <span>{patient.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data de Nascimento:</span>
                    <span>{new Date(patient.dateOfBirth).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Idade:</span>
                    <span>{patient.age} anos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Telefone:</span>
                    <span>{patient.phone}</span>
                  </div>
                  {patient.phoneSecondary && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Telefone 2:</span>
                      <span>{patient.phoneSecondary}</span>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{patient.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h4 className="font-medium mb-3">Endereço</h4>
                <div className="space-y-2 text-sm">
                  {patient.zipCode && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CEP:</span>
                      <span>{patient.zipCode}</span>
                    </div>
                  )}
                  {patient.street && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rua:</span>
                      <span>{patient.street}, {patient.number}</span>
                    </div>
                  )}
                  {patient.neighborhood && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bairro:</span>
                      <span>{patient.neighborhood}</span>
                    </div>
                  )}
                  {patient.city && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cidade:</span>
                      <span>{patient.city} - {patient.state}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Aba Consultas */}
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
            {patient.consultations && patient.consultations.length > 0 ? (
              <div className="space-y-4">
                {patient.consultations.map((consultation) => (
                  <div 
                    key={consultation.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">
                          {consultationTypeLabels[consultation.type]}
                        </h4>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDateTimeBR(consultation.date)}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/patients/${patient.id}/consultations/${consultation.id}`}>
                          Ver Detalhes
                        </Link>
                      </Button>
                    </div>
                    
                    {consultation.subjective && (
                      <div className="mb-2">
                        <span className="text-sm font-medium">Queixas: </span>
                        <span className="text-sm text-muted-foreground">
                          {consultation.subjective.substring(0, 100)}
                          {consultation.subjective.length > 100 && '...'}
                        </span>
                      </div>
                    )}
                    
                    {consultation.plan && (
                      <div>
                        <span className="text-sm font-medium">Conduta: </span>
                        <span className="text-sm text-muted-foreground">
                          {consultation.plan.substring(0, 100)}
                          {consultation.plan.length > 100 && '...'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Nenhuma consulta registrada</h3>
                <p className="text-muted-foreground mb-4">
                  Comece registrando a primeira consulta deste paciente.
                </p>
                <Button asChild>
                  <Link href={`/patients/${patient.id}/consultations/new`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Primeira Consulta
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Aba Documentos */}
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
            {patient.documents && patient.documents.length > 0 ? (
              <div className="space-y-3">
                {patient.documents.slice(0, 5).map((document) => (
                  <div 
                    key={document.id}
                    className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-shadow bg-gradient-to-r from-gray-50 to-white"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{document.title || document.fileName}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(document.createdAt).toLocaleDateString('pt-BR')} • {(document.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="hover-lift">
                      Visualizar
                    </Button>
                  </div>
                ))}
                
                {patient.documents.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" asChild>
                      <Link href={`/patients/${patient.id}/documents`}>
                        Ver todos os {patient.documents.length} documentos
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Nenhum documento anexado</h3>
                <p className="text-muted-foreground mb-4">
                  Faça upload de exames, receitas e outros documentos.
                </p>
                <Button asChild>
                  <Link href={`/patients/${patient.id}/documents`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Primeiro Documento
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Aba Anamnese */}
      <TabsContent value="anamnesis">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Anamnese</CardTitle>
            <Button variant="outline" asChild>
              <Link href={`/patients/${patient.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Anamnese
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {patient.chiefComplaint && (
                <div>
                  <h4 className="font-medium mb-2">Queixa Principal</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {patient.chiefComplaint}
                  </p>
                </div>
              )}

              {patient.currentIllness && (
                <div>
                  <h4 className="font-medium mb-2">História da Doença Atual (HDA)</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {patient.currentIllness}
                  </p>
                </div>
              )}

              {patient.medicalHistory && (
                <div>
                  <h4 className="font-medium mb-2">História Médica Pregressa</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {patient.medicalHistory}
                  </p>
                </div>
              )}

              {patient.medications && (
                <div>
                  <h4 className="font-medium mb-2">Medicamentos em Uso</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {patient.medications}
                  </p>
                </div>
              )}

              {patient.allergies && (
                <div>
                  <h4 className="font-medium mb-2">Alergias</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {patient.allergies}
                  </p>
                </div>
              )}

              {patient.lifestyle && (
                <div>
                  <h4 className="font-medium mb-2">Hábitos de Vida</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {patient.lifestyle}
                  </p>
                </div>
              )}

              {patient.physicalAssessment && (
                <div>
                  <h4 className="font-medium mb-2">Avaliação Física Inicial</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {patient.physicalAssessment}
                  </p>
                </div>
              )}

              {!patient.chiefComplaint && !patient.currentIllness && !patient.medicalHistory && 
               !patient.medications && !patient.allergies && !patient.lifestyle && 
               !patient.physicalAssessment && (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Anamnese não preenchida</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete a anamnese com as informações médicas do paciente.
                  </p>
                  <Button asChild>
                    <Link href={`/patients/${patient.id}/anamnesis/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Preencher Anamnese
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
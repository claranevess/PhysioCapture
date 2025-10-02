'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DocumentUpload from '@/components/documents/DocumentUpload'
import DocumentList from '@/components/documents/DocumentList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, FileText, ArrowLeft, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { DocumentWithRelations } from '@/types'

export default function DocumentsUploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')
  
  const [documents, setDocuments] = useState<DocumentWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [patient, setPatient] = useState<any>(null)

  // Buscar documentos e dados do paciente
  const loadDocuments = async () => {
    if (!patientId) return
    
    setLoading(true)
    try {
      const [docsResponse, patientResponse] = await Promise.all([
        fetch(`/api/patients/${patientId}/documents`),
        fetch(`/api/patients/${patientId}`)
      ])

      if (docsResponse.ok) {
        const docsData = await docsResponse.json()
        setDocuments(docsData.documents || [])
      }

      if (patientResponse.ok) {
        const patientData = await patientResponse.json()
        setPatient(patientData.patient)
      }
    } catch (error) {
      toast.error('Erro ao carregar documentos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [patientId])

  const handleUploadComplete = (document: DocumentWithRelations) => {
    setDocuments(prev => [document, ...prev])
    toast.success('Documento enviado com sucesso!')
  }

  const handleDownload = async (documentId: string) => {
    try {
      const doc = documents.find(d => d.id === documentId)
      if (!doc) return

      const response = await fetch(doc.fileUrl)
      if (!response.ok) throw new Error('Erro ao baixar arquivo')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Download iniciado!')
    } catch (error) {
      toast.error('Erro ao fazer download do arquivo')
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return

    try {
      const response = await fetch(`/api/patients/${patientId}/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir documento')
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      toast.success('Documento excluído com sucesso!')
    } catch (error) {
      toast.error('Erro ao excluir documento')
    }
  }

  if (!patientId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum paciente selecionado
            </h3>
            <p className="text-gray-600 mb-6">
              Selecione um paciente para gerenciar seus documentos
            </p>
            <Link href="/patients">
              <Button className="bg-gradient-primary hover:shadow-primary-lg">
                Ver Pacientes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={patient ? `/patients/${patient.id}` : '/patients'}>
            <Button variant="outline" size="sm" className="hover-lift">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-display text-gray-900">
              Documentos Médicos
            </h1>
            {patient && (
              <p className="text-gray-600 mt-1">
                Paciente: <span className="font-semibold">{patient.fullName}</span>
              </p>
            )}
          </div>
        </div>
        <Button 
          onClick={loadDocuments} 
          variant="outline" 
          size="sm"
          disabled={loading}
          className="hover-lift"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger 
            value="upload" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Novo Upload
          </TabsTrigger>
          <TabsTrigger 
            value="list" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Documentos ({documents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <DocumentUpload
            patientId={patientId}
            onUploadComplete={handleUploadComplete}
            onCancel={() => router.back()}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <DocumentList
            documents={documents}
            onDownload={handleDownload}
            onDelete={handleDelete}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
// Onde colar: src/app/(auth)/patients/[id]/documents/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ArrowLeft, Upload, Download, FileText, Trash2 } from 'lucide-react'
import Link from 'next/link'
import DocumentUpload from '@/components/documents/DocumentUpload'
import DocumentList from '@/components/documents/DocumentList'
import { DocumentWithRelations } from '@/types'

export default function PatientDocumentsPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string
  
  const [patient, setPatient] = useState<any>(null)
  const [documents, setDocuments] = useState<DocumentWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // Carregar dados do paciente
        const patientResponse = await fetch(`/api/patients/${patientId}`)
        if (patientResponse.ok) {
          const patientData = await patientResponse.json()
          setPatient(patientData) // Corrigido: API retorna o paciente diretamente
        }

        // Carregar documentos
        const documentsResponse = await fetch(`/api/patients/${patientId}/documents`)
        if (documentsResponse.ok) {
          const documentsData = await documentsResponse.json()
          setDocuments(documentsData.documents)
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Não foi possível carregar os dados')
      } finally {
        setLoading(false)
      }
    }
    if (patientId) {
      loadData()
    }
  }, [patientId])

  // ... (handleUploadComplete, handleDownload, handleDelete continuam os mesmos)
  // Callback para quando upload for concluído
  const handleUploadComplete = (document: DocumentWithRelations) => {
    setDocuments(prev => [document, ...prev])
    setShowUpload(false)
    toast.success('Documento enviado com sucesso')
  }

  // Download de documento
  const handleDownload = async (documentId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/documents/${documentId}`)
      if (response.ok) {
        const data = await response.json()
        // Abrir URL em nova aba
        window.open(data.downloadUrl, '_blank')
      } else {
        throw new Error('Erro ao gerar link de download')
      }
    } catch (error) {
      toast.error('Não foi possível baixar o documento')
    }
  }

  // Deletar documento
  const handleDelete = async (documentId: string) => {
    if (!confirm('Tem certeza que deseja deletar este documento?')) {
      return
    }

    try {
      const response = await fetch(`/api/patients/${patientId}/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
        toast.success('Documento deletado com sucesso')
      } else {
        throw new Error('Erro ao deletar documento')
      }
    } catch (error) {
      toast.error('Não foi possível deletar o documento')
    }
  }

  // NOVA FUNÇÃO: handleUpdate
  // Esta função vai receber o documento atualizado do nosso formulário
  // e atualizar a lista de documentos na tela.
  const handleUpdate = (updatedDocument: DocumentWithRelations) => {
    setDocuments(currentDocuments => 
      currentDocuments.map(doc => 
        doc.id === updatedDocument.id ? updatedDocument : doc
      )
    )
  }

  if (loading) {
    // ... (código de loading continua o mesmo)
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 rounded bg-gray-200 animate-pulse" />
          <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="h-64 rounded bg-gray-200 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ... (cabeçalho e estatísticas continuam os mesmos) */}
      {/* Cabeçalho */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/patients/${patientId}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Documentos</h1>
                  {patient && (
                    <p className="text-muted-foreground">
                      {patient.fullName}
                    </p>
                  )}
                </div>
              </div>
      
              <Dialog open={showUpload} onOpenChange={setShowUpload}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Novo Documento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Upload de Documentos</DialogTitle>
                  </DialogHeader>
                  <DocumentUpload
                    patientId={patientId}
                    onUploadComplete={handleUploadComplete}
                    onCancel={() => setShowUpload(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
      
            {/* Estatísticas Rápidas */}
            {documents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Total</p>
                        <p className="text-2xl font-bold">{documents.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Upload className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Este Mês</p>
                        <p className="text-2xl font-bold">
                          {documents.filter(doc => {
                            const docDate = new Date(doc.createdAt)
                            const now = new Date()
                            return docDate.getMonth() === now.getMonth() && 
                                   docDate.getFullYear() === now.getFullYear()
                          }).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
      
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Categorias</p>
                        <p className="text-2xl font-bold">
                          {new Set(documents.map(d => d.category)).size}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
      
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Download className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">Tamanho</p>
                        <p className="text-2xl font-bold">
                          {Math.round(documents.reduce((sum, d) => sum + d.fileSize, 0) / 1024 / 1024)}MB
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

      <Card>
        <CardHeader>
          <CardTitle>Documentos do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentList
            documents={documents}
            onDownload={()=>{}} // handleDownload (precisaria ser definido)
            onDelete={()=>{}}  // handleDelete (precisaria ser definido)
            onUpdate={handleUpdate} // <-- PASSAMOS A NOVA FUNÇÃO AQUI
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
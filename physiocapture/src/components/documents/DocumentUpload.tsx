import React, { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  X, 
  AlertCircle, 
  CheckCircle,
  Camera,
  Loader2,
  Eye,
  Download,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FileUpload {
  file: File
  preview: string
  category: string
  title: string
  description: string
  uploadProgress?: number
  uploaded?: boolean
  error?: string
}

interface DocumentUploadProps {
  patientId: string
  onUploadComplete?: (document: any) => void
  onCancel?: () => void
  className?: string
}

const DOCUMENT_CATEGORIES = [
  { value: 'EXAME_IMAGEM', label: 'Exame de Imagem', icon: '🔬', color: 'bg-blue-100 text-blue-800' },
  { value: 'EXAME_LABORATORIAL', label: 'Exame Laboratorial', icon: '🧪', color: 'bg-green-100 text-green-800' },
  { value: 'RECEITA', label: 'Receita Médica', icon: '💊', color: 'bg-purple-100 text-purple-800' },
  { value: 'ATESTADO', label: 'Atestado', icon: '📋', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONSENTIMENTO', label: 'Termo de Consentimento', icon: '📝', color: 'bg-orange-100 text-orange-800' },
  { value: 'ANAMNESE', label: 'Anamnese', icon: '📊', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'RELATORIO_EVOLUCAO', label: 'Relatório de Evolução', icon: '📈', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'OUTROS', label: 'Outros', icon: '📄', color: 'bg-gray-100 text-gray-800' },
]

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/tiff': ['.tiff', '.tif'],
  'text/plain': ['.txt'],
}

export default function DocumentUpload({ patientId, onUploadComplete, onCancel, className }: DocumentUploadProps) {
  const [files, setFiles] = useState<FileUpload[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null)
    
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      category: '',
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extensão
      description: '',
      uploadProgress: 0,
      uploaded: false
    }))
    
    setFiles(prev => [...prev, ...newFiles])
    toast.success(`${acceptedFiles.length} arquivo(s) adicionado(s)`)
  }, [])

  // Função para capturar foto da câmera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Câmera traseira preferencial
      })
      setCameraStream(stream)
      setShowCamera(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      toast.error('Erro ao acessar a câmera')
      console.error('Camera error:', error)
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            const file = new File([blob], `foto-${timestamp}.jpg`, { type: 'image/jpeg' })
            
            const newFile: FileUpload = {
              file,
              preview: URL.createObjectURL(file),
              category: '',
              title: `Foto ${new Date().toLocaleDateString('pt-BR')}`,
              description: 'Capturada via câmera',
              uploadProgress: 0,
              uploaded: false
            }
            
            setFiles(prev => [...prev, newFile])
            stopCamera()
            toast.success('Foto capturada com sucesso!')
          }
        }, 'image/jpeg', 0.8)
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: (rejectedFiles) => {
      const errors = rejectedFiles.map(({ errors }) => 
        errors.map(error => error.message).join(', ')
      )
      setError(`Arquivos rejeitados: ${errors.join('; ')}`)
    }
  })

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const updateFileData = (index: number, field: keyof FileUpload, value: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, [field]: value } : file
    ))
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    // Validar se todos os arquivos têm categoria
    const filesWithoutCategory = files.filter(f => !f.category)
    if (filesWithoutCategory.length > 0) {
      setError('Todos os arquivos devem ter uma categoria selecionada')
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Upload sequencial para melhor controle de progresso
      for (let i = 0; i < files.length; i++) {
        const fileUpload = files[i]
        
        // Atualizar estado do arquivo
        setFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, uploadProgress: 0 } : f
        ))

        const formData = new FormData()
        formData.append('file', fileUpload.file)
        formData.append('category', fileUpload.category)
        formData.append('title', fileUpload.title)
        formData.append('description', fileUpload.description)

        try {
          const response = await fetch(`/api/patients/${patientId}/documents`, {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Erro ao fazer upload')
          }

          const result = await response.json()
          
          // Marcar como uploaded
          setFiles(prev => prev.map((f, index) => 
            index === i ? { ...f, uploaded: true, uploadProgress: 100 } : f
          ))

          // Notificar conclusão individual
          onUploadComplete?.(result.document)

        } catch (error) {
          // Marcar erro no arquivo específico
          setFiles(prev => prev.map((f, index) => 
            index === i ? { 
              ...f, 
              error: error instanceof Error ? error.message : 'Erro no upload',
              uploadProgress: 0 
            } : f
          ))
        }

        // Atualizar progresso geral
        setUploadProgress(((i + 1) / files.length) * 100)
      }

      // Verificar se houve algum erro
      const filesWithErrors = files.filter(f => f.error)
      if (filesWithErrors.length === 0) {
        toast.success(`${files.length} documento(s) enviado(s) com sucesso!`)
        
        // Limpar previews apenas dos arquivos que foram enviados
        files.forEach(file => {
          if (!file.error) {
            URL.revokeObjectURL(file.preview)
          }
        })
        
        // Remover apenas arquivos sem erro
        setFiles(prev => prev.filter(f => f.error))
      } else {
        toast.warning(`${files.length - filesWithErrors.length} arquivo(s) enviado(s). ${filesWithErrors.length} com erro.`)
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao fazer upload dos arquivos')
      toast.error('Erro no upload dos documentos')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-gray-900">Upload de Documentos</h2>
          <p className="text-gray-600 mt-1">Adicione documentos médicos do paciente</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={startCamera}
            className="hover-lift"
            disabled={uploading}
          >
            <Camera className="w-4 h-4 mr-2" />
            Capturar Foto
          </Button>
        </div>
      </div>

      {/* Modal da Câmera */}
      {showCamera && (
        <Card className="overflow-hidden border-2 border-primary-200 shadow-xl">
          <CardHeader className="bg-gradient-primary text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Capturar Documento
              </CardTitle>
              <Button variant="ghost" onClick={stopCamera} className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white/50 rounded-lg" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                  Posicione o documento dentro da moldura
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <Button onClick={capturePhoto} className="bg-gradient-primary hover:shadow-primary-lg">
                <Camera className="w-5 h-5 mr-2" />
                Capturar Foto
              </Button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>
      )}

      {/* Área de Drop */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200",
              isDragActive 
                ? 'border-primary-500 bg-primary-50 transform scale-[1.02]' 
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200",
                isDragActive ? 'bg-primary-500 text-white scale-110' : 'bg-gray-100 text-gray-600'
              )}>
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  {isDragActive ? 'Solte os arquivos aqui...' : 'Arraste arquivos ou clique para selecionar'}
                </p>
                <p className="text-gray-600">
                  Suporte para PDF, DOC, DOCX, JPG, PNG, WEBP, TIFF, TXT
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Tamanho máximo: 10MB por arquivo
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Arquivos Melhorada */}
      {files.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Arquivos Selecionados ({files.length})
              </CardTitle>
              {uploading && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">Enviando...</span>
                </div>
              )}
            </div>
            {uploading && (
              <div className="mt-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-gray-600 mt-1">
                  {Math.round(uploadProgress)}% concluído
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {files.map((fileUpload, index) => {
                const categoryInfo = DOCUMENT_CATEGORIES.find(cat => cat.value === fileUpload.category)
                
                return (
                  <Card key={index} className={cn(
                    "transition-all duration-200 border",
                    fileUpload.uploaded ? 'border-success-200 bg-success-50' :
                    fileUpload.error ? 'border-error-200 bg-error-50' :
                    'border-gray-200 hover:border-gray-300'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        {/* Preview/Ícone melhorado */}
                        <div className="flex-shrink-0 relative">
                          {fileUpload.file.type.startsWith('image/') ? (
                            <div className="relative group">
                              <img
                                src={fileUpload.preview}
                                alt="Preview"
                                className="h-20 w-20 rounded-xl object-cover border-2 border-gray-200"
                              />
                              <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-gray-200">
                              {getFileIcon(fileUpload.file)}
                            </div>
                          )}
                          
                          {/* Status indicator */}
                          {fileUpload.uploaded && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                          {fileUpload.error && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-error-500 rounded-full flex items-center justify-center">
                              <AlertCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Informações do Arquivo */}
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-900">{fileUpload.file.name}</p>
                                {categoryInfo && (
                                  <Badge className={categoryInfo.color}>
                                    {categoryInfo.icon} {categoryInfo.label}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {formatFileSize(fileUpload.file.size)}
                              </p>
                              {fileUpload.error && (
                                <p className="text-sm text-error-600 mt-1">
                                  ❌ {fileUpload.error}
                                </p>
                              )}
                              {fileUpload.uploaded && (
                                <p className="text-sm text-success-600 mt-1">
                                  ✅ Enviado com sucesso
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                              disabled={uploading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Progress bar individual */}
                          {uploading && fileUpload.uploadProgress !== undefined && (
                            <div className="w-full">
                              <Progress value={fileUpload.uploadProgress} className="h-2" />
                            </div>
                          )}

                          {/* Formulário de Metadados */}
                          {!fileUpload.uploaded && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`category-${index}`} className="text-sm font-medium">
                                  Categoria *
                                </Label>
                                <Select
                                  value={fileUpload.category}
                                  onValueChange={(value) => updateFileData(index, 'category', value)}
                                  disabled={uploading}
                                >
                                  <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Selecione a categoria" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DOCUMENT_CATEGORIES.map(cat => (
                                      <SelectItem key={cat.value} value={cat.value}>
                                        <div className="flex items-center gap-2">
                                          <span>{cat.icon}</span>
                                          <span>{cat.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`title-${index}`} className="text-sm font-medium">
                                  Título
                                </Label>
                                <Input
                                  id={`title-${index}`}
                                  value={fileUpload.title}
                                  onChange={(e) => updateFileData(index, 'title', e.target.value)}
                                  placeholder="Nome do documento"
                                  className="h-10"
                                  disabled={uploading}
                                />
                              </div>

                              <div className="lg:col-span-2 space-y-2">
                                <Label htmlFor={`description-${index}`} className="text-sm font-medium">
                                  Descrição
                                </Label>
                                <Textarea
                                  id={`description-${index}`}
                                  value={fileUpload.description}
                                  onChange={(e) => updateFileData(index, 'description', e.target.value)}
                                  placeholder="Notas ou observações sobre o documento"
                                  rows={2}
                                  disabled={uploading}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erro */}
      {error && (
        <Alert variant="destructive" className="border-error-200 bg-error-50">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {/* Ações */}
      {files.length > 0 && (
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <p><strong>{files.length}</strong> arquivo(s) selecionado(s)</p>
                  <p><strong>{files.filter(f => f.uploaded).length}</strong> enviado(s)</p>
                  {files.filter(f => f.error).length > 0 && (
                    <p className="text-error-600">
                      <strong>{files.filter(f => f.error).length}</strong> com erro
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onCancel} 
                  disabled={uploading}
                  className="hover-lift"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading || files.every(f => f.uploaded)}
                  className="bg-gradient-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Enviar {files.filter(f => !f.uploaded).length} arquivo(s)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
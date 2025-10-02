import React, { useState } from 'react'
import { DocumentWithRelations, DocumentCategory } from '@/types'
import { Document as PrismaDocument } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  Search, 
  Calendar,
  User,
  Filter,
  Grid,
  List,
  Eye,
  MoreVertical,
  FolderOpen
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface DocumentListProps {
  documents: DocumentWithRelations[]
  onDownload?: (documentId: string) => void
  onDelete?: (documentId: string) => void
  loading?: boolean
}

const DOCUMENT_CATEGORIES: Record<DocumentCategory, { label: string; color: string; icon: string }> = {
  EXAME_IMAGEM: { label: 'Exame de Imagem', color: 'bg-blue-100 text-blue-800', icon: '🔬' },
  EXAME_LABORATORIAL: { label: 'Exame Laboratorial', color: 'bg-green-100 text-green-800', icon: '🧪' },
  RECEITA: { label: 'Receita Médica', color: 'bg-purple-100 text-purple-800', icon: '💊' },
  ATESTADO: { label: 'Atestado', color: 'bg-yellow-100 text-yellow-800', icon: '📋' },
  CONSENTIMENTO: { label: 'Termo de Consentimento', color: 'bg-red-100 text-red-800', icon: '📝' },
  ANAMNESE: { label: 'Anamnese', color: 'bg-indigo-100 text-indigo-800', icon: '📊' },
  RELATORIO_EVOLUCAO: { label: 'Relatório de Evolução', color: 'bg-pink-100 text-pink-800', icon: '📈' },
  OUTROS: { label: 'Outros', color: 'bg-gray-100 text-gray-800', icon: '📄' },
}

export default function DocumentList({ documents, onDownload, onDelete, loading }: DocumentListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />
    }
    return <FileText className="h-5 w-5 text-gray-600" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="flex space-x-4">
                  <div className="rounded bg-gray-200 h-12 w-12"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros e Busca</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome, descrição ou arquivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {Object.entries(DOCUMENT_CATEGORIES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {documents.length === 0 ? 'Nenhum documento' : 'Nenhum documento encontrado'}
            </h3>
            <p className="text-gray-600">
              {documents.length === 0 
                ? 'Faça upload do primeiro documento deste paciente.'
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Ícone */}
                  <div className="flex-shrink-0 pt-1">
                    {getFileIcon(document.mimeType)}
                  </div>

                  {/* Informações Principais */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {document.title || document.fileName}
                        </h4>
                        {document.title && document.title !== document.fileName && (
                          <p className="text-sm text-gray-600 truncate">
                            Arquivo: {document.fileName}
                          </p>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDownload?.(document.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete?.(document.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Metadados */}
                    <div className="mt-2 flex items-center flex-wrap gap-2">
                      <Badge className={DOCUMENT_CATEGORIES[document.category]?.color}>
                        {DOCUMENT_CATEGORIES[document.category]?.label}
                      </Badge>
                      
                      <span className="text-sm text-gray-500">
                        {formatFileSize(document.fileSize)}
                      </span>

                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(document.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>

                      {document.uploader && (
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-3 w-3 mr-1" />
                          {document.uploader.name}
                        </div>
                      )}
                    </div>

                    {/* Descrição */}
                    {document.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {document.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estatísticas */}
      {documents.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
                <p className="text-sm text-gray-600">Total de Documentos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{filteredDocuments.length}</p>
                <p className="text-sm text-gray-600">Exibindo</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(documents.map(d => d.category)).size}
                </p>
                <p className="text-sm text-gray-600">Categorias</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(documents.reduce((sum, d) => sum + d.fileSize, 0) / 1024 / 1024)}MB
                </p>
                <p className="text-sm text-gray-600">Tamanho Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Upload, 
  Search, 
  Filter, 
  FileText, 
  User, 
  Calendar,
  FolderOpen,
  AlertCircle,
  Users
} from 'lucide-react'
import { PatientWithRelations } from '@/types'
import { toast } from 'sonner'
import Link from 'next/link'

export default function DocumentsPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<PatientWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Carregar pacientes
  useEffect(() => {
    async function loadPatients() {
      try {
        setLoading(true)
        const response = await fetch('/api/patients')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar pacientes')
        }
        
        const data = await response.json()
        setPatients(data.data || []) // A API retorna os pacientes em data.data
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error)
        toast.error('Erro ao carregar lista de pacientes')
      } finally {
        setLoading(false)
      }
    }

    loadPatients()
  }, [])

  // Filtrar pacientes por nome
  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      case 'EVALUATION': return 'bg-yellow-100 text-yellow-800'
      case 'DISCHARGED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Ativo'
      case 'INACTIVE': return 'Inativo'
      case 'EVALUATION': return 'Em Avaliação'
      case 'DISCHARGED': return 'Alta'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando pacientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
        <p className="text-muted-foreground">
          Selecione um paciente para fazer upload ou visualizar documentos
        </p>
      </div>

      {/* Ações rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Upload className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Upload de Documentos</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione um paciente abaixo para fazer upload
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold">Total de Documentos</h3>
                <p className="text-sm text-muted-foreground">
                  {patients.reduce((total, patient) => total + (patient._count?.documents || 0), 0)} documentos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">Pacientes Ativos</h3>
                <p className="text-sm text-muted-foreground">
                  {patients.filter(p => p.status === 'ACTIVE').length} pacientes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca e filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Selecionar Paciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de pacientes */}
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">
                {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Tente buscar com um termo diferente' 
                  : 'Cadastre o primeiro paciente para começar'
                }
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link href="/patients/new">
                    <User className="h-4 w-4 mr-2" />
                    Cadastrar Primeiro Paciente
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPatients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {patient.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate mb-1">
                          {patient.fullName}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getStatusColor(patient.status)}`}
                          >
                            {getStatusLabel(patient.status)}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>{patient._count?.documents || 0} documentos</span>
                          </div>
                          {patient.lastVisitDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Última visita: {new Date(patient.lastVisitDate).toLocaleDateString('pt-BR')}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => router.push(`/documents/upload?patientId=${patient.id}`)}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Upload
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.push(`/patients/${patient.id}/documents`)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Ver Docs
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
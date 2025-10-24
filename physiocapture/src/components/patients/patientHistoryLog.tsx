// Onde colar: src/components/patients/PatientHistoryLog.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, History, User, Clock, Edit3, PlusCircle, Trash2 } from 'lucide-react' // NOVO: Mais ícones
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns' // NOVO: Importar 'format' de date-fns
import { ptBR } from 'date-fns/locale' // NOVO: Importar locale ptBR

// Interface AuditLogEntry (continua igual)
interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  entityType?: string | null;
  entityId?: string | null;
}

// Interface PatientHistoryLogProps (continua igual)
interface PatientHistoryLogProps {
  patientId: string;
}

// --- NOVO: Função auxiliar para escolher um ícone baseado na ação ---
const getIconForAction = (action: string) => {
  if (action.includes('CREATE')) return <PlusCircle className="h-4 w-4 text-green-600" />;
  if (action.includes('UPDATE')) return <Edit3 className="h-4 w-4 text-blue-600" />;
  if (action.includes('DELETE')) return <Trash2 className="h-4 w-4 text-red-600" />;
  if (action.includes('UPLOAD')) return <FileText className="h-4 w-4 text-purple-600" />;
  return <History className="h-4 w-4 text-gray-500" />; // Ícone padrão
};


export function PatientHistoryLog({ patientId }: PatientHistoryLogProps) {
  // Estados (continuam iguais)
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)

  // Função fetchHistory (continua igual)
  const fetchHistory = async (pageToFetch: number) => {
    // ... (código da função fetchHistory continua o mesmo da Etapa 2) ...
     setLoading(true)
    setError(null)

    try {
      const apiUrl = `/api/patients/${patientId}/history?page=${pageToFetch}&limit=20`
      console.log("Buscando histórico em:", apiUrl)

      const response = await fetch(apiUrl)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao buscar o histórico')
      }

      setLogs(data.data || [])
      setCurrentPage(data.pagination.page)
      setTotalPages(data.pagination.totalPages)

    } catch (err) {
      console.error("Erro ao buscar histórico:", err)
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido'
      setError(errorMessage)
      setLogs([])

    } finally {
      setLoading(false)
    }
  }

  // useEffect (continua igual)
  useEffect(() => {
    fetchHistory(currentPage)
  }, [patientId, currentPage])

  // Renderização Condicional (Loading) - Continua igual
  if (loading) {
     return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Alterações
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-10">
              <LoadingSpinner text="Carregando histórico..." />
            </CardContent>
          </Card>
        )
  }

  // Renderização Condicional (Error) - Continua igual
  if (error) {
     return (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Erro ao Carregar Histórico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-red-600">{error}</p>
              <Button
                variant="destructive"
                onClick={() => fetchHistory(currentPage)}
              >
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        )
  }

  // --- Renderização Principal (AGORA COM A LISTA DE LOGS) ---
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Alterações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          // Mensagem se não houver logs
          <p className="text-muted-foreground text-center py-10">
            Nenhuma alteração registrada para este paciente ainda.
          </p>
        ) : (
          // Lista de logs se houver dados
          <div className="space-y-4">
            {/* Iteramos sobre a lista de logs no estado */}
            {logs.map((log) => (
              // Usamos um Card simples para cada entrada de log
              <Card key={log.id} className="bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Ícone baseado na ação */}
                    <div className="mt-1 flex-shrink-0">
                      {getIconForAction(log.action)}
                    </div>
                    {/* Detalhes do log */}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-gray-800">{log.details}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {/* Usuário */}
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {log.userName} ({log.userRole})
                        </span>
                        {/* Data e Hora */}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {/* Formatamos a data/hora para o formato brasileiro */}
                          {format(new Date(log.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* TODO: Adicionar controles de paginação aqui (Etapa 4) */}
      </CardContent>
    </Card>
  )
}
// Onde colar: src/components/patients/PatientHistoryLog.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, History } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button' // NOVO: Importar Button para "Tentar Novamente"

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

export function PatientHistoryLog({ patientId }: PatientHistoryLogProps) {
  // Estados (continuam iguais)
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)

  // --- NOVO: Função para buscar os dados ---
  const fetchHistory = async (pageToFetch: number) => {
    setLoading(true) // Ativa o loading
    setError(null)   // Limpa erros anteriores

    try {
      // Monta a URL da API, incluindo os parâmetros de paginação
      const apiUrl = `/api/patients/${patientId}/history?page=${pageToFetch}&limit=20`
      console.log("Buscando histórico em:", apiUrl) // Log para debug

      const response = await fetch(apiUrl)
      const data = await response.json()

      if (!response.ok) {
        // Se a API retornar um erro, lança uma exceção
        throw new Error(data.error || 'Falha ao buscar o histórico')
      }

      // Atualiza os estados com os dados recebidos
      setLogs(data.data || []) // Atualiza a lista de logs
      setCurrentPage(data.pagination.page) // Atualiza a página atual
      setTotalPages(data.pagination.totalPages) // Atualiza o total de páginas

    } catch (err) {
      // Se ocorrer um erro (na rede ou lançado acima), atualiza o estado de erro
      console.error("Erro ao buscar histórico:", err)
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido'
      setError(errorMessage)
      setLogs([]) // Limpa os logs em caso de erro

    } finally {
      // Independentemente de sucesso ou erro, desativa o loading
      setLoading(false)
    }
  }

  // --- useEffect modificado ---
  // Agora ele chama a função fetchHistory
  useEffect(() => {
    // Busca os dados da página atual sempre que patientId ou currentPage mudar
    fetchHistory(currentPage)
  }, [patientId, currentPage]) // Dependências do useEffect

  // --- Renderização Condicional (Loading) - Continua igual ---
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

  // --- Renderização Condicional (Error) - Modificada com botão ---
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
          {/* NOVO: Botão para tentar buscar novamente */}
          <Button
            variant="destructive"
            onClick={() => fetchHistory(currentPage)} // Chama a busca novamente
          >
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  // --- Renderização Principal (Ainda com placeholder) ---
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Alterações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* TODO: Renderizar a lista de logs aqui (Etapa 3) */}
        {logs.length === 0 ? (
           <p className="text-muted-foreground text-center py-10">Nenhuma alteração registrada para este paciente ainda.</p>
        ) : (
           <p>Logs serão exibidos aqui...</p> // Placeholder
        )}
        {/* TODO: Adicionar controles de paginação aqui (Etapa 4) */}
      </CardContent>
    </Card>
  )
}
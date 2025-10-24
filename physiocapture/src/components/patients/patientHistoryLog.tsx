// Onde colar: src/components/patients/PatientHistoryLog.tsx

// Necessário para componentes com interatividade (hooks como useState, useEffect)
'use client'

// --- 1. Importações ---
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, History } from 'lucide-react' // Ícones
import { LoadingSpinner } from '@/components/ui/loading-spinner' // Componente de loading

// --- 2. Definição do Tipo de Log (Como esperamos receber da API) ---
// Baseado no contrato que definimos para a API GET /api/patients/[id]/history
interface AuditLogEntry {
  id: string;
  timestamp: string; // Vem como string ISO da API
  userName: string;
  userRole: string; // Poderia ser UserRole se importássemos do @prisma/client
  action: string;
  details: string;
  entityType?: string | null;
  entityId?: string | null;
}

// --- 3. Propriedades do Componente ---
// O componente precisa saber de qual paciente buscar o histórico
interface PatientHistoryLogProps {
  patientId: string;
}

// --- 4. O Componente Principal ---
export function PatientHistoryLog({ patientId }: PatientHistoryLogProps) {
  // --- 5. Estados do Componente ---
  // Para guardar a lista de logs recebida da API
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  // Para indicar se estamos buscando os dados
  const [loading, setLoading] = useState<boolean>(true) // Começa como true, pois vamos buscar logo ao carregar
  // Para guardar qualquer erro que ocorra na busca
  const [error, setError] = useState<string | null>(null)
  // Para guardar informações de paginação (começaremos simples, depois adicionamos)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)

  // --- 6. Lógica de Busca (Será implementada na Etapa 2) ---
  // Por enquanto, apenas um placeholder
  useEffect(() => {
    // TODO: Buscar dados da API /api/patients/[patientId]/history aqui
    console.log("Componente PatientHistoryLog montado para paciente:", patientId)
    // Simulando o fim do carregamento (removeremos isso depois)
    setTimeout(() => setLoading(false), 1000);
  }, [patientId, currentPage]) // A busca será refeita se o patientId ou a página mudar

  // --- 7. Renderização Condicional ---
  // Mostra o spinner enquanto 'loading' for true
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

  // Mostra uma mensagem de erro se 'error' tiver algum valor
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            Erro ao Carregar Histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          {/* TODO: Adicionar um botão de "Tentar Novamente" */}
        </CardContent>
      </Card>
    )
  }

  // --- 8. Renderização Principal (Será implementada na Etapa 3) ---
  // Se não está carregando e não deu erro, mostra a lista (por enquanto, vazia)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Alterações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* TODO: Renderizar a lista de logs aqui */}
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
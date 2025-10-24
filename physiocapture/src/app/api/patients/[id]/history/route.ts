// Onde colar: src/app/api/patients/[id]/history/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth' // Autenticação
import { db } from '@/lib/db'             // Acesso ao banco de dados Prisma
import { canViewAllPatients } from '@/lib/permissions' // Lógica de permissão

// --- FUNÇÃO GET para buscar o histórico ---
export async function GET(
  request: Request, // A requisição recebida
  { params }: { params: Promise<{ id: string }> } // Parâmetros da URL (o ID do paciente)
) {
  try {
    // 1. --- Autenticação e Autorização ---
    const session = await getServerSession(authOptions)
    // Garante que o usuário está logado e associado a uma clínica
    if (!session?.user?.id || !session.user.clinicId || !session.user.role) {
      return NextResponse.json({ error: 'Não autenticado ou dados de sessão incompletos' }, { status: 401 })
    }

    const { id: patientId } = await params // Pega o ID do paciente da URL

    // 2. --- Verificação de Permissão (Paciente pertence à clínica?) ---
    // Monta a condição para buscar o paciente
    const patientWhere: any = {
      id: patientId,
      clinicId: session.user.clinicId, // Paciente DEVE ser da mesma clínica do usuário
    }
    // Se o usuário for Fisioterapeuta, ele só pode ver histórico de pacientes atribuídos a ele
    if (!canViewAllPatients(session.user.role)) {
      patientWhere.assignedTherapistId = session.user.id
    }

    // Busca o paciente só para confirmar que ele existe e o usuário tem acesso
    const patientExists = await db.patient.findFirst({
      where: patientWhere,
      select: { id: true }, // Só precisamos saber se existe
    })

    if (!patientExists) {
      // Se não encontrou o paciente (ou não tem permissão), retorna erro
      return NextResponse.json({ error: 'Paciente não encontrado ou acesso negado' }, { status: 404 })
    }

    // 3. --- Paginação (Opcional, mas bom para muitos logs) ---
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1') // Pega o número da página da URL (?page=...)
    const limit = parseInt(searchParams.get('limit') || '20') // Pega o limite de itens por página (?limit=...)
    const skip = (page - 1) * limit // Calcula quantos itens pular

    // 4. --- Busca dos Logs no Banco de Dados ---
    // Usamos 'findMany' para buscar vários logs
    const auditLogs = await db.auditLog.findMany({
      where: {
        patientId: patientId, // Filtra os logs apenas para este paciente
      },
      orderBy: {
        timestamp: 'desc', // Ordena do mais recente para o mais antigo
      },
      skip: skip, // Pula os itens das páginas anteriores
      take: limit, // Limita a quantidade de itens retornados
      // Selecionamos apenas os campos que queremos enviar para o frontend
      select: {
        id: true,
        timestamp: true,
        userName: true,
        userRole: true,
        action: true,
        details: true,
        entityType: true,
        entityId: true,
      }
    })

    // 5. --- Contagem Total para Paginação ---
    // Faz uma contagem separada para saber o total de logs (sem skip/take)
    const totalLogs = await db.auditLog.count({
      where: {
        patientId: patientId,
      },
    })
    const totalPages = Math.ceil(totalLogs / limit) // Calcula o total de páginas

    // 6. --- Retorna a Resposta ---
    return NextResponse.json({
      data: auditLogs, // A lista de logs da página atual
      pagination: { // Informações sobre a paginação
        page: page,
        limit: limit,
        total: totalLogs,
        totalPages: totalPages,
      },
    })

  } catch (error) {
    // --- Tratamento de Erro Genérico ---
    console.error('Erro ao buscar histórico do paciente:', error)
    return NextResponse.json({ error: 'Erro interno ao buscar histórico' }, { status: 500 })
  }
}
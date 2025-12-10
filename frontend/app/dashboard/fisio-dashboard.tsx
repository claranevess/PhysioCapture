'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRoutes } from "@/lib/api";
import {
  ArgonStatsCard,
  ArgonInfoCard,
  ArgonActionCard,
  ArgonAvatarCard
} from "@/components/Argon/ArgonCard";
import { argonTheme } from "@/lib/argon-theme";
import {
  Users,
  FileText,
  Calendar,
  UserPlus,
  Camera,
  Search,
  Activity,
  ChevronRight,
  BarChart3,
  PieChart,
  Sparkles,
  FolderOpen,
  ArrowRightLeft,
  Send,
  Inbox,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface FisioDashboardProps {
  currentUser: any;
}

interface TransferRequest {
  id: number;
  patient_name: string;
  to_fisioterapeuta_name: string;
  to_filial_name: string;
  reason: string;
  status: string;
  status_display: string;
  created_at: string;
  is_inter_filial: boolean;
}

export default function FisioDashboard({ currentUser }: FisioDashboardProps) {
  const router = useRouter();
  const [stats, setStats] = useState<any>({
    totalPatients: 0,
    documentsToday: 0,
    consultasThisWeek: 0,
    activeRecords: 0,
    weeklyGrowth: 0,
    recentPatients: [],
    weeklyData: [],
    monthlyTrend: [],
    serviceDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [myTransferRequests, setMyTransferRequests] = useState<TransferRequest[]>([]);

  useEffect(() => {
    loadDashboardData();
    loadMyTransferRequests();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await apiRoutes.statistics.fisioterapeuta();
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyTransferRequests = async () => {
    try {
      const response = await apiRoutes.transferRequests.list();
      const data = Array.isArray(response.data) ? response.data : [];
      // Pegar apenas as últimas 3 solicitações pendentes
      setMyTransferRequests(data.filter((r: TransferRequest) => r.status === 'PENDENTE').slice(0, 3));
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'APROVADA':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJEITADA':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 animate-pulse"
            style={{ background: argonTheme.gradients.primary }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="font-medium" style={{ color: argonTheme.colors.text.primary }}>
            Carregando dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com boas-vindas */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
          Meu Dashboard
        </h1>
        <p className="text-lg mt-2" style={{ color: argonTheme.colors.text.secondary }}>
          Bem-vindo, {currentUser?.first_name}! Aqui está um resumo da sua atividade.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <ArgonStatsCard
          title="Meus Pacientes"
          value={stats.totalPatients}
          icon={<Users className="w-7 h-7" />}
          iconGradient="primary"
          trend={{
            value: stats.weeklyGrowth,
            label: "vs semana passada",
            isPositive: stats.weeklyGrowth >= 0,
          }}
        />

        <ArgonStatsCard
          title="Docs Digitalizados Hoje"
          value={stats.documentsToday}
          icon={<Camera className="w-7 h-7" />}
          iconGradient="success"
          trend={{
            value: stats.documentsToday,
            label: "com OCR automático",
            isPositive: true,
          }}
        />

        <ArgonStatsCard
          title="Consultas esta Semana"
          value={stats.consultasThisWeek}
          icon={<Calendar className="w-7 h-7" />}
          iconGradient="warning"
          trend={{
            value: stats.consultasThisWeek,
            label: "últimos 7 dias",
            isPositive: true,
          }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart - Crescimento */}
        <div className="lg:col-span-2">
          <ArgonInfoCard
            title="Meu Crescimento de Pacientes"
            subtitle="Últimos 8 meses"
            icon={<BarChart3 className="w-5 h-5" />}
            iconGradient="primary"
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats.monthlyTrend}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#009688" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#009688" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  stroke={argonTheme.colors.text.secondary}
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke={argonTheme.colors.text.secondary}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    boxShadow: argonTheme.shadows.lg,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={argonTheme.colors.primary.main}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ArgonInfoCard>
        </div>

        {/* Próximas Consultas */}
        <ArgonInfoCard
          title="Próximas Consultas"
          subtitle="Agenda de hoje"
          icon={<Calendar className="w-5 h-5" />}
          iconGradient="secondary"
        >
          <div className="space-y-3">
            {stats.upcomingSessions && stats.upcomingSessions.length > 0 ? (
              stats.upcomingSessions.slice(0, 4).map((session: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: session.status === 'CONFIRMADA' ? argonTheme.gradients.success : argonTheme.gradients.primary }}
                    >
                      {session.patient_name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: argonTheme.colors.text.primary }}>
                        {session.patient_name || 'Paciente'}
                      </p>
                      <p className="text-xs" style={{ color: argonTheme.colors.text.secondary }}>
                        {session.status_display || 'Agendada'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: argonTheme.colors.primary.main }}>
                      {session.scheduled_time?.slice(0, 5) || '--:--'}
                    </p>
                    <p className="text-xs" style={{ color: argonTheme.colors.text.secondary }}>
                      {session.duration_minutes || 50}min
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhuma consulta hoje</p>
                <a
                  href="/agenda"
                  className="text-sm text-teal-600 hover:underline mt-2 inline-block"
                >
                  Ver agenda completa
                </a>
              </div>
            )}
          </div>
        </ArgonInfoCard>
      </div>

      {/* Bar Chart - Minha Atividade Semanal */}
      <ArgonInfoCard
        title="Minha Atividade da Semana"
        subtitle="Pacientes, consultas e documentos"
        icon={<Activity className="w-5 h-5" />}
        iconGradient="info"
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats.weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="day"
              stroke={argonTheme.colors.text.secondary}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke={argonTheme.colors.text.secondary}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                boxShadow: argonTheme.shadows.lg,
              }}
            />
            <Legend />
            <Bar dataKey="pacientes" fill="#009688" radius={[8, 8, 0, 0]} />
            <Bar dataKey="consultas" fill="#66BB6A" radius={[8, 8, 0, 0]} />
            <Bar dataKey="documentos" fill="#FF8099" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ArgonInfoCard>

      {/* Quick Actions */}
      <div>
        <h2
          className="text-xl font-bold mb-4"
          style={{ color: argonTheme.colors.text.primary }}
        >
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ArgonActionCard
            title="Novo Paciente"
            description="Cadastrar novo"
            icon={<UserPlus className="w-6 h-6" />}
            gradient="primary"
            href="/patients/new"
          />
          <ArgonActionCard
            title="Agendar Consulta"
            description="Nova sessão"
            icon={<Calendar className="w-6 h-6" />}
            gradient="info"
            href="/agenda"
          />
          <ArgonActionCard
            title="Transferir Paciente"
            description="Solicitar transferência"
            icon={<Send className="w-6 h-6" />}
            gradient="warning"
            href="/patients/transferencias"
          />
          <ArgonActionCard
            title="Digitalizar"
            description="Capturar docs"
            icon={<Camera className="w-6 h-6" />}
            gradient="success"
            href="/documents/digitize"
          />
        </div>
      </div>

      {/* Minhas Solicitações de Transferência */}
      {myTransferRequests.length > 0 && (
        <ArgonInfoCard
          title="Minhas Solicitações de Transferência"
          subtitle="Aguardando aprovação do gestor"
          icon={<Send className="w-5 h-5" />}
          iconGradient="warning"
          footer={
            <Link
              href="/patients/transferencias"
              className="flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              style={{ color: argonTheme.colors.warning.main }}
            >
              Ver todas as solicitações
              <ChevronRight className="w-4 h-4" />
            </Link>
          }
        >
          <div className="space-y-3">
            {myTransferRequests.map((request) => (
              <div
                key={request.id}
                className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <p className="font-medium" style={{ color: argonTheme.colors.text.primary }}>
                        {request.patient_name}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      → {request.to_fisioterapeuta_name} ({request.to_filial_name})
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(request.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    {request.status_display}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ArgonInfoCard>
      )}

      {/* Recent Patients */}
      {stats.recentPatients.length > 0 && (
        <ArgonInfoCard
          title="Meus Pacientes Recentes"
          subtitle="Últimos atendimentos e atualizações"
          icon={<Users className="w-5 h-5" />}
          iconGradient="primary"
          footer={
            <Link
              href="/patients"
              className="flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              style={{ color: argonTheme.colors.primary.main }}
            >
              Ver todos os meus pacientes
              <ChevronRight className="w-4 h-4" />
            </Link>
          }
        >
          <div className="divide-y divide-gray-100">
            {stats.recentPatients.map((patient: any) => (
              <ArgonAvatarCard
                key={patient.id}
                name={patient.full_name}
                subtitle={`${patient.phone} • ${patient.age} anos`}
                badge={{
                  text: patient.is_active ? 'Ativo' : 'Inativo',
                  color: patient.is_active ? 'success' : 'error',
                }}
                onClick={() => window.location.href = `/patients/${patient.id}/records`}
              />
            ))}
          </div>
        </ArgonInfoCard>
      )}
    </div>
  );
}


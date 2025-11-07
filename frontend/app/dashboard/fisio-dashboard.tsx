'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
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
  FolderOpen
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

export default function FisioDashboard({ currentUser }: FisioDashboardProps) {
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

  useEffect(() => {
    loadDashboardData();
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          title="Prontuários Ativos"
          value={stats.activeRecords}
          icon={<FileText className="w-7 h-7" />}
          iconGradient="success"
          trend={{
            value: stats.activeRecords,
            label: "últimos 30 dias",
            isPositive: true,
          }}
        />

        <ArgonStatsCard
          title="Docs Digitalizados Hoje"
          value={stats.documentsToday}
          icon={<Camera className="w-7 h-7" />}
          iconGradient="error"
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
                    <stop offset="5%" stopColor="#009688" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#009688" stopOpacity={0}/>
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

        {/* Pie Chart - Distribuição */}
        <ArgonInfoCard
          title="Meus Serviços"
          subtitle="Distribuição"
          icon={<PieChart className="w-5 h-5" />}
          iconGradient="secondary"
        >
          <ResponsiveContainer width="100%" height={240}>
            <RechartsPie>
              <Pie
                data={stats.serviceDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.serviceDistribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {stats.serviceDistribution.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span style={{ color: argonTheme.colors.text.primary }}>
                    {item.name}
                  </span>
                </div>
                <span 
                  className="font-semibold"
                  style={{ color: argonTheme.colors.text.primary }}
                >
                  {item.value}%
                </span>
              </div>
            ))}
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
            title="Digitalizar"
            description="Capturar docs"
            icon={<Camera className="w-6 h-6" />}
            gradient="success"
            href="/documents/digitize"
          />
          <ArgonActionCard
            title="Buscar"
            description="Encontrar paciente"
            icon={<Search className="w-6 h-6" />}
            gradient="error"
            href="/patients"
          />
          <ArgonActionCard
            title="Documentos"
            description="Ver arquivos"
            icon={<FolderOpen className="w-6 h-6" />}
            gradient="warning"
            href="/documents"
          />
        </div>
      </div>

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


'use client';

import { useEffect, useState } from "react";
import { apiRoutes } from "@/lib/api";
import { 
  ArgonStatsCard, 
  ArgonInfoCard,
  ArgonCard
} from "@/components/Argon/ArgonCard";
import { argonTheme } from "@/lib/argon-theme";
import { 
  Users, 
  FileText, 
  UserPlus,
  TrendingUp,
  Activity, 
  BarChart3,
  PieChart,
  Sparkles
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

interface GestorDashboardProps {
  currentUser: any;
}

export default function GestorDashboard({ currentUser }: GestorDashboardProps) {
  const [stats, setStats] = useState<any>({
    totalPatients: 0,
    newPatientsThisMonth: 0,
    totalDocuments: 0,
    documentsToday: 0,
    fisioterapeutasAtivos: 0,
    activeRecords: 0,
    monthlyGrowth: 0,
    weeklyData: [],
    monthlyTrend: [],
    serviceDistribution: [],
    fisioterapeutasMetrics: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await apiRoutes.statistics.gestor();
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
            Carregando dashboard do gestor...
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
          Dashboard da Clínica
        </h1>
        <p className="text-lg mt-2" style={{ color: argonTheme.colors.text.secondary }}>
          Bem-vindo, {currentUser?.first_name}! Visão geral da clínica {currentUser?.clinica_name || ''}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ArgonStatsCard
          title="Total de Pacientes"
          value={stats.totalPatients}
          icon={<Users className="w-7 h-7" />}
          iconGradient="primary"
          trend={{
            value: stats.monthlyGrowth,
            label: "vs mês passado",
            isPositive: stats.monthlyGrowth >= 0,
          }}
        />

        <ArgonStatsCard
          title="Novos Pacientes (Mês)"
          value={stats.newPatientsThisMonth}
          icon={<UserPlus className="w-7 h-7" />}
          iconGradient="success"
          trend={{
            value: stats.newPatientsThisMonth,
            label: "este mês",
            isPositive: true,
          }}
        />

        <ArgonStatsCard
          title="Documentos Digitalizados"
          value={stats.totalDocuments}
          icon={<FileText className="w-7 h-7" />}
          iconGradient="error"
          trend={{
            value: stats.documentsToday,
            label: "hoje",
            isPositive: true,
          }}
        />

        <ArgonStatsCard
          title="Fisioterapeutas Ativos"
          value={stats.fisioterapeutasAtivos}
          icon={<Activity className="w-7 h-7" />}
          iconGradient="warning"
          trend={{
            value: stats.activeRecords,
            label: "prontuários ativos",
            isPositive: true,
          }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart - Crescimento */}
        <div className="lg:col-span-2">
          <ArgonInfoCard
            title="Crescimento de Pacientes"
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
          title="Distribuição de Serviços"
          subtitle="Por especialidade"
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

      {/* Bar Chart - Atividade Semanal */}
      <ArgonInfoCard
        title="Atividade da Semana"
        subtitle="Pacientes, consultas e documentos da clínica"
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

      {/* Tabela de Fisioterapeutas */}
      {stats.fisioterapeutasMetrics.length > 0 && (
        <ArgonInfoCard
          title="Desempenho dos Fisioterapeutas"
          subtitle="Métricas dos últimos 30 dias"
          icon={<Users className="w-5 h-5" />}
          iconGradient="primary"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th 
                    className="text-left py-3 px-4 font-semibold text-sm"
                    style={{ color: argonTheme.colors.text.secondary }}
                  >
                    Fisioterapeuta
                  </th>
                  <th 
                    className="text-center py-3 px-4 font-semibold text-sm"
                    style={{ color: argonTheme.colors.text.secondary }}
                  >
                    Pacientes
                  </th>
                  <th 
                    className="text-center py-3 px-4 font-semibold text-sm"
                    style={{ color: argonTheme.colors.text.secondary }}
                  >
                    Consultas
                  </th>
                  <th 
                    className="text-center py-3 px-4 font-semibold text-sm"
                    style={{ color: argonTheme.colors.text.secondary }}
                  >
                    Documentos
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.fisioterapeutasMetrics.map((fisio: any) => (
                  <tr key={fisio.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td 
                      className="py-3 px-4 font-medium"
                      style={{ color: argonTheme.colors.text.primary }}
                    >
                      {fisio.name}
                    </td>
                    <td 
                      className="py-3 px-4 text-center font-semibold"
                      style={{ color: argonTheme.colors.primary.main }}
                    >
                      {fisio.pacientes}
                    </td>
                    <td 
                      className="py-3 px-4 text-center font-semibold"
                      style={{ color: argonTheme.colors.success.main }}
                    >
                      {fisio.consultas}
                    </td>
                    <td 
                      className="py-3 px-4 text-center font-semibold"
                      style={{ color: argonTheme.colors.error.main }}
                    >
                      {fisio.documentos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ArgonInfoCard>
      )}
    </div>
  );
}


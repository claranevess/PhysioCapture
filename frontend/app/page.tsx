'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRoutes } from "@/lib/api";
import { 
  Users, 
  FileText, 
  Calendar, 
  UserPlus, 
  Camera, 
  Search, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  Clock, 
  ChevronRight,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
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

export default function Home() {
  const [stats, setStats] = useState({ 
    totalPatients: 0, 
    documentsToday: 0, 
    recentPatients: [],
    weeklyGrowth: 0,
    monthlyRevenue: 0,
    activeRecords: 0
  });
  const [loading, setLoading] = useState(true);

  // Dados para gráficos
  const [weeklyData] = useState([
    { day: 'Seg', pacientes: 12, consultas: 8, documentos: 15 },
    { day: 'Ter', pacientes: 19, consultas: 14, documentos: 22 },
    { day: 'Qua', pacientes: 15, consultas: 11, documentos: 18 },
    { day: 'Qui', pacientes: 22, consultas: 18, documentos: 25 },
    { day: 'Sex', pacientes: 28, consultas: 22, documentos: 32 },
    { day: 'Sáb', pacientes: 8, consultas: 5, documentos: 10 },
    { day: 'Dom', pacientes: 5, consultas: 3, documentos: 6 }
  ]);

  const [monthlyTrend] = useState([
    { month: 'Jan', value: 65 },
    { month: 'Fev', value: 78 },
    { month: 'Mar', value: 85 },
    { month: 'Abr', value: 92 },
    { month: 'Mai', value: 88 },
    { month: 'Jun', value: 105 },
    { month: 'Jul', value: 120 },
    { month: 'Ago', value: 127 }
  ]);

  const [serviceDistribution] = useState([
    { name: 'Ortopedia', value: 35, color: '#009688' },
    { name: 'Neurologia', value: 25, color: '#66BB6A' },
    { name: 'Traumato', value: 20, color: '#FF8099' },
    { name: 'Esportiva', value: 15, color: '#BA68C8' },
    { name: 'Outros', value: 5, color: '#FFC107' }
  ]);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      const patientsResponse = await apiRoutes.patients.list();
      const totalPatients = patientsResponse.data.count || patientsResponse.data.length || 0;
      
      setStats({
        totalPatients,
        documentsToday: Math.floor(totalPatients * 0.15),
        recentPatients: patientsResponse.data.results?.slice(0, 5) || patientsResponse.data.slice(0, 5) || [],
        weeklyGrowth: 15.3,
        monthlyRevenue: totalPatients * 150,
        activeRecords: Math.floor(totalPatients * 0.7)
      });
    } catch (error) { 
      console.error('Erro:', error);
      setStats(prev => ({ ...prev, totalPatients: 127, documentsToday: 19, weeklyGrowth: 15.3, monthlyRevenue: 19050, activeRecords: 89 }));
    }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header Premium */}
      <header className="bg-gradient-to-r from-[#4DB6AC] to-[#009688] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">PhysioCapture Dashboard</h1>
              </div>
              <p className="text-white/90 text-sm">Sistema de Gestão Fisioterapêutica • Desenvolvido pela Core Hive</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards com Animação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Card 1 - Total Pacientes */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-medium text-[#7F8C8D] uppercase tracking-wide">Total de Pacientes</p>
                <p className="text-3xl sm:text-4xl font-bold mt-2 text-[#2C3E50]">
                  {loading ? "..." : stats.totalPatients}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#009688] to-[#00796B] shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-bold">{stats.weeklyGrowth}%</span>
              </div>
              <span className="text-xs text-[#7F8C8D]">vs semana passada</span>
            </div>
          </div>

          {/* Card 2 - Prontuários Ativos */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-medium text-[#7F8C8D] uppercase tracking-wide">Prontuários Ativos</p>
                <p className="text-3xl sm:text-4xl font-bold mt-2 text-[#2C3E50]">
                  {loading ? "..." : stats.activeRecords}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#66BB6A] to-[#43A047] shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <Activity className="w-4 h-4 text-[#66BB6A]" />
              <span className="text-xs text-[#7F8C8D]">Em tratamento</span>
            </div>
          </div>

          {/* Card 3 - Documentos Digitalizados */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-medium text-[#7F8C8D] uppercase tracking-wide">Docs Hoje</p>
                <p className="text-3xl sm:text-4xl font-bold mt-2 text-[#2C3E50]">
                  {loading ? "..." : stats.documentsToday}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#FF8099] to-[#FF4D70] shadow-lg">
                <Camera className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <Sparkles className="w-4 h-4 text-[#FF8099]" />
              <span className="text-xs text-[#7F8C8D]">Com OCR automático</span>
            </div>
          </div>

          {/* Card 4 - Receita Mensal */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-medium text-[#7F8C8D] uppercase tracking-wide">Receita Mensal</p>
                <p className="text-3xl sm:text-4xl font-bold mt-2 text-[#2C3E50]">
                  {loading ? "..." : `R$ ${(stats.monthlyRevenue / 1000).toFixed(1)}k`}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#BA68C8] to-[#9C27B0] shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-bold">+8.5%</span>
              </div>
              <span className="text-xs text-[#7F8C8D]">vs mês anterior</span>
            </div>
          </div>
        </div>

        {/* Grid de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gráfico de Tendência Mensal */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#2C3E50]">Crescimento de Pacientes</h3>
                <p className="text-sm text-[#7F8C8D] mt-1">Últimos 8 meses</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">+24%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#009688" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#009688" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#7F8C8D" style={{ fontSize: '12px' }} />
                <YAxis stroke="#7F8C8D" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#009688" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pizza - Distribuição de Serviços */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#2C3E50]">Distribuição de Serviços</h3>
              <p className="text-sm text-[#7F8C8D] mt-1">Por especialidade</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <RechartsPie>
                <Pie
                  data={serviceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {serviceDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[#2C3E50]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-[#2C3E50]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráfico de Barras - Atividade Semanal */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#2C3E50]">Atividade da Semana</h3>
              <p className="text-sm text-[#7F8C8D] mt-1">Pacientes, consultas e documentos</p>
            </div>
            <BarChart3 className="w-6 h-6 text-[#009688]" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#7F8C8D" style={{ fontSize: '12px' }} />
              <YAxis stroke="#7F8C8D" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }} 
              />
              <Legend />
              <Bar dataKey="pacientes" fill="#009688" radius={[8, 8, 0, 0]} />
              <Bar dataKey="consultas" fill="#66BB6A" radius={[8, 8, 0, 0]} />
              <Bar dataKey="documentos" fill="#FF8099" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Ações Rápidas - Grid Responsivo */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#2C3E50]">Ações Rápidas</h2>
            <span className="text-sm text-[#7F8C8D]">Acesso rápido às funcionalidades</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/patients/new" 
              className="group relative bg-gradient-to-br from-[#009688] to-[#00796B] rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Novo Paciente</h3>
                <p className="text-sm text-white/80">Cadastrar novo</p>
                <div className="mt-4 flex items-center text-white/90 text-sm font-medium">
                  <span>Cadastrar</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link 
              href="/camera" 
              className="group relative bg-gradient-to-br from-[#66BB6A] to-[#43A047] rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Digitalizar</h3>
                <p className="text-sm text-white/80">Capturar docs</p>
                <div className="mt-4 flex items-center text-white/90 text-sm font-medium">
                  <span>Abrir câmera</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link 
              href="/patients" 
              className="group relative bg-gradient-to-br from-[#FF8099] to-[#FF4D70] rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Buscar</h3>
                <p className="text-sm text-white/80">Encontrar paciente</p>
                <div className="mt-4 flex items-center text-white/90 text-sm font-medium">
                  <span>Ver lista</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link 
              href="/documents" 
              className="group relative bg-gradient-to-br from-[#BA68C8] to-[#9C27B0] rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Documentos</h3>
                <p className="text-sm text-white/80">Ver arquivos</p>
                <div className="mt-4 flex items-center text-white/90 text-sm font-medium">
                  <span>Acessar</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Pacientes Recentes */}
        {stats.recentPatients.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#009688]/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#009688]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#2C3E50]">Pacientes Recentes</h2>
                    <p className="text-xs text-[#7F8C8D]">Últimos cadastros e atualizações</p>
                  </div>
                </div>
                <Link 
                  href="/patients" 
                  className="flex items-center gap-1 text-sm font-medium text-[#009688] hover:text-[#00796B] transition-colors"
                >
                  Ver todos
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.recentPatients.map((patient: any, index: number) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}/records`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gradient-to-r hover:from-[#009688]/5 hover:to-transparent transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white bg-gradient-to-br from-[#009688] to-[#00796B] shadow-md">
                        {patient.full_name?.charAt(0) || '?'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#2C3E50] group-hover:text-[#009688] transition-colors">
                        {patient.full_name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-[#7F8C8D]">{patient.phone}</span>
                        <span className="text-xs text-[#7F8C8D]">•</span>
                        <span className="text-sm text-[#7F8C8D]">{patient.age} anos</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#7F8C8D] group-hover:text-[#009688] group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#7F8C8D]">
              PhysioCapture © 2024 • Sistema de Gestão Fisioterapêutica
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#7F8C8D]">Desenvolvido com</span>
              <Sparkles className="w-4 h-4 text-[#009688]" />
              <span className="text-sm font-semibold text-[#009688]">por Core Hive</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
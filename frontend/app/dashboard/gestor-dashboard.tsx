'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRoutes, api } from "@/lib/api";
import {
  ArgonStatsCard,
  ArgonInfoCard,
} from "@/components/Argon/ArgonCard";
import { argonTheme } from "@/lib/argon-theme";
import {
  Users,
  Building2,
  UserPlus,
  TrendingUp,
  ArrowRightLeft,
  Trophy,
  Sparkles,
  MapPin,
  ChevronRight,
  Clock,
  UserCheck,
  Database,
  X,
  Search
} from 'lucide-react';
import {
  LineChart,
  Line,
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

interface FilialStats {
  id: number;
  nome: string;
  cidade: string;
  cor: string;
  totalPacientes: number;
  novosPacientes: number;
  fisioterapeutas: number;
  sessoesRealizadas: number;
}

interface Transferencia {
  id: number;
  paciente: string;
  paciente_id: number;
  de_fisio: string;
  para_fisio: string;
  de_filial: string;
  para_filial: string;
  data: string;
  inter_filial: boolean;
}

interface FisioRanking {
  id: number;
  nome: string;
  filial: string;
  pacientes: number;
  sessoes: number;
}

interface Patient {
  id: number;
  full_name: string;
  filial_nome: string;
  fisioterapeuta_name: string;
}

interface Fisioterapeuta {
  id: number;
  full_name: string;
  filial_nome: string;
}

export default function GestorDashboard({ currentUser }: GestorDashboardProps) {
  const router = useRouter();
  const [stats, setStats] = useState<any>({
    totalPacientes: 0,
    totalFisioterapeutas: 0,
    totalFiliais: 0,
    novosPacientesMes: 0,
    crescimentoMensal: 0,
    totalTransferenciasMes: 0,
    pacientesDisponiveisTransferencia: 0,
    filiaisStats: [],
    transferenciasRecentes: [],
    rankingFisioterapeutas: [],
    comparativoFiliais: [],
    rede: { nome: '' }
  });
  const [loading, setLoading] = useState(true);

  // Modal de transferência
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [selectedFisio, setSelectedFisio] = useState<number | null>(null);
  const [transferReason, setTransferReason] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');

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

  const loadTransferData = async () => {
    try {
      const [patientsRes, fisiosRes] = await Promise.all([
        api.get('/api/prontuario/patients/'),
        api.get('/api/auth/fisioterapeutas/')
      ]);
      setPatients(patientsRes.data);
      setFisioterapeutas(fisiosRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados para transferência:', error);
    }
  };

  const openTransferModal = () => {
    loadTransferData();
    setShowTransferModal(true);
  };

  const handleTransfer = async () => {
    if (!selectedPatient || !selectedFisio) {
      alert('Selecione o paciente e o fisioterapeuta de destino');
      return;
    }

    setTransferLoading(true);
    try {
      await apiRoutes.patients.transfer(selectedPatient, {
        to_fisioterapeuta_id: selectedFisio,
        reason: transferReason
      });

      alert('Paciente transferido com sucesso!');
      setShowTransferModal(false);
      setSelectedPatient(null);
      setSelectedFisio(null);
      setTransferReason('');
      loadDashboardData(); // Recarrega dados
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao transferir paciente');
    } finally {
      setTransferLoading(false);
    }
  };

  const navigateToFilial = (filialId: number) => {
    // Navega para a página de detalhes da filial
    router.push(`/filiais/${filialId}`);
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
            Carregando dashboard da rede...
          </p>
        </div>
      </div>
    );
  }

  // Preparar dados para gráfico comparativo
  const prepareChartData = () => {
    if (!stats.comparativoFiliais || stats.comparativoFiliais.length === 0) return [];
    const months = stats.comparativoFiliais[0]?.dados?.map((d: any) => d.mes) || [];
    return months.map((mes: string, idx: number) => {
      const dataPoint: any = { mes };
      stats.comparativoFiliais.forEach((filial: any) => {
        dataPoint[filial.filial] = filial.dados[idx]?.valor || 0;
      });
      return dataPoint;
    });
  };

  const chartData = prepareChartData();

  // Filtrar pacientes pela busca
  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(searchPatient.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Modal de Transferência */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: argonTheme.gradients.primary }}
                >
                  <ArrowRightLeft className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
                  Transferir Paciente
                </h2>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Seleção de Paciente */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: argonTheme.colors.text.primary }}>
                  1. Selecione o Paciente
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar paciente..."
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredPatients.map(patient => (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient.id)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${selectedPatient === patient.id ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''
                        }`}
                    >
                      <p className="font-medium" style={{ color: argonTheme.colors.text.primary }}>
                        {patient.full_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {patient.filial_nome} • Fisio: {patient.fisioterapeuta_name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seleção de Fisioterapeuta */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: argonTheme.colors.text.primary }}>
                  2. Fisioterapeuta de Destino
                </label>
                <select
                  value={selectedFisio || ''}
                  onChange={(e) => setSelectedFisio(Number(e.target.value))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Selecione o fisioterapeuta...</option>
                  {fisioterapeutas.map(fisio => (
                    <option key={fisio.id} value={fisio.id}>
                      {fisio.full_name} - {fisio.filial_nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: argonTheme.colors.text.primary }}>
                  3. Motivo da Transferência
                </label>
                <textarea
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="Ex: Paciente mudou de endereço, mudança de horário..."
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleTransfer}
                disabled={transferLoading || !selectedPatient || !selectedFisio}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-white disabled:opacity-50"
                style={{ background: argonTheme.gradients.primary }}
              >
                {transferLoading ? 'Transferindo...' : 'Confirmar Transferência'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: argonTheme.gradients.primary }}
            >
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
                Dashboard da Rede
              </h1>
              <p className="text-lg" style={{ color: argonTheme.colors.text.secondary }}>
                {stats.rede?.nome || 'Rede FisioVida'} • {stats.totalFiliais} filiais
              </p>
            </div>
          </div>
          <button
            onClick={openTransferModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
            style={{ background: argonTheme.gradients.primary }}
          >
            <ArrowRightLeft className="w-5 h-5" />
            Transferir Paciente
          </button>
        </div>
      </div>

      {/* Visão Geral */}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ArgonStatsCard
          title="Total de Pacientes"
          value={stats.totalPacientes}
          icon={<Users className="w-7 h-7" />}
          iconGradient="primary"
          trend={{ value: stats.crescimentoMensal, label: "vs mês passado", isPositive: stats.crescimentoMensal >= 0 }}
        />
        <ArgonStatsCard
          title="Fisioterapeutas"
          value={stats.totalFisioterapeutas}
          icon={<UserCheck className="w-7 h-7" />}
          iconGradient="success"
          trend={{ value: stats.totalFiliais, label: "filiais ativas", isPositive: true }}
        />
        <ArgonStatsCard
          title="Novos (Mês)"
          value={stats.novosPacientesMes}
          icon={<UserPlus className="w-7 h-7" />}
          iconGradient="info"
        />
        <ArgonStatsCard
          title="Transferências"
          value={stats.totalTransferenciasMes}
          icon={<ArrowRightLeft className="w-7 h-7" />}
          iconGradient="warning"
        />
      </div>

      {/* Cards de Filiais Clicáveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.filiaisStats?.map((filial: FilialStats) => (
          <div
            key={filial.id}
            onClick={() => navigateToFilial(filial.id)}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: filial.cor }}
                >
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: argonTheme.colors.text.primary }}>
                    {filial.nome}
                  </h3>
                  <p className="text-sm flex items-center gap-1" style={{ color: argonTheme.colors.text.secondary }}>
                    <MapPin className="w-3 h-3" /> {filial.cidade}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold" style={{ color: filial.cor }}>{filial.totalPacientes}</p>
                <p className="text-xs text-gray-500">Pacientes</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold" style={{ color: argonTheme.colors.success.main }}>{filial.fisioterapeutas}</p>
                <p className="text-xs text-gray-500">Fisios</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold" style={{ color: argonTheme.colors.info.main }}>+{filial.novosPacientes}</p>
                <p className="text-xs text-gray-500">Novos/Mês</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold" style={{ color: argonTheme.colors.warning.main }}>{filial.sessoesRealizadas}</p>
                <p className="text-xs text-gray-500">Sessões</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico Comparativo */}
      {chartData.length > 0 && (
        <ArgonInfoCard title="Comparativo entre Filiais" subtitle="Novos pacientes por mês" icon={<TrendingUp className="w-5 h-5" />} iconGradient="primary">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" stroke={argonTheme.colors.text.secondary} />
              <YAxis stroke={argonTheme.colors.text.secondary} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '12px' }} />
              <Legend />
              {stats.comparativoFiliais?.map((filial: any, idx: number) => (
                <Line key={filial.filial} type="monotone" dataKey={filial.filial} stroke={stats.filiaisStats[idx]?.cor || '#009688'} strokeWidth={3} dot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ArgonInfoCard>
      )}

      {/* Ranking */}
      <ArgonInfoCard title="Top Fisioterapeutas" subtitle="Ranking da rede" icon={<Trophy className="w-5 h-5" />} iconGradient="warning">
        <div className="space-y-3">
          {stats.rankingFisioterapeutas?.slice(0, 5).map((fisio: FisioRanking, idx: number) => (
            <div key={fisio.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-gray-300'
                  }`}>
                  {idx + 1}
                </div>
                <div>
                  <p className="font-semibold">{fisio.nome}</p>
                  <p className="text-sm text-gray-500">{fisio.filial}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-center">
                <div>
                  <p className="font-bold" style={{ color: argonTheme.colors.primary.main }}>{fisio.pacientes}</p>
                  <p className="text-xs text-gray-500">Pacientes</p>
                </div>
                <div>
                  <p className="font-bold" style={{ color: argonTheme.colors.success.main }}>{fisio.sessoes}</p>
                  <p className="text-xs text-gray-500">Sessões</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ArgonInfoCard>
    </div>
  );
}

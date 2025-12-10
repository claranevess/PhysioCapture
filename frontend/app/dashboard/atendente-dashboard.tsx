'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRoutes, api } from '@/lib/api';
import {
  ArgonStatsCard,
  ArgonInfoCard,
} from '@/components/Argon/ArgonCard';
import { argonTheme } from '@/lib/argon-theme';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  User,
  Search,
  Plus,
  ChevronRight,
  FileText,
  ArrowRightLeft,
  Inbox,
  Send,
  AlertCircle,
  Sparkles,
  FolderOpen,
  Filter,
  RefreshCw,
  Eye,
  UserCheck
} from 'lucide-react';

interface AtendenteDashboardProps {
  currentUser: any;
}

interface Session {
  id: number;
  patient: number;
  patient_name: string;
  patient_phone?: string;
  fisioterapeuta: number;
  fisioterapeuta_name: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  status_display: string;
  is_today: boolean;
}

interface Patient {
  id: number;
  full_name: string;
  cpf: string;
  phone: string;
  birth_date: string;
  fisioterapeuta_name?: string;
}

interface Fisioterapeuta {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
}

interface TransferRequest {
  id: number;
  patient_name: string;
  requested_by_name: string;
  from_filial_name: string;
  to_fisioterapeuta_name: string;
  to_filial_name: string;
  reason: string;
  status: string;
  status_display: string;
  created_at: string;
  is_inter_filial: boolean;
}

interface Document {
  id: number;
  title: string;
  patient_name: string;
  category_name: string;
  created_at: string;
  is_verified: boolean;
}

export default function AtendenteDashboard({ currentUser }: AtendenteDashboardProps) {
  const router = useRouter();
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFisio, setSelectedFisio] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'agenda' | 'pacientes' | 'transferencias' | 'documentos'>('agenda');

  // Modal states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [transferData, setTransferData] = useState({
    to_fisioterapeuta_id: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchTodaySessions(),
      fetchPatients(),
      fetchFisioterapeutas(),
      fetchTransferRequests(),
      fetchDocuments()
    ]);
    setLoading(false);
  };

  const fetchTodaySessions = async () => {
    try {
      const response = await api.get('/api/prontuario/sessions/today/');
      setTodaySessions(response.data);
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/prontuario/patients/?is_active=true');
      setPatients(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    }
  };

  const fetchFisioterapeutas = async () => {
    try {
      const response = await apiRoutes.fisioterapeutas.list();
      setFisioterapeutas(response.data);
    } catch (error) {
      console.error('Erro ao buscar fisioterapeutas:', error);
    }
  };

  const fetchTransferRequests = async () => {
    try {
      const response = await apiRoutes.transferRequests.list();
      const data = Array.isArray(response.data) ? response.data : [];
      setTransferRequests(data);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await apiRoutes.documents.list({ limit: 20 });
      setDocuments(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    }
  };

  const confirmSession = async (sessionId: number) => {
    try {
      await api.post(`/api/prontuario/sessions/${sessionId}/confirm/`);
      fetchTodaySessions();
    } catch (error) {
      console.error('Erro ao confirmar sessão:', error);
    }
  };

  const handleCreateTransferRequest = async () => {
    if (!selectedPatient || !transferData.to_fisioterapeuta_id || !transferData.reason) {
      alert('Preencha todos os campos');
      return;
    }

    setSubmitting(true);
    try {
      await apiRoutes.transferRequests.create({
        patient_id: selectedPatient.id,
        to_fisioterapeuta_id: parseInt(transferData.to_fisioterapeuta_id),
        reason: transferData.reason
      });
      setShowTransferModal(false);
      setSelectedPatient(null);
      setTransferData({ to_fisioterapeuta_id: '', reason: '' });
      fetchTransferRequests();
      alert('Solicitação de transferência enviada com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao criar solicitação');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cpf?.includes(searchTerm) ||
    p.phone?.includes(searchTerm)
  );

  const filteredSessions = selectedFisio
    ? todaySessions.filter(s => s.fisioterapeuta === selectedFisio)
    : todaySessions;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGENDADA': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CONFIRMADA': return 'bg-green-100 text-green-700 border-green-200';
      case 'EM_ANDAMENTO': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'REALIZADA': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'CANCELADA': return 'bg-red-100 text-red-700 border-red-200';
      case 'FALTA': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTransferStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'APROVADA': return 'bg-green-100 text-green-700 border-green-200';
      case 'REJEITADA': return 'bg-red-100 text-red-700 border-red-200';
      case 'CANCELADA': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const pendingSessions = todaySessions.filter(s => s.status === 'AGENDADA');
  const confirmedSessions = todaySessions.filter(s => s.status === 'CONFIRMADA');
  const pendingTransfers = transferRequests.filter(t => t.status === 'PENDENTE');

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
            Recepção
          </h1>
          <p className="text-lg mt-1" style={{ color: argonTheme.colors.text.secondary }}>
            Olá, {currentUser?.first_name || 'Atendente'}! Gerencie a agenda, pacientes e documentos.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/agenda')}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
            style={{ background: argonTheme.gradients.primary }}
          >
            <Calendar className="w-4 h-4" />
            Ver Agenda Completa
          </button>
          <button
            onClick={loadAllData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            style={{ color: argonTheme.colors.text.secondary }}
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ArgonStatsCard
          title="Sessões Hoje"
          value={todaySessions.length}
          icon={<Calendar className="w-7 h-7" />}
          iconGradient="info"
          trend={{
            value: confirmedSessions.length,
            label: "confirmadas",
            isPositive: true,
          }}
        />

        <ArgonStatsCard
          title="Pendentes de Confirmação"
          value={pendingSessions.length}
          icon={<Clock className="w-7 h-7" />}
          iconGradient="warning"
          trend={{
            value: pendingSessions.length,
            label: "aguardando",
            isPositive: false,
          }}
        />

        <ArgonStatsCard
          title="Pacientes Ativos"
          value={patients.length}
          icon={<Users className="w-7 h-7" />}
          iconGradient="success"
          trend={{
            value: fisioterapeutas.length,
            label: "fisioterapeutas",
            isPositive: true,
          }}
        />

        <ArgonStatsCard
          title="Solicitações Pendentes"
          value={pendingTransfers.length}
          icon={<ArrowRightLeft className="w-7 h-7" />}
          iconGradient="primary"
          trend={{
            value: transferRequests.length,
            label: "total de solicitações",
            isPositive: true,
          }}
        />
      </div>

      {/* Tabs de Navegação */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'agenda', label: 'Agenda por Fisio', icon: Calendar },
            { key: 'pacientes', label: 'Pacientes da Filial', icon: Users },
            { key: 'transferencias', label: 'Solicitações de Transferência', icon: ArrowRightLeft },
            { key: 'documentos', label: 'Documentos', icon: FolderOpen },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === tab.key
                  ? 'border-teal-500 text-teal-600 bg-teal-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Tab: Agenda por Fisioterapeuta */}
          {activeTab === 'agenda' && (
            <div className="space-y-6">
              {/* Filtro por Fisioterapeuta */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-600">Fisioterapeuta:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedFisio(null)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedFisio === null
                        ? 'bg-teal-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  {fisioterapeutas.map((fisio) => (
                    <button
                      key={fisio.id}
                      onClick={() => setSelectedFisio(fisio.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedFisio === fisio.id
                          ? 'bg-teal-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {fisio.first_name} {fisio.last_name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Sessões */}
              {filteredSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg">Nenhuma sessão agendada para hoje</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {selectedFisio ? 'Tente selecionar outro fisioterapeuta' : 'Todas as agendas estão vazias'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                    >
                      <div className="flex items-center gap-5">
                        <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100">
                          <p className="text-2xl font-bold text-gray-800">
                            {session.scheduled_time.slice(0, 5)}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-lg">
                            {session.patient_name}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">
                              Dr(a). {session.fisioterapeuta_name}
                            </span>
                            {session.patient_phone && (
                              <span className="text-sm text-gray-400 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {session.patient_phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${getStatusColor(session.status)}`}>
                          {session.status_display}
                        </span>
                        {session.status === 'AGENDADA' && (
                          <button
                            onClick={() => confirmSession(session.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Confirmar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Pacientes da Filial */}
          {activeTab === 'pacientes' && (
            <div className="space-y-6">
              {/* Busca */}
              <div className="relative max-w-md">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, CPF ou telefone..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Lista de Pacientes */}
              {filteredPatients.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg">
                    {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ background: argonTheme.gradients.primary }}
                        >
                          {patient.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{patient.full_name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-sm text-gray-500">{patient.phone}</span>
                            {patient.fisioterapeuta_name && (
                              <span className="text-sm text-teal-600">
                                • Dr(a). {patient.fisioterapeuta_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowTransferModal(true);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                          title="Solicitar Transferência"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                          <span className="text-sm font-medium">Transferir</span>
                        </button>
                        <a
                          href={`tel:${patient.phone}`}
                          className="p-2 text-gray-500 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-all"
                          title="Ligar"
                        >
                          <Phone className="w-5 h-5" />
                        </a>
                        <button
                          onClick={() => router.push(`/patients/${patient.id}`)}
                          className="p-2 text-gray-500 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-all"
                          title="Ver Detalhes"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Solicitações de Transferência */}
          {activeTab === 'transferencias' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Acompanhe as solicitações de transferência da filial
                </p>
                <button
                  onClick={() => router.push('/patients/transferencias')}
                  className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-all font-medium"
                >
                  Ver Todas
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {transferRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg">Nenhuma solicitação de transferência</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {transferRequests.slice(0, 10).map((request) => (
                    <div
                      key={request.id}
                      className={`p-5 rounded-xl border-l-4 ${
                        request.status === 'PENDENTE'
                          ? 'bg-yellow-50 border-yellow-400'
                          : request.status === 'APROVADA'
                          ? 'bg-green-50 border-green-400'
                          : request.status === 'REJEITADA'
                          ? 'bg-red-50 border-red-400'
                          : 'bg-gray-50 border-gray-400'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-gray-800 text-lg">{request.patient_name}</p>
                            <span className={`px-3 py-1 text-sm font-medium rounded-lg border ${getTransferStatusColor(request.status)}`}>
                              {request.status_display}
                            </span>
                            {request.is_inter_filial && (
                              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-lg">
                                Inter-filial
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Send className="w-4 h-4" />
                            <span>Para: Dr(a). {request.to_fisioterapeuta_name}</span>
                            {request.to_filial_name && (
                              <span className="text-gray-400">• {request.to_filial_name}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Motivo:</span> {request.reason}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Solicitado por {request.requested_by_name} em {new Date(request.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Documentos */}
          {activeTab === 'documentos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Documentos recentes da filial
                </p>
                <button
                  onClick={() => router.push('/documents')}
                  className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-all font-medium"
                >
                  Ver Todos
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg">Nenhum documento encontrado</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{doc.title}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-sm text-gray-500">{doc.patient_name}</span>
                            <span className="text-sm text-gray-400">• {doc.category_name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {doc.is_verified ? (
                          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Verificado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                            <AlertCircle className="w-4 h-4" />
                            Pendente
                          </span>
                        )}
                        <span className="text-sm text-gray-400">
                          {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <ArgonInfoCard
        title="Ações Rápidas"
        subtitle="Acesso direto às principais funcionalidades"
        icon={<Sparkles className="w-5 h-5" />}
        iconGradient="primary"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <button
            onClick={() => router.push('/agenda')}
            className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Agendar Sessão</span>
          </button>

          <button
            onClick={() => router.push('/patients')}
            className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl hover:from-teal-100 hover:to-teal-200 transition-all group"
          >
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Novo Paciente</span>
          </button>

          <button
            onClick={() => router.push('/patients/transferencias')}
            className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all group"
          >
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ArrowRightLeft className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Transferências</span>
          </button>

          <button
            onClick={() => router.push('/camera')}
            className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all group"
          >
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Digitalizar</span>
          </button>
        </div>
      </ArgonInfoCard>

      {/* Modal de Transferência */}
      {showTransferModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Solicitar Transferência</h3>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedPatient(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Paciente</p>
                <p className="font-semibold text-gray-800">{selectedPatient.full_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transferir para
                </label>
                <select
                  value={transferData.to_fisioterapeuta_id}
                  onChange={(e) => setTransferData({ ...transferData, to_fisioterapeuta_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Selecione um fisioterapeuta</option>
                  {fisioterapeutas.map((fisio) => (
                    <option key={fisio.id} value={fisio.id}>
                      {fisio.first_name} {fisio.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da transferência
                </label>
                <textarea
                  value={transferData.reason}
                  onChange={(e) => setTransferData({ ...transferData, reason: e.target.value })}
                  placeholder="Descreva o motivo da transferência..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowTransferModal(false);
                    setSelectedPatient(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateTransferRequest}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium disabled:opacity-50"
                  style={{ background: argonTheme.gradients.primary }}
                >
                  {submitting ? 'Enviando...' : 'Enviar Solicitação'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

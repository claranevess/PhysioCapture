'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import ArgonLayout from '@/components/Argon/ArgonLayout';
import { ArgonCard, ArgonStatsCard, ArgonInfoCard } from '@/components/Argon/ArgonCard';
import { ArgonButton } from '@/components/Argon/ArgonButton';
import { argonTheme } from '@/lib/argon-theme';
import type { Patient, MedicalRecord, Document } from '@/lib/types';
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  Activity,
  ChevronLeft,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  ClipboardList,
  Stethoscope,
  Heart,
  Edit3
} from 'lucide-react';

type TabType = 'resumo' | 'sessoes' | 'documentos' | 'evolucao';

interface PhysioSession {
  id: number;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  status_display: string;
  notes?: string;
}

export default function PatientRecordsPage() {
  const params = useParams();
  const patientId = parseInt(params.id as string);

  const [activeTab, setActiveTab] = useState<TabType>('resumo');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [sessions, setSessions] = useState<PhysioSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    setLoading(true);
    setError('');

    try {
      const patientResponse = await api.get(`/api/prontuario/patients/${patientId}/`);
      setPatient(patientResponse.data);

      const recordsResponse = await api.get(`/api/prontuario/medical-records/?patient=${patientId}`);
      setMedicalRecords(recordsResponse.data.results || recordsResponse.data);

      const docsResponse = await api.get(`/api/documentos/documents/?patient=${patientId}`);
      setDocuments(docsResponse.data.results || docsResponse.data);

      try {
        const sessionsResponse = await api.get(`/api/prontuario/sessions/?patient=${patientId}`);
        setSessions(sessionsResponse.data.results || sessionsResponse.data);
      } catch {
        setSessions([]);
      }
    } catch (err: any) {
      console.error('Error loading patient data:', err);
      setError('Erro ao carregar dados do paciente');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REALIZADA':
        return argonTheme.colors.success.main;
      case 'CONFIRMADA':
        return argonTheme.colors.info.main;
      case 'AGENDADA':
        return argonTheme.colors.warning.main;
      case 'CANCELADA':
      case 'FALTA':
        return argonTheme.colors.error.main;
      default:
        return argonTheme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'REALIZADA':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELADA':
      case 'FALTA':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <ArgonLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2
              className="w-12 h-12 mx-auto mb-4 animate-spin"
              style={{ color: argonTheme.colors.primary.main }}
            />
            <p className="font-medium" style={{ color: argonTheme.colors.text.primary }}>
              Carregando prontuário...
            </p>
          </div>
        </div>
      </ArgonLayout>
    );
  }

  if (error || !patient) {
    return (
      <ArgonLayout>
        <ArgonCard className="max-w-md mx-auto p-6">
          <div className="text-center">
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${argonTheme.colors.error.main}20` }}
            >
              <AlertCircle className="w-8 h-8" style={{ color: argonTheme.colors.error.main }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: argonTheme.colors.text.primary }}>
              Erro ao Carregar
            </h3>
            <p className="text-sm mb-4" style={{ color: argonTheme.colors.text.secondary }}>
              {error || 'Paciente não encontrado'}
            </p>
            <Link href="/patients">
              <ArgonButton variant="gradient" color="primary">
                Voltar para Lista
              </ArgonButton>
            </Link>
          </div>
        </ArgonCard>
      </ArgonLayout>
    );
  }

  const tabs = [
    { id: 'resumo', label: 'Resumo', icon: <User className="w-4 h-4" /> },
    { id: 'sessoes', label: 'Sessões', icon: <Calendar className="w-4 h-4" /> },
    { id: 'documentos', label: 'Documentos', icon: <FileText className="w-4 h-4" /> },
    { id: 'evolucao', label: 'Evolução', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <ArgonLayout>
      <div className="space-y-6">
        {/* Header com Info do Paciente */}
        <div className="flex items-center gap-4 mb-2">
          <Link
            href="/patients"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: argonTheme.colors.text.secondary }} />
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
            Prontuário do Paciente
          </h1>
        </div>

        {/* Card Principal do Paciente */}
        <ArgonCard className="overflow-hidden">
          <div
            className="p-6"
            style={{ background: argonTheme.gradients.primary }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                {patient.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-white">
                <h2 className="text-2xl font-bold">{patient.full_name}</h2>
                <div className="flex items-center gap-4 mt-2 text-white/80 text-sm">
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {patient.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {patient.age || '-'} anos
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: patient.is_active ? 'rgba(255,255,255,0.2)' : 'rgba(239,68,68,0.3)'
                    }}
                  >
                    {patient.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <Link href={`/patients/${patientId}/edit`}>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white border-2 border-white/50 hover:bg-white/20 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-t" style={{ borderColor: argonTheme.colors.grey[100] }}>
            <div className="p-4 text-center border-r" style={{ borderColor: argonTheme.colors.grey[100] }}>
              <p className="text-2xl font-bold" style={{ color: argonTheme.colors.primary.main }}>
                {sessions.length}
              </p>
              <p className="text-xs" style={{ color: argonTheme.colors.text.secondary }}>Sessões</p>
            </div>
            <div className="p-4 text-center border-r" style={{ borderColor: argonTheme.colors.grey[100] }}>
              <p className="text-2xl font-bold" style={{ color: argonTheme.colors.success.main }}>
                {sessions.filter(s => s.status === 'REALIZADA').length}
              </p>
              <p className="text-xs" style={{ color: argonTheme.colors.text.secondary }}>Realizadas</p>
            </div>
            <div className="p-4 text-center border-r" style={{ borderColor: argonTheme.colors.grey[100] }}>
              <p className="text-2xl font-bold" style={{ color: argonTheme.colors.info.main }}>
                {documents.length}
              </p>
              <p className="text-xs" style={{ color: argonTheme.colors.text.secondary }}>Documentos</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: argonTheme.colors.warning.main }}>
                {medicalRecords.length}
              </p>
              <p className="text-xs" style={{ color: argonTheme.colors.text.secondary }}>Evoluções</p>
            </div>
          </div>
        </ArgonCard>

        {/* Tabs Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              style={{
                background: activeTab === tab.id ? argonTheme.gradients.primary : argonTheme.colors.grey[100],
                color: activeTab === tab.id ? '#FFFFFF' : argonTheme.colors.text.secondary,
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'resumo' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Informações Pessoais */}
            <ArgonInfoCard
              title="Informações Pessoais"
              subtitle="Dados cadastrais"
              icon={<User className="w-5 h-5" />}
              iconGradient="primary"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${argonTheme.colors.primary.main}15` }}>
                    <ClipboardList className="w-4 h-4" style={{ color: argonTheme.colors.primary.main }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: argonTheme.colors.text.secondary }}>CPF</p>
                    <p className="font-medium" style={{ color: argonTheme.colors.text.primary }}>{patient.cpf}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${argonTheme.colors.primary.main}15` }}>
                    <Calendar className="w-4 h-4" style={{ color: argonTheme.colors.primary.main }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: argonTheme.colors.text.secondary }}>Data de Nascimento</p>
                    <p className="font-medium" style={{ color: argonTheme.colors.text.primary }}>{formatDate(patient.birth_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${argonTheme.colors.primary.main}15` }}>
                    <Phone className="w-4 h-4" style={{ color: argonTheme.colors.primary.main }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: argonTheme.colors.text.secondary }}>Telefone</p>
                    <p className="font-medium" style={{ color: argonTheme.colors.text.primary }}>{patient.phone}</p>
                  </div>
                </div>
                {patient.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${argonTheme.colors.primary.main}15` }}>
                      <Mail className="w-4 h-4" style={{ color: argonTheme.colors.primary.main }} />
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: argonTheme.colors.text.secondary }}>Email</p>
                      <p className="font-medium" style={{ color: argonTheme.colors.text.primary }}>{patient.email}</p>
                    </div>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${argonTheme.colors.primary.main}15` }}>
                      <MapPin className="w-4 h-4" style={{ color: argonTheme.colors.primary.main }} />
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: argonTheme.colors.text.secondary }}>Endereço</p>
                      <p className="font-medium" style={{ color: argonTheme.colors.text.primary }}>{patient.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </ArgonInfoCard>

            {/* Informações Médicas */}
            <ArgonInfoCard
              title="Informações Clínicas"
              subtitle="Dados médicos"
              icon={<Stethoscope className="w-5 h-5" />}
              iconGradient="success"
            >
              <div className="space-y-4">
                {patient.chief_complaint && (
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                      Queixa Principal
                    </p>
                    <p className="text-sm p-3 rounded-lg" style={{ backgroundColor: argonTheme.colors.grey[50], color: argonTheme.colors.text.primary }}>
                      {patient.chief_complaint}
                    </p>
                  </div>
                )}
                {patient.medical_history && (
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                      Histórico Médico
                    </p>
                    <p className="text-sm p-3 rounded-lg whitespace-pre-wrap" style={{ backgroundColor: argonTheme.colors.grey[50], color: argonTheme.colors.text.primary }}>
                      {patient.medical_history}
                    </p>
                  </div>
                )}
                {patient.last_visit && (
                  <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: argonTheme.colors.grey[100] }}>
                    <Clock className="w-4 h-4" style={{ color: argonTheme.colors.text.secondary }} />
                    <span className="text-sm" style={{ color: argonTheme.colors.text.secondary }}>
                      Última consulta: <strong style={{ color: argonTheme.colors.text.primary }}>{formatDate(patient.last_visit)}</strong>
                    </span>
                  </div>
                )}
                {!patient.chief_complaint && !patient.medical_history && (
                  <p className="text-sm text-center py-4" style={{ color: argonTheme.colors.text.secondary }}>
                    Nenhuma informação clínica registrada
                  </p>
                )}
              </div>
            </ArgonInfoCard>
          </div>
        )}

        {activeTab === 'sessoes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold" style={{ color: argonTheme.colors.text.primary }}>
                Histórico de Sessões ({sessions.length})
              </h2>
              <Link href={`/agenda?patient=${patientId}`}>
                <ArgonButton variant="gradient" color="primary" size="sm" icon={<Calendar className="w-4 h-4" />}>
                  Agendar
                </ArgonButton>
              </Link>
            </div>

            {sessions.length === 0 ? (
              <ArgonCard className="p-12 text-center">
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${argonTheme.colors.primary.main}15` }}
                >
                  <Calendar className="w-8 h-8" style={{ color: argonTheme.colors.primary.main }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: argonTheme.colors.text.primary }}>
                  Nenhuma sessão registrada
                </h3>
                <p className="text-sm mb-4" style={{ color: argonTheme.colors.text.secondary }}>
                  Agende a primeira sessão deste paciente
                </p>
                <Link href={`/agenda?patient=${patientId}`}>
                  <ArgonButton variant="gradient" color="primary">
                    Agendar Sessão
                  </ArgonButton>
                </Link>
              </ArgonCard>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <ArgonCard key={session.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${getStatusColor(session.status)}15` }}
                        >
                          <span style={{ color: getStatusColor(session.status) }}>
                            {getStatusIcon(session.status)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: argonTheme.colors.text.primary }}>
                            {formatDate(session.scheduled_date)} às {session.scheduled_time?.slice(0, 5)}
                          </p>
                          <p className="text-sm" style={{ color: argonTheme.colors.text.secondary }}>
                            {session.duration_minutes} minutos
                          </p>
                        </div>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: `${getStatusColor(session.status)}15`,
                          color: getStatusColor(session.status)
                        }}
                      >
                        {session.status_display || session.status}
                      </span>
                    </div>
                    {session.notes && (
                      <p className="mt-3 text-sm p-3 rounded-lg" style={{ backgroundColor: argonTheme.colors.grey[50], color: argonTheme.colors.text.secondary }}>
                        {session.notes}
                      </p>
                    )}
                  </ArgonCard>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documentos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold" style={{ color: argonTheme.colors.text.primary }}>
                Documentos ({documents.length})
              </h2>
              <Link href={`/documents/digitize?patient=${patientId}`}>
                <ArgonButton variant="gradient" color="primary" size="sm" icon={<FileText className="w-4 h-4" />}>
                  Adicionar
                </ArgonButton>
              </Link>
            </div>

            {documents.length === 0 ? (
              <ArgonCard className="p-12 text-center">
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${argonTheme.colors.primary.main}15` }}
                >
                  <FileText className="w-8 h-8" style={{ color: argonTheme.colors.primary.main }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: argonTheme.colors.text.primary }}>
                  Nenhum documento cadastrado
                </h3>
                <p className="text-sm mb-4" style={{ color: argonTheme.colors.text.secondary }}>
                  Adicione documentos digitalizados para este paciente
                </p>
                <Link href={`/documents/digitize?patient=${patientId}`}>
                  <ArgonButton variant="gradient" color="primary">
                    Digitalizar Documento
                  </ArgonButton>
                </Link>
              </ArgonCard>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <ArgonCard key={doc.id} hover className="overflow-hidden">
                    <div className="h-32 flex items-center justify-center" style={{ backgroundColor: argonTheme.colors.grey[50] }}>
                      {doc.thumbnail_url ? (
                        <img src={doc.thumbnail_url} alt={doc.title} className="w-full h-full object-contain" />
                      ) : (
                        <FileText className="w-12 h-12" style={{ color: argonTheme.colors.grey[300] }} />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold truncate" style={{ color: argonTheme.colors.text.primary }}>
                        {doc.title}
                      </h3>
                      <p className="text-xs mt-1" style={{ color: argonTheme.colors.text.secondary }}>
                        {formatDateTime(doc.created_at)}
                      </p>
                    </div>
                  </ArgonCard>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'evolucao' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold" style={{ color: argonTheme.colors.text.primary }}>
                Evolução Clínica ({medicalRecords.length})
              </h2>
              <ArgonButton variant="gradient" color="primary" size="sm" icon={<Activity className="w-4 h-4" />}>
                Nova Evolução
              </ArgonButton>
            </div>

            {medicalRecords.length === 0 ? (
              <ArgonCard className="p-12 text-center">
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${argonTheme.colors.primary.main}15` }}
                >
                  <Activity className="w-8 h-8" style={{ color: argonTheme.colors.primary.main }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: argonTheme.colors.text.primary }}>
                  Nenhuma evolução registrada
                </h3>
                <p className="text-sm mb-4" style={{ color: argonTheme.colors.text.secondary }}>
                  Registre as consultas e evoluções do tratamento
                </p>
                <ArgonButton variant="gradient" color="primary">
                  Adicionar Evolução
                </ArgonButton>
              </ArgonCard>
            ) : (
              <div className="space-y-4">
                {medicalRecords.map((record, index) => (
                  <ArgonCard key={record.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: argonTheme.colors.primary.main }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-sm" style={{ color: argonTheme.colors.text.secondary }}>
                              {formatDateTime(record.record_date)}
                            </p>
                            <h3 className="font-semibold mt-1" style={{ color: argonTheme.colors.text.primary }}>
                              {record.record_type_display || record.record_type || 'Consulta'}
                            </h3>
                          </div>
                        </div>

                        {record.subjective && (
                          <div className="mb-3">
                            <p className="text-xs font-bold uppercase mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                              Subjetivo
                            </p>
                            <p className="text-sm" style={{ color: argonTheme.colors.text.primary }}>{record.subjective}</p>
                          </div>
                        )}

                        {record.objective && (
                          <div className="mb-3">
                            <p className="text-xs font-bold uppercase mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                              Objetivo
                            </p>
                            <p className="text-sm" style={{ color: argonTheme.colors.text.primary }}>{record.objective}</p>
                          </div>
                        )}

                        {record.assessment && (
                          <div className="mb-3">
                            <p className="text-xs font-bold uppercase mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                              Avaliação
                            </p>
                            <p className="text-sm" style={{ color: argonTheme.colors.text.primary }}>{record.assessment}</p>
                          </div>
                        )}

                        {record.plan && (
                          <div>
                            <p className="text-xs font-bold uppercase mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                              Plano
                            </p>
                            <p className="text-sm" style={{ color: argonTheme.colors.text.primary }}>{record.plan}</p>
                          </div>
                        )}

                        {record.notes && (
                          <div className="mt-3 pt-3 border-t" style={{ borderColor: argonTheme.colors.grey[100] }}>
                            <p className="text-xs" style={{ color: argonTheme.colors.text.secondary }}>
                              <strong>Observações:</strong> {record.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </ArgonCard>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ArgonLayout>
  );
}

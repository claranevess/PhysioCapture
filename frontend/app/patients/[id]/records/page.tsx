'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Patient, MedicalRecord, Document } from '@/lib/types';

type TabType = 'resumo' | 'documentos' | 'evolucao';

export default function PatientRecordsPage() {
  const params = useParams();
  const patientId = parseInt(params.id as string);

  const [activeTab, setActiveTab] = useState<TabType>('resumo');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    setLoading(true);
    setError('');

    try {
      // Load patient details
      const patientResponse = await api.get(`/api/prontuario/patients/${patientId}/`);
      setPatient(patientResponse.data);

      // Load medical records
      const recordsResponse = await api.get(
        `/api/prontuario/medical-records/?patient=${patientId}`
      );
      setMedicalRecords(recordsResponse.data.results || recordsResponse.data);

      // Load documents
      const docsResponse = await api.get(
        `/api/documentos/documents/?patient=${patientId}`
      );
      setDocuments(docsResponse.data.results || docsResponse.data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <p className="font-bold text-lg mb-2">❌ Erro</p>
          <p className="mb-4">{error || 'Paciente não encontrado'}</p>
          <Link
            href="/patients"
            className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Voltar para Lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Patient Info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Link
            href="/patients"
            className="inline-flex items-center text-white hover:text-blue-100 mb-4"
          >
            <span className="mr-2">←</span>
            <span>Voltar</span>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Patient Photo */}
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              {patient.photo_url ? (
                <img
                  src={patient.photo_url}
                  alt={patient.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-blue-600">
                  {patient.full_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Patient Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{patient.full_name}</h1>
              <div className="text-sm text-blue-100 mt-1 space-y-1">
                <p>📞 {patient.phone}</p>
                <p>🎂 {patient.age || '-'} anos • CPF: {patient.cpf}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('resumo')}
              className={`flex-1 min-w-[100px] py-3 px-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'resumo'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 Resumo
            </button>
            <button
              onClick={() => setActiveTab('documentos')}
              className={`flex-1 min-w-[100px] py-3 px-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'documentos'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📄 Documentos
            </button>
            <button
              onClick={() => setActiveTab('evolucao')}
              className={`flex-1 min-w-[100px] py-3 px-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'evolucao'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📈 Evolução
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Resumo Tab */}
        {activeTab === 'resumo' && (
          <div className="space-y-4">
            {/* Personal Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                ℹ️ Informações Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">CPF</p>
                  <p className="text-gray-900">{patient.cpf}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Data de Nascimento</p>
                  <p className="text-gray-900">{formatDate(patient.birth_date)}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Telefone</p>
                  <p className="text-gray-900">{patient.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Email</p>
                  <p className="text-gray-900">{patient.email || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500 font-medium">Endereço</p>
                  <p className="text-gray-900">{patient.address || '-'}</p>
                </div>
              </div>
            </div>

            {/* Medical Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🩺 Informações Médicas
              </h2>
              <div className="space-y-4">
                {patient.chief_complaint && (
                  <div>
                    <p className="text-gray-500 font-medium text-sm">Queixa Principal</p>
                    <p className="text-gray-900 mt-1">{patient.chief_complaint}</p>
                  </div>
                )}
                {patient.medical_history && (
                  <div>
                    <p className="text-gray-500 font-medium text-sm">Histórico Médico</p>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                      {patient.medical_history}
                    </p>
                  </div>
                )}
                {patient.last_visit && (
                  <div>
                    <p className="text-gray-500 font-medium text-sm">Última Consulta</p>
                    <p className="text-gray-900 mt-1">{formatDate(patient.last_visit)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{medicalRecords.length}</p>
                <p className="text-sm text-gray-600 mt-1">Consultas</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{documents.length}</p>
                <p className="text-sm text-gray-600 mt-1">Documentos</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center col-span-2 md:col-span-1">
                <p className="text-3xl font-bold text-purple-600">
                  {patient.is_active ? '✓' : '✕'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {patient.is_active ? 'Ativo' : 'Inativo'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Documentos Tab */}
        {activeTab === 'documentos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                📄 Documentos ({documents.length})
              </h2>
              <Link
                href={`/camera?patient=${patientId}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
              >
                + Novo
              </Link>
            </div>

            {documents.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum documento cadastrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Adicione documentos digitalizados para este paciente
                </p>
                <Link
                  href={`/camera?patient=${patientId}`}
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <span className="text-xl">+</span>
                  <span>Adicionar Documento</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    {doc.thumbnail_url ? (
                      <div className="h-40 bg-gray-100">
                        <img
                          src={doc.thumbnail_url}
                          alt={doc.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-gray-100 flex items-center justify-center">
                        <span className="text-5xl">📄</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 truncate">{doc.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{doc.document_type}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDateTime(doc.upload_date)}
                      </p>
                      {doc.ocr_processed && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          ✓ OCR Processado
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Evolução Tab */}
        {activeTab === 'evolucao' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                📈 Evolução Clínica ({medicalRecords.length})
              </h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold">
                + Nova
              </button>
            </div>

            {medicalRecords.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">📈</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhuma evolução registrada
                </h3>
                <p className="text-gray-600 mb-6">
                  Registre as consultas e evoluções do tratamento
                </p>
                <button className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  <span className="text-xl">+</span>
                  <span>Adicionar Evolução</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Timeline */}
                <div className="relative">
                  {medicalRecords.map((record, index) => (
                    <div key={record.id} className="flex mb-6 last:mb-0">
                      {/* Timeline Line */}
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        {index !== medicalRecords.length - 1 && (
                          <div className="w-0.5 h-full bg-blue-200 flex-1 mt-2"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-white rounded-lg shadow-md p-4 mb-2">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm text-gray-500">
                              {formatDateTime(record.consultation_date)}
                            </p>
                            <h3 className="font-semibold text-gray-900 mt-1">
                              {record.treatment_type || 'Consulta'}
                            </h3>
                          </div>
                          {record.verified && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                              ✓ Verificado
                            </span>
                          )}
                        </div>

                        {record.subjective && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              Subjetivo
                            </p>
                            <p className="text-sm text-gray-700 mt-1">{record.subjective}</p>
                          </div>
                        )}

                        {record.objective && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              Objetivo
                            </p>
                            <p className="text-sm text-gray-700 mt-1">{record.objective}</p>
                          </div>
                        )}

                        {record.assessment && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              Avaliação
                            </p>
                            <p className="text-sm text-gray-700 mt-1">{record.assessment}</p>
                          </div>
                        )}

                        {record.plan && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase">Plano</p>
                            <p className="text-sm text-gray-700 mt-1">{record.plan}</p>
                          </div>
                        )}

                        {record.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              <strong>Observações:</strong> {record.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

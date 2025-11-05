'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRoutes } from '@/lib/api';
import { Patient, MedicalRecord } from '@/lib/types';
import { format } from 'date-fns';

export default function PatientRecordsPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = Number(params.id);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [patientRes, recordsRes] = await Promise.all([
        apiRoutes.patients.get(patientId),
        apiRoutes.patients.medicalRecords(patientId),
      ]);
      setPatient(patientRes.data);
      setRecords(recordsRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erro</p>
          <p>{error || 'Paciente não encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link href="/patients" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Voltar para Pacientes
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {patient.full_name}
              </h1>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>CPF:</strong> {patient.cpf}</p>
                <p><strong>Idade:</strong> {patient.age} anos</p>
                <p><strong>Telefone:</strong> {patient.phone}</p>
                {patient.email && <p><strong>Email:</strong> {patient.email}</p>}
              </div>
            </div>
            <Link
              href={`/patients/${patientId}`}
              className="text-blue-600 hover:text-blue-800"
            >
              Ver Perfil Completo →
            </Link>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Prontuários Médicos
          </h2>
          <Link
            href={`/patients/${patientId}/records/new`}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            + Novo Prontuário
          </Link>
        </div>

        {records.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">Nenhum prontuário cadastrado</p>
            <Link
              href={`/patients/${patientId}/records/new`}
              className="text-blue-600 hover:text-blue-800"
            >
              Criar primeiro prontuário
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {record.title}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {record.record_type_display || record.record_type}
                      </span>
                    </div>
                    
                    {record.chief_complaint && (
                      <p className="text-gray-600 text-sm mb-2">
                        <strong>Queixa:</strong> {record.chief_complaint}
                      </p>
                    )}
                    
                    {record.diagnosis && (
                      <p className="text-gray-600 text-sm mb-2">
                        <strong>Diagnóstico:</strong> {record.diagnosis}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                      <span>
                        📅 {format(new Date(record.record_date), 'dd/MM/yyyy')}
                      </span>
                      {record.created_by_name && (
                        <span>👤 {record.created_by_name}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/patients/${patientId}/records/${record.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Ver Detalhes →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRoutes } from "@/lib/api";

export default function Home() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    documentsToday: 0,
    recentPatients: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Carregar estatísticas
      const patientsResponse = await apiRoutes.patients.list();
      setStats({
        totalPatients: patientsResponse.data.count || patientsResponse.data.length || 0,
        documentsToday: 0, // TODO: implementar contagem
        recentPatients: patientsResponse.data.results?.slice(0, 5) || patientsResponse.data.slice(0, 5) || [],
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
            Bem-vindo ao PhysioCapture 🏥
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Sistema de Gestão Unificada para Clínicas de Fisioterapia
          </p>
        </div>

        {/* Stats Cards - Mobile First */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl md:text-4xl">👥</div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {loading ? "..." : stats.totalPatients}
            </div>
            <div className="text-xs md:text-sm text-gray-600">Pacientes</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl md:text-4xl">📄</div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {loading ? "..." : stats.documentsToday}
            </div>
            <div className="text-xs md:text-sm text-gray-600">Docs Hoje</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-purple-500 col-span-2 md:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl md:text-4xl">✅</div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">100%</div>
            <div className="text-xs md:text-sm text-gray-600">Digital</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-yellow-500 col-span-2 md:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl md:text-4xl">⚡</div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">OCR</div>
            <div className="text-xs md:text-sm text-gray-600">Ativo</div>
          </div>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <Link
              href="/patients/new"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg p-6 transition-all transform hover:scale-105 active:scale-95"
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">➕</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">Novo Paciente</h3>
                  <p className="text-sm text-blue-100">Cadastrar paciente</p>
                </div>
              </div>
            </Link>

            <Link
              href="/camera"
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg p-6 transition-all transform hover:scale-105 active:scale-95"
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">�</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">Digitalizar</h3>
                  <p className="text-sm text-green-100">Capturar documento</p>
                </div>
              </div>
            </Link>

            <Link
              href="/patients"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg p-6 transition-all transform hover:scale-105 active:scale-95"
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">🔍</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">Buscar</h3>
                  <p className="text-sm text-purple-100">Encontrar paciente</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Patients */}
        {stats.recentPatients.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Pacientes Recentes
              </h2>
              <Link
                href="/patients"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todos →
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentPatients.map((patient: any) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}/records`}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {patient.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {patient.full_name}
                    </p>
                    <p className="text-xs text-gray-500">{patient.phone}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {patient.age} anos
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Info Banner - Mobile Friendly */}
        <div className="mt-6 md:mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">💡</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">
                Digitalização Inteligente
              </h3>
              <p className="text-sm text-blue-100 mb-3">
                Use o OCR para extrair automaticamente o texto de documentos físicos.
                Basta fotografar com a câmera do seu dispositivo!
              </p>
              <Link
                href="/camera"
                className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
              >
                Experimentar agora →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

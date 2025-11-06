/**
 * Dashboard Principal - PhysioCapture
 * Desenvolvido por Core Hive
 */

'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRoutes } from "@/lib/api";
import { Card, CardHeader, CardBody } from "@/components/UI/Card";
import { Button } from "@/components/UI/Button";
import { Badge } from "@/components/UI/Badge";

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
      const patientsResponse = await apiRoutes.patients.list();
      setStats({
        totalPatients: patientsResponse.data.count || patientsResponse.data.length || 0,
        documentsToday: 0,
        recentPatients: patientsResponse.data.results?.slice(0, 5) || patientsResponse.data.slice(0, 5) || [],
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F7F7] via-white to-[#F5F7F9]">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl pb-24 md:pb-8">
        {/* Header com Gradiente */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0D7676] via-[#14B8B8] to-[#26C2C2] p-8 md:p-12 shadow-xl">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
              Dashboard PhysioCapture
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-4">
              Gestão Unificada para Clínicas de Fisioterapia
            </p>
            <Badge variant="primary" size="md" className="bg-white/20 text-white backdrop-blur-sm">
              Desenvolvido por Core Hive
            </Badge>
          </div>
          {/* Decoração de fundo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        </div>

        {/* Stats Cards - Estilo DataPharma */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Card 1 - Total Pacientes */}
          <Card variant="elevated" className="relative overflow-hidden">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#14B8B8] to-[#26C2C2] flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                {loading ? "..." : stats.totalPatients}
              </div>
              <div className="text-sm font-medium text-gray-600">Total de Pacientes</div>
              <div className="text-xs text-[#14B8B8] font-semibold mt-2">+5% este mês</div>
            </CardBody>
          </Card>

          {/* Card 2 - Documentos */}
          <Card variant="elevated" className="relative overflow-hidden">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#4CAF50] to-[#66BB6A] flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                {loading ? "..." : stats.documentsToday}
              </div>
              <div className="text-sm font-medium text-gray-600">Docs Digitalizados</div>
              <div className="text-xs text-[#4CAF50] font-semibold mt-2">Hoje</div>
            </CardBody>
          </Card>

          {/* Card 3 - OCR Status */}
          <Card variant="elevated" className="relative overflow-hidden col-span-2 md:col-span-1">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF9800] to-[#FFB74D] flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">OCR</div>
              <div className="text-sm font-medium text-gray-600">Sistema Ativo</div>
              <Badge variant="success" size="sm" className="mt-2">
                ● Online
              </Badge>
            </CardBody>
          </Card>

          {/* Card 4 - Digital */}
          <Card variant="elevated" className="relative overflow-hidden col-span-2 md:col-span-1">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#9C27B0] to-[#BA68C8] flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">100%</div>
              <div className="text-sm font-medium text-gray-600">Totalmente Digital</div>
              <div className="text-xs text-purple-600 font-semibold mt-2">Sem papel</div>
            </CardBody>
          </Card>
        </div>

        {/* Ações Rápidas - Cards com Gradiente */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-gradient-to-b from-[#14B8B8] to-[#26C2C2] rounded-full"></span>
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/patients/new">
              <Card gradient="primary" hover className="cursor-pointer h-full">
                <CardBody className="p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Novo Paciente</h3>
                      <p className="text-sm text-white/80">Cadastrar novo paciente no sistema</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>

            <Link href="/camera">
              <Card gradient="secondary" hover className="cursor-pointer h-full">
                <CardBody className="p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Digitalizar</h3>
                      <p className="text-sm text-white/80">Capturar e processar documento</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>

            <Link href="/patients">
              <Card gradient="accent" hover className="cursor-pointer h-full">
                <CardBody className="p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Buscar Paciente</h3>
                      <p className="text-sm text-white/80">Encontrar prontuários e documentos</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          </div>
        </div>

        {/* Pacientes Recentes */}
        {stats.recentPatients.length > 0 && (
          <Card variant="elevated" className="mb-8">
            <CardHeader
              gradient="header"
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              <h2 className="text-xl font-bold">Pacientes Recentes</h2>
              <p className="text-sm text-white/80">Últimos pacientes cadastrados</p>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                {stats.recentPatients.map((patient: any) => (
                  <Link
                    key={patient.id}
                    href={`/patients/${patient.id}/records`}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-[#E6F7F7] hover:to-transparent transition-all duration-300 group"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#14B8B8] to-[#26C2C2] flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
                      {patient.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-gray-900 truncate group-hover:text-[#14B8B8] transition-colors">
                        {patient.full_name}
                      </p>
                      <p className="text-sm text-gray-500">{patient.phone}</p>
                    </div>
                    <Badge variant="primary">{patient.age} anos</Badge>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-[#14B8B8] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Link href="/patients">
                  <Button variant="outline" fullWidth>
                    Ver Todos os Pacientes →
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Banner Informativo */}
        <Card gradient="primary" className="relative overflow-hidden">
          <CardBody className="p-8 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Digitalização Inteligente com OCR</h3>
                <p className="text-white/90 mb-4 leading-relaxed">
                  Utilize nossa tecnologia de reconhecimento óptico de caracteres (OCR) para extrair automaticamente 
                  o texto de documentos físicos. Basta fotografar com a câmera do seu dispositivo e o sistema fará o resto!
                </p>
                <Link href="/camera">
                  <Button variant="secondary" size="lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    Experimentar Agora
                  </Button>
                </Link>
              </div>
            </div>
            {/* Decoração */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          </CardBody>
        </Card>

        {/* Footer - Branding Core Hive */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md">
            <span className="text-gray-600 text-sm">Desenvolvido com</span>
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-600 text-sm">por</span>
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#14B8B8] to-[#26C2C2]">
              Core Hive
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

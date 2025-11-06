'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRoutes } from "@/lib/api";
import { Users, FileText, Calendar, UserPlus, Camera, Search, TrendingUp, Activity, Clock, ChevronRight } from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState({ totalPatients: 0, documentsToday: 0, recentPatients: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      const patientsResponse = await apiRoutes.patients.list();
      setStats({
        totalPatients: patientsResponse.data.count || patientsResponse.data.length || 0,
        documentsToday: 0,
        recentPatients: patientsResponse.data.results?.slice(0, 5) || patientsResponse.data.slice(0, 5) || []
      });
    } catch (error) { console.error('Erro:', error); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-gradient-to-r from-[#4DB6AC] to-[#009688] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">PHYSIOCAPTURE DASHBOARD</h1>
              <p className="text-white/90 text-sm">Sistema de Gestão Fisioterapêutica  Desenvolvido pela Core Hive</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <Clock className="w-5 h-5 text-white" />
              <span className="text-white font-medium">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#7F8C8D]">Total de Pacientes</p>
                <p className="text-3xl font-bold mt-2 text-[#2C3E50]">{loading ? "..." : stats.totalPatients}</p>
                <div className="flex items-center gap-1 mt-3">
                  <TrendingUp className="w-4 h-4 text-[#4CAF50]" />
                  <span className="text-sm font-medium text-[#4CAF50]">+15%</span>
                  <span className="text-xs text-[#7F8C8D]">vs mês anterior</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#009688]/10">
                <Users className="w-7 h-7 text-[#009688]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#7F8C8D]">Documentos Hoje</p>
                <p className="text-3xl font-bold mt-2 text-[#2C3E50]">{loading ? "..." : stats.documentsToday}</p>
                <div className="flex items-center gap-1 mt-3">
                  <Activity className="w-4 h-4 text-[#66BB6A]" />
                  <span className="text-xs text-[#7F8C8D]">Digitalizados com OCR</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#66BB6A]/10">
                <FileText className="w-7 h-7 text-[#66BB6A]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#7F8C8D]">Sistema</p>
                <p className="text-3xl font-bold mt-2 text-[#2C3E50]">100%</p>
                <div className="flex items-center gap-1 mt-3">
                  <Calendar className="w-4 h-4 text-[#FF8099]" />
                  <span className="text-xs text-[#7F8C8D]">Digitalizado</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#FF8099]/10">
                <Calendar className="w-7 h-7 text-[#FF8099]" />
              </div>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-[#2C3E50]">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/patients/new" className="group bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:border-[#009688]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#009688]/10">
                    <UserPlus className="w-6 h-6 text-[#009688]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2C3E50]">Novo Paciente</h3>
                    <p className="text-sm text-[#7F8C8D]">Cadastrar paciente</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1 text-[#7F8C8D]" />
              </div>
            </Link>
            <Link href="/camera" className="group bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:border-[#66BB6A]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#66BB6A]/10">
                    <Camera className="w-6 h-6 text-[#66BB6A]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2C3E50]">Digitalizar</h3>
                    <p className="text-sm text-[#7F8C8D]">Capturar documento</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1 text-[#7F8C8D]" />
              </div>
            </Link>
            <Link href="/patients" className="group bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:border-[#FF8099]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FF8099]/10">
                    <Search className="w-6 h-6 text-[#FF8099]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2C3E50]">Buscar</h3>
                    <p className="text-sm text-[#7F8C8D]">Encontrar paciente</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1 text-[#7F8C8D]" />
              </div>
            </Link>
          </div>
        </div>
        {stats.recentPatients.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#2C3E50]">Pacientes Recentes</h2>
                <Link href="/patients" className="text-sm font-medium hover:underline text-[#009688]">Ver todos</Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.recentPatients.map((patient: any) => (
                <Link key={patient.id} href={`/patients/-Force{patient.id}/records`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white bg-[#009688]">
                      {patient.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#2C3E50]">{patient.full_name}</h3>
                      <p className="text-sm text-[#7F8C8D]">{patient.phone}  {patient.age} anos</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#7F8C8D]" />
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#7F8C8D]">PhysioCapture © 2024  Desenvolvido por <span className="font-semibold text-[#009688]">Core Hive</span></p>
        </div>
      </div>
    </div>
  );
}
'use client';

import Link from 'next/link';
import {
  Sparkles,
  FileText,
  Users,
  Camera,
  BarChart3,
  Shield,
  Zap,
  Heart,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-white to-[#E8F5F4]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #009688 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#009688] to-[#4DB6AC] rounded-3xl mb-6 shadow-2xl">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-[#2C3E50] mb-4">
              PhysioCapture
            </h1>
            <p className="text-xl sm:text-2xl text-[#7F8C8D] max-w-3xl mx-auto">
              Sistema Inteligente de Gestão Fisioterapêutica
            </p>
            <p className="text-lg text-[#7F8C8D] mt-2">
              Digitalize, organize e gerencie prontuários com facilidade
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              href="/login"
              className="group px-8 py-4 bg-gradient-to-r from-[#009688] to-[#4DB6AC] text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-lg"
            >
              Fazer Login
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-[#009688] font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-lg border-2 border-[#009688]"
            >
              Criar Conta Grátis
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-[#009688] to-[#4DB6AC] rounded-xl flex items-center justify-center mb-6">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">
                Digitalização Inteligente
              </h3>
              <p className="text-[#7F8C8D]">
                Capture documentos físicos com OCR automático e organize tudo em prontuários digitais
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-[#66BB6A] to-[#81C784] rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">
                Prontuário Centralizado
              </h3>
              <p className="text-[#7F8C8D]">
                Todos os dados do paciente em um só lugar, com histórico completo e organização automática
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF8099] to-[#FF9FAE] rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">
                Estatísticas em Tempo Real
              </h3>
              <p className="text-[#7F8C8D]">
                Dashboards interativos com métricas e gráficos para gestão eficiente da clínica
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100">
            <h2 className="text-3xl font-bold text-[#2C3E50] text-center mb-12">
              Por que escolher o PhysioCapture?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#009688]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-[#009688]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C3E50] mb-2">Economia de Tempo</h3>
                  <p className="text-[#7F8C8D]">Reduza até 70% do tempo gasto com digitação e organização</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#66BB6A]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-[#66BB6A]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C3E50] mb-2">Segurança Total</h3>
                  <p className="text-[#7F8C8D]">Seus dados protegidos com backup automático e controle de acesso</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#FF8099]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-[#FF8099]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C3E50] mb-2">Atendimento Humanizado</h3>
                  <p className="text-[#7F8C8D]">Mais tempo para cuidar dos pacientes, menos tempo com papelada</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#BA68C8]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-[#BA68C8]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C3E50] mb-2">Equipe Conectada</h3>
                  <p className="text-[#7F8C8D]">Colaboração perfeita entre fisioterapeutas e equipe administrativa</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Types - Papéis do Sistema */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-[#2C3E50] text-center mb-4">
              Papéis do Sistema
            </h2>
            <p className="text-center text-[#7F8C8D] mb-12 max-w-2xl mx-auto">
              Controle de acesso inteligente para cada tipo de profissional da clínica
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-[#009688] to-[#4DB6AC] rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8" />
                  <h3 className="font-bold text-xl">Gestor</h3>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">Gerencia toda a clínica</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">Cadastra profissionais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">Relatórios e estoque</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-[#66BB6A] to-[#81C784] rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-8 h-8" />
                  <h3 className="font-bold text-xl">Fisioterapeuta</h3>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">Atende seus pacientes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">Prontuários e evoluções</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">Agenda pessoal</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-[#BA68C8] to-[#CE93D8] rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8" />
                  <h3 className="font-bold text-xl">Recepção</h3>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">Gerencia a agenda</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">Cadastro de pacientes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">Confirmação de sessões</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl max-w-5xl mx-auto">
              <p className="text-[#2C3E50] text-center">
                <strong className="text-[#009688]">📝 Nota:</strong> Pacientes são <strong>registros de dados</strong>, não usuários.
                Eles não fazem login no sistema e são gerenciados pelos profissionais.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#7F8C8D]">
              © 2025 PhysioCapture • Sistema de Gestão Fisioterapêutica
            </p>
            <p className="text-sm text-[#7F8C8D] flex items-center gap-2">
              Desenvolvido por{' '}
              <span className="font-semibold bg-gradient-to-r from-[#009688] to-[#66BB6A] bg-clip-text text-transparent">
                Core Hive
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

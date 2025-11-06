'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiRoutes } from '@/lib/api';
import {
  FileText, Camera, Bot, CheckCircle2, ArrowRight, Sparkles,
  Users, Clock, Shield, Zap, Mail, Phone, Building2, User,
  MessageSquare, Loader2, AlertCircle,
} from 'lucide-react';

export default function LandingPage() {
  const [formData, setFormData] = useState({
    nome_clinica: '',
    nome_responsavel: '',
    email: '',
    telefone: '',
    num_fisioterapeutas: '',
    mensagem: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await apiRoutes.auth.createLead({
        ...formData,
        num_fisioterapeutas: parseInt(formData.num_fisioterapeutas) || 1,
      });
      setSuccess(true);
      setFormData({
        nome_clinica: '',
        nome_responsavel: '',
        email: '',
        telefone: '',
        num_fisioterapeutas: '',
        mensagem: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao enviar formulário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#009688] to-[#4DB6AC] rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#2C3E50]">PhysioCapture</span>
            </div>
            <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-[#009688] font-medium hover:bg-[#009688]/5 rounded-lg transition-colors">
              Já é Parceiro? Faça Login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="pt-32 pb-20 bg-gradient-to-br from-[#F5F7FA] via-white to-[#E8F5F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#009688]/10 rounded-full text-[#009688] font-medium text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                Solução Profissional para Clínicas
              </div>
              <h1 className="text-5xl font-bold text-[#2C3E50] mb-6 leading-tight">
                Centralize Todos os Dados dos Seus Pacientes em{' '}
                <span className="bg-gradient-to-r from-[#009688] to-[#66BB6A] bg-clip-text text-transparent">Um Só Lugar</span>
              </h1>
              <p className="text-xl text-[#7F8C8D] mb-8 leading-relaxed">
                Sistema de gestão completo para clínicas de fisioterapia. Digitalize documentos, gerencie prontuários eletrônicos e conte com suporte IA 24/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#contato" className="px-8 py-4 bg-gradient-to-r from-[#009688] to-[#4DB6AC] text-white font-semibold rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  Quero Contratar o PhysioCapture
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#beneficios" className="px-8 py-4 border-2 border-[#009688] text-[#009688] font-semibold rounded-lg hover:bg-[#009688]/5 transition-all flex items-center justify-center gap-2">
                  Conhecer Benefícios
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#009688]/20 to-[#66BB6A]/20 blur-3xl"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-[#009688]/5 rounded-lg">
                    <FileText className="w-8 h-8 text-[#009688]" />
                    <div>
                      <p className="font-semibold text-[#2C3E50]">Prontuários Digitais</p>
                      <p className="text-sm text-[#7F8C8D]">Centralizados e seguros</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[#66BB6A]/5 rounded-lg">
                    <Camera className="w-8 h-8 text-[#66BB6A]" />
                    <div>
                      <p className="font-semibold text-[#2C3E50]">OCR Inteligente</p>
                      <p className="text-sm text-[#7F8C8D]">Digitalização automática</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[#BA68C8]/5 rounded-lg">
                    <Bot className="w-8 h-8 text-[#BA68C8]" />
                    <div>
                      <p className="font-semibold text-[#2C3E50]">Assistente IA</p>
                      <p className="text-sm text-[#7F8C8D]">Suporte 24/7</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">Por Que Escolher o PhysioCapture?</h2>
            <p className="text-xl text-[#7F8C8D]">Solução completa que otimiza sua clínica</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Camera, color: 'from-[#009688] to-[#4DB6AC]', title: 'Digitalização Inteligente', description: 'OCR automático transforma fichas físicas em dados estruturados instantaneamente' },
              { icon: FileText, color: 'from-[#66BB6A] to-[#81C784]', title: 'Prontuários Centralizados', description: 'Histórico completo do paciente acessível em segundos, de qualquer lugar' },
              { icon: Bot, color: 'from-[#BA68C8] to-[#CE93D8]', title: 'Suporte IA 24/7', description: 'Chatbot inteligente responde dúvidas da equipe a qualquer momento' },
              { icon: Zap, color: 'from-[#FF8099] to-[#FF9AAA]', title: 'Sem Migração Complexa', description: 'Complementa seus sistemas existentes sem necessidade de substituição' },
            ].map((benefit, index) => (
              <div key={index} className="group p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className={`w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-3">{benefit.title}</h3>
                <p className="text-[#7F8C8D] leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-[#F5F7FA] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">Como Funciona</h2>
            <p className="text-xl text-[#7F8C8D]">Processo simples e profissional de contratação</p>
          </div>
          <div className="grid md:grid-cols-5 gap-8">
            {[
              { step: '1', title: 'Entre em Contato', icon: MessageSquare },
              { step: '2', title: 'Demonstração', icon: Users },
              { step: '3', title: 'Configuração', icon: Shield },
              { step: '4', title: 'Treinamento', icon: User },
              { step: '5', title: 'Suporte Contínuo', icon: Clock },
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                {index < 4 && <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#009688] to-[#4DB6AC]"></div>}
                <div className="relative z-10 w-16 h-16 mx-auto bg-gradient-to-br from-[#009688] to-[#4DB6AC] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">{item.step}</div>
                <div className="mb-2"><item.icon className="w-6 h-6 mx-auto text-[#009688]" /></div>
                <h3 className="font-semibold text-[#2C3E50]">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">Solicitar Demonstração</h2>
            <p className="text-xl text-[#7F8C8D]">Preencha o formulário e nossa equipe entrará em contato</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-[#009688]/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#009688] to-[#4DB6AC] rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#2C3E50]">Dados da Sua Clínica</h3>
                  <p className="text-sm text-[#7F8C8D]">Todos os campos são obrigatórios</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-700">Interesse registrado com sucesso!</p>
                    <p className="text-sm text-green-600">Nossa equipe entrará em contato em breve.</p>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-2">Nome da Clínica *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7F8C8D]" />
                  <input type="text" value={formData.nome_clinica} onChange={(e) => setFormData({ ...formData, nome_clinica: e.target.value })} placeholder="Ex: Fisio Saúde" required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-2">Nome do Responsável *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7F8C8D]" />
                  <input type="text" value={formData.nome_responsavel} onChange={(e) => setFormData({ ...formData, nome_responsavel: e.target.value })} placeholder="Ex: Dr. João Silva" required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C3E50] mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7F8C8D]" />
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="contato@clinica.com.br" required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C3E50] mb-2">Telefone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7F8C8D]" />
                    <input type="tel" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} placeholder="(81) 99999-9999" required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent transition-all" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-2">Número de Fisioterapeutas *</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7F8C8D]" />
                  <input type="number" value={formData.num_fisioterapeutas} onChange={(e) => setFormData({ ...formData, num_fisioterapeutas: e.target.value })} placeholder="Ex: 5" min="1" required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-2">Mensagem (Opcional)</label>
                <textarea value={formData.mensagem} onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })} placeholder="Conte-nos mais sobre sua clínica e necessidades..." rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent transition-all resize-none" />
              </div>
              <button type="submit" disabled={loading || success} className="w-full px-6 py-4 bg-gradient-to-r from-[#009688] to-[#4DB6AC] text-white font-semibold rounded-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Enviando...</>) : success ? (<><CheckCircle2 className="w-5 h-5" />Enviado!</>) : (<>Solicitar Demonstração<ArrowRight className="w-5 h-5" /></>)}
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="bg-[#2C3E50] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#009688] to-[#4DB6AC] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">PhysioCapture</span>
              </div>
              <p className="text-gray-400">Sistema profissional de gestão para clínicas de fisioterapia</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Funcionalidades</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Digitalização OCR</li>
                <li>Prontuários Eletrônicos</li>
                <li>Assistente IA</li>
                <li>Gestão de Pacientes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sobre</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Sobre a Core Hive</li>
                <li>Política de Privacidade</li>
                <li>Termos de Uso</li>
                <li>Segurança</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" />contato@corehive.com.br</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" />(81) 99999-9999</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 PhysioCapture  Desenvolvido com <span className="text-[#009688]"></span> por <span className="font-semibold text-white">Core Hive</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}

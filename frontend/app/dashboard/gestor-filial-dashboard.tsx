'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRoutes } from "@/lib/api";
import { argonTheme } from "@/lib/argon-theme";
import { ArgonStatsCard, ArgonInfoCard } from "@/components/Argon/ArgonCard";
import {
    Users,
    UserCheck,
    Activity,
    Calendar,
    FileText,
    ArrowRightLeft,
    TrendingUp,
    Clock,
    Building2,
    Sparkles,
    UserPlus,
    Phone,
    Mail,
    Sun,
    Sunset,
    Moon
} from 'lucide-react';

interface GestorFilialDashboardProps {
    currentUser: any;
}

interface Fisioterapeuta {
    id: number;
    nome: string;
    email: string;
    phone: string;
    especialidade: string;
    crefito: string;
    pacientes: number;
    sessoes_mes: number;
}

interface Atendente {
    id: number;
    nome: string;
    email: string;
    phone: string;
}

interface Transferencia {
    id: number;
    paciente: string;
    de_fisio: string;
    para_fisio: string;
    de_filial: string;
    para_filial: string;
    data: string;
    motivo: string;
    tipo: 'entrada' | 'saida';
    inter_filial: boolean;
}

interface Paciente {
    id: number;
    nome: string;
    fisioterapeuta: string;
    sessoes: number;
}

interface FilialInfo {
    id: number;
    nome: string;
    cidade: string;
}

export default function GestorFilialDashboard({ currentUser }: GestorFilialDashboardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        filial: { id: 0, nome: '', cidade: '' } as FilialInfo,
        totalPacientes: 0,
        totalFisioterapeutas: 0,
        totalAtendentes: 0,
        novosPacientesMes: 0,
        sessoesMes: 0,
        sessoesHoje: 0,
        totalDocumentos: 0,
        totalTransferenciasMes: 0,
        equipeFisioterapeutas: [] as Fisioterapeuta[],
        equipeAtendentes: [] as Atendente[],
        transferenciasRecentes: [] as Transferencia[],
        topPacientes: [] as Paciente[],
        distribuicaoSessoes: { manha: 0, tarde: 0, noite: 0 }
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await apiRoutes.statistics.gestorFilial();
            setStats(response.data);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
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
                        Carregando dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ background: argonTheme.gradients.primary }}
                    >
                        <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
                            {stats.filial.nome || 'Minha Filial'}
                        </h1>
                        <p className="text-lg" style={{ color: argonTheme.colors.text.secondary }}>
                            Olá, {currentUser?.first_name}! • {stats.filial.cidade}
                        </p>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium" style={{ color: argonTheme.colors.text.secondary }}>
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ArgonStatsCard
                    title="Pacientes da Filial"
                    value={stats.totalPacientes}
                    icon={<Users className="w-7 h-7" />}
                    iconGradient="primary"
                    trend={{ value: stats.novosPacientesMes, label: "novos este mês", isPositive: true }}
                />
                <ArgonStatsCard
                    title="Fisioterapeutas"
                    value={stats.totalFisioterapeutas}
                    icon={<UserCheck className="w-7 h-7" />}
                    iconGradient="success"
                />
                <ArgonStatsCard
                    title="Atendentes"
                    value={stats.totalAtendentes}
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

            {/* Segunda linha de cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ArgonStatsCard
                    title="Documentos"
                    value={stats.totalDocumentos}
                    icon={<FileText className="w-7 h-7" />}
                    iconGradient="primary"
                />
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Equipe de Fisioterapeutas */}
                <ArgonInfoCard
                    title="Equipe de Fisioterapeutas"
                    subtitle={`${stats.equipeFisioterapeutas.length} profissionais ativos`}
                    icon={<UserCheck className="w-5 h-5" />}
                    iconGradient="primary"
                >
                    {stats.equipeFisioterapeutas.length > 0 ? (
                        <div className="space-y-3">
                            {stats.equipeFisioterapeutas.map((fisio, idx) => (
                                <div
                                    key={fisio.id}
                                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
                                    style={{ backgroundColor: idx === 0 ? `${argonTheme.colors.primary.main}10` : 'transparent' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                            style={{ background: argonTheme.gradients.primary }}
                                        >
                                            {fisio.nome?.charAt(0) || 'F'}
                                        </div>
                                        <div>
                                            <p className="font-semibold" style={{ color: argonTheme.colors.text.primary }}>
                                                {fisio.nome}
                                            </p>
                                            <p className="text-sm" style={{ color: argonTheme.colors.text.secondary }}>
                                                {fisio.especialidade}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-center">
                                        <div>
                                            <p className="font-bold" style={{ color: argonTheme.colors.primary.main }}>
                                                {fisio.pacientes}
                                            </p>
                                            <p className="text-xs text-gray-500">Pacientes</p>
                                        </div>
                                        <div>
                                            <p className="font-bold" style={{ color: argonTheme.colors.success.main }}>
                                                {fisio.sessoes_mes}
                                            </p>
                                            <p className="text-xs text-gray-500">Sessões</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>Nenhum fisioterapeuta na equipe</p>
                        </div>
                    )}
                </ArgonInfoCard>

                {/* Transferências Recentes */}
                <ArgonInfoCard
                    title="Transferências Recentes"
                    subtitle="Movimentações de pacientes"
                    icon={<ArrowRightLeft className="w-5 h-5" />}
                    iconGradient="warning"
                >
                    {stats.transferenciasRecentes.length > 0 ? (
                        <div className="space-y-3">
                            {stats.transferenciasRecentes.map(t => (
                                <div
                                    key={t.id}
                                    className={`p-3 rounded-xl border-l-4 ${t.tipo === 'entrada'
                                        ? 'bg-green-50 border-green-400'
                                        : 'bg-orange-50 border-orange-400'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold" style={{ color: argonTheme.colors.text.primary }}>
                                                {t.paciente}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-sm">
                                                <span style={{ color: argonTheme.colors.text.secondary }}>
                                                    {t.de_fisio}
                                                </span>
                                                <ArrowRightLeft className="w-3 h-3 text-gray-400" />
                                                <span style={{ color: argonTheme.colors.primary.main }} className="font-medium">
                                                    {t.para_fisio}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${t.tipo === 'entrada'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {t.tipo === 'entrada' ? '⬇ Entrada' : '⬆ Saída'}
                                            </span>
                                            <p className="text-xs mt-1" style={{ color: argonTheme.colors.text.secondary }}>
                                                {t.data}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <ArrowRightLeft className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>Nenhuma transferência recente</p>
                        </div>
                    )}
                </ArgonInfoCard>
            </div>

            {/* Distribuição de Sessões por Horário */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ArgonInfoCard
                    title="Distribuição de Atendimentos"
                    subtitle="Últimos 7 dias por período"
                    icon={<Clock className="w-5 h-5" />}
                    iconGradient="info"
                >
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 rounded-xl bg-yellow-50">
                            <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                            <p className="text-3xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
                                {stats.distribuicaoSessoes.manha}
                            </p>
                            <p className="text-sm text-gray-500">Manhã</p>
                            <p className="text-xs text-gray-400">06h - 12h</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-orange-50">
                            <Sunset className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                            <p className="text-3xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
                                {stats.distribuicaoSessoes.tarde}
                            </p>
                            <p className="text-sm text-gray-500">Tarde</p>
                            <p className="text-xs text-gray-400">12h - 18h</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-indigo-50">
                            <Moon className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
                            <p className="text-3xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
                                {stats.distribuicaoSessoes.noite}
                            </p>
                            <p className="text-sm text-gray-500">Noite</p>
                            <p className="text-xs text-gray-400">18h - 22h</p>
                        </div>
                    </div>
                </ArgonInfoCard>

                {/* Ações Rápidas */}
                <ArgonInfoCard
                    title="Ações Rápidas"
                    subtitle="Gestão da filial"
                    icon={<TrendingUp className="w-5 h-5" />}
                    iconGradient="success"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => router.push('/patients')}
                            className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow text-left"
                        >
                            <Users className="w-6 h-6 mb-2" style={{ color: argonTheme.colors.primary.main }} />
                            <p className="font-semibold text-sm" style={{ color: argonTheme.colors.text.primary }}>
                                Ver Pacientes
                            </p>
                            <p className="text-xs text-gray-500">Banco da filial</p>
                        </button>
                        <button
                            onClick={() => router.push('/patients/transferencias')}
                            className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow text-left"
                        >
                            <ArrowRightLeft className="w-6 h-6 mb-2" style={{ color: argonTheme.colors.warning.main }} />
                            <p className="font-semibold text-sm" style={{ color: argonTheme.colors.text.primary }}>
                                Transferências
                            </p>
                            <p className="text-xs text-gray-500">Mover pacientes</p>
                        </button>
                        <button
                            onClick={() => router.push('/documents/digitize')}
                            className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow text-left"
                        >
                            <FileText className="w-6 h-6 mb-2" style={{ color: argonTheme.colors.info.main }} />
                            <p className="font-semibold text-sm" style={{ color: argonTheme.colors.text.primary }}>
                                Digitalizar
                            </p>
                            <p className="text-xs text-gray-500">Novo documento</p>
                        </button>
                        <button
                            onClick={() => router.push('/equipe')}
                            className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow text-left"
                        >
                            <UserPlus className="w-6 h-6 mb-2" style={{ color: argonTheme.colors.success.main }} />
                            <p className="font-semibold text-sm" style={{ color: argonTheme.colors.text.primary }}>
                                Gerenciar Equipe
                            </p>
                            <p className="text-xs text-gray-500">Fisios e Atendentes</p>
                        </button>
                    </div>
                </ArgonInfoCard>
            </div>

            {/* Equipe de Atendentes */}
            <ArgonInfoCard
                title="Equipe de Atendentes"
                subtitle={`${stats.equipeAtendentes.length} atendente(s) ativos`}
                icon={<UserPlus className="w-5 h-5" />}
                iconGradient="info"
            >
                {stats.equipeAtendentes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {stats.equipeAtendentes.map(atendente => (
                            <div
                                key={atendente.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                    style={{ background: argonTheme.gradients.info }}
                                >
                                    {atendente.nome?.charAt(0) || 'A'}
                                </div>
                                <div>
                                    <p className="font-medium text-sm" style={{ color: argonTheme.colors.text.primary }}>
                                        {atendente.nome}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Phone className="w-3 h-3" />
                                        {atendente.phone || 'Sem telefone'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>Nenhum atendente na equipe</p>
                    </div>
                )}
            </ArgonInfoCard>
        </div>
    );
}

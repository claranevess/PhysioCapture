'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, apiRoutes } from "@/lib/api";
import ArgonLayout from "@/components/Argon/ArgonLayout";
import { ArgonStatsCard, ArgonInfoCard } from "@/components/Argon/ArgonCard";
import { argonTheme } from "@/lib/argon-theme";
import {
    Building2,
    Users,
    UserCheck,
    Activity,
    Calendar,
    ArrowLeft,
    Sparkles,
    MapPin,
    Phone,
    Mail
} from 'lucide-react';

interface Fisioterapeuta {
    id: number;
    nome: string;
    especialidade: string;
    pacientes: number;
    sessoes: number;
}

interface FilialStats {
    id: number;
    nome: string;
    cidade: string;
    cor: string;
    totalPacientes: number;
    novosPacientes: number;
    fisioterapeutas: number;
    sessoesRealizadas: number;
    documentos: number;
}

export default function FilialDetailPage() {
    const router = useRouter();
    const params = useParams();
    const filialId = params.id;

    const [filial, setFilial] = useState<FilialStats | null>(null);
    const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (filialId) {
            loadFilialData();
        }
    }, [filialId]);

    const loadFilialData = async () => {
        try {
            // Buscar dados do dashboard do gestor que inclui filiaisStats
            const response = await apiRoutes.statistics.gestor();
            const filiaisStats = response.data.filiaisStats || [];

            // Encontrar a filial específica
            const filialData = filiaisStats.find((f: FilialStats) => f.id === Number(filialId));
            if (filialData) {
                setFilial(filialData);
            }

            // Buscar fisioterapeutas da filial
            const fisiosPorFilial = response.data.fisioterapeutasPorFilial || [];
            const filialGroup = fisiosPorFilial.find((g: any) => g.filial_id === Number(filialId));
            if (filialGroup) {
                setFisioterapeutas(filialGroup.fisioterapeutas || []);
            }
        } catch (error) {
            console.error('Erro ao carregar dados da filial:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ArgonLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div
                            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 animate-pulse"
                            style={{ background: argonTheme.gradients.primary }}
                        >
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <p className="font-medium" style={{ color: argonTheme.colors.text.primary }}>
                            Carregando dados da filial...
                        </p>
                    </div>
                </div>
            </ArgonLayout>
        );
    }

    if (!filial) {
        return (
            <ArgonLayout>
                <div className="text-center py-12">
                    <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h2 className="text-2xl font-bold text-gray-600">Filial não encontrada</h2>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="mt-4 text-teal-600 hover:text-teal-800 font-medium"
                    >
                        ← Voltar ao Dashboard
                    </button>
                </div>
            </ArgonLayout>
        );
    }

    return (
        <ArgonLayout>
            <div className="space-y-6">
                {/* Header com Voltar */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Voltar ao Dashboard
                </button>

                {/* Informações da Filial */}
                <div
                    className="bg-white rounded-2xl p-8 shadow-lg border-l-4"
                    style={{ borderLeftColor: filial.cor }}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center"
                                style={{ background: filial.cor }}
                            >
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
                                    {filial.nome}
                                </h1>
                                <p className="text-lg flex items-center gap-1 mt-1" style={{ color: argonTheme.colors.text.secondary }}>
                                    <MapPin className="w-4 h-4" /> {filial.cidade}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ArgonStatsCard
                        title="Total de Pacientes"
                        value={filial.totalPacientes}
                        icon={<Users className="w-7 h-7" />}
                        iconGradient="primary"
                    />
                    <ArgonStatsCard
                        title="Fisioterapeutas"
                        value={filial.fisioterapeutas}
                        icon={<UserCheck className="w-7 h-7" />}
                        iconGradient="success"
                    />
                    <ArgonStatsCard
                        title="Novos Pacientes (Mês)"
                        value={filial.novosPacientes}
                        icon={<Users className="w-7 h-7" />}
                        iconGradient="info"
                    />
                    <ArgonStatsCard
                        title="Sessões Realizadas"
                        value={filial.sessoesRealizadas}
                        icon={<Activity className="w-7 h-7" />}
                        iconGradient="warning"
                    />
                </div>

                {/* Equipe da Filial */}
                <ArgonInfoCard
                    title="Equipe da Filial"
                    subtitle={`${fisioterapeutas.length} fisioterapeuta(s) ativos`}
                    icon={<UserCheck className="w-5 h-5" />}
                    iconGradient="primary"
                >
                    {fisioterapeutas.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-500">Fisioterapeuta</th>
                                        <th className="text-center py-3 px-4 font-semibold text-sm text-gray-500">Especialidade</th>
                                        <th className="text-center py-3 px-4 font-semibold text-sm text-gray-500">Pacientes</th>
                                        <th className="text-center py-3 px-4 font-semibold text-sm text-gray-500">Sessões (30 dias)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fisioterapeutas.map((fisio) => (
                                        <tr key={fisio.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                                        style={{ background: filial.cor }}
                                                    >
                                                        {fisio.nome?.charAt(0) || 'F'}
                                                    </div>
                                                    <span className="font-medium" style={{ color: argonTheme.colors.text.primary }}>
                                                        {fisio.nome}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center text-sm" style={{ color: argonTheme.colors.text.secondary }}>
                                                {fisio.especialidade}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="font-bold text-lg" style={{ color: argonTheme.colors.primary.main }}>
                                                    {fisio.pacientes}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="font-bold text-lg" style={{ color: argonTheme.colors.success.main }}>
                                                    {fisio.sessoes}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>Nenhum fisioterapeuta cadastrado nesta filial</p>
                        </div>
                    )}
                </ArgonInfoCard>

                {/* Ações Rápidas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                        onClick={() => router.push('/patients')}
                        className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center gap-3 border border-gray-100"
                    >
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: argonTheme.gradients.primary }}
                        >
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium" style={{ color: argonTheme.colors.text.primary }}>
                            Ver Pacientes
                        </span>
                    </button>

                    <button
                        onClick={() => router.push('/patients/transferencias')}
                        className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center gap-3 border border-gray-100"
                    >
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: argonTheme.gradients.warning }}
                        >
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium" style={{ color: argonTheme.colors.text.primary }}>
                            Transferir Paciente
                        </span>
                    </button>

                    <button
                        onClick={() => router.push('/agenda')}
                        className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center gap-3 border border-gray-100"
                    >
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: argonTheme.gradients.success }}
                        >
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium" style={{ color: argonTheme.colors.text.primary }}>
                            Ver Agenda
                        </span>
                    </button>
                </div>
            </div>
        </ArgonLayout>
    );
}

'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, apiRoutes } from "@/lib/api";
import ArgonLayout from "@/components/Argon/ArgonLayout";
import { ArgonStatsCard, ArgonInfoCard } from "@/components/Argon/ArgonCard";
import { argonTheme } from "@/lib/argon-theme";
import {
    ArrowRightLeft,
    Users,
    Building2,
    Clock,
    Search,
    X,
    Sparkles
} from 'lucide-react';

interface Transferencia {
    id: number;
    paciente: string;
    paciente_id: number;
    de_fisio: string;
    para_fisio: string;
    de_filial: string;
    para_filial: string;
    data: string;
    motivo: string;
    inter_filial: boolean;
}

interface Patient {
    id: number;
    full_name: string;
    filial_nome: string;
    fisioterapeuta_name: string;
}

interface Fisioterapeuta {
    id: number;
    full_name: string;
    filial_nome: string;
}

export default function TransferenciasPage() {
    const router = useRouter();
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);

    // Modal de transferência
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
    const [selectedFisio, setSelectedFisio] = useState<number | null>(null);
    const [transferReason, setTransferReason] = useState('');
    const [transferLoading, setTransferLoading] = useState(false);
    const [searchPatient, setSearchPatient] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await apiRoutes.statistics.gestor();
            setStats(response.data);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTransferData = async () => {
        try {
            const [patientsRes, fisiosRes] = await Promise.all([
                api.get('/api/prontuario/patients/'),
                api.get('/api/auth/fisioterapeutas/')
            ]);
            // Handle paginated or wrapped responses
            const patientsData = Array.isArray(patientsRes.data) ? patientsRes.data : (patientsRes.data?.results || []);
            const fisiosData = Array.isArray(fisiosRes.data) ? fisiosRes.data : (fisiosRes.data?.results || []);
            setPatients(patientsData);
            setFisioterapeutas(fisiosData);
        } catch (error) {
            console.error('Erro ao carregar dados para transferência:', error);
        }
    };

    const openTransferModal = () => {
        loadTransferData();
        setShowTransferModal(true);
    };

    const handleTransfer = async () => {
        if (!selectedPatient || !selectedFisio) {
            alert('Selecione o paciente e o fisioterapeuta de destino');
            return;
        }

        setTransferLoading(true);
        try {
            await apiRoutes.patients.transfer(selectedPatient, {
                to_fisioterapeuta_id: selectedFisio,
                reason: transferReason
            });

            alert('Paciente transferido com sucesso!');
            setShowTransferModal(false);
            setSelectedPatient(null);
            setSelectedFisio(null);
            setTransferReason('');
            loadData(); // Recarrega dados
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao transferir paciente');
        } finally {
            setTransferLoading(false);
        }
    };

    const filteredPatients = Array.isArray(patients)
        ? patients.filter(p => p.full_name?.toLowerCase().includes(searchPatient.toLowerCase()))
        : [];

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
                            Carregando...
                        </p>
                    </div>
                </div>
            </ArgonLayout>
        );
    }

    return (
        <ArgonLayout>
            {/* Modal de Transferência */}
            {showTransferModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: argonTheme.gradients.primary }}
                                >
                                    <ArrowRightLeft className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
                                    Nova Transferência
                                </h2>
                            </div>
                            <button onClick={() => setShowTransferModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Seleção de Paciente */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: argonTheme.colors.text.primary }}>
                                    1. Selecione o Paciente
                                </label>
                                <div className="relative mb-2">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar paciente..."
                                        value={searchPatient}
                                        onChange={(e) => setSearchPatient(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                                    {filteredPatients.map(patient => (
                                        <div
                                            key={patient.id}
                                            onClick={() => setSelectedPatient(patient.id)}
                                            className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${selectedPatient === patient.id ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''
                                                }`}
                                        >
                                            <p className="font-medium" style={{ color: argonTheme.colors.text.primary }}>
                                                {patient.full_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {patient.filial_nome} • Fisio: {patient.fisioterapeuta_name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Seleção de Fisioterapeuta */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: argonTheme.colors.text.primary }}>
                                    2. Fisioterapeuta de Destino
                                </label>
                                <select
                                    value={selectedFisio || ''}
                                    onChange={(e) => setSelectedFisio(Number(e.target.value))}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                >
                                    <option value="">Selecione o fisioterapeuta...</option>
                                    {fisioterapeutas.map(fisio => (
                                        <option key={fisio.id} value={fisio.id}>
                                            {fisio.full_name} - {fisio.filial_nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Motivo */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: argonTheme.colors.text.primary }}>
                                    3. Motivo da Transferência
                                </label>
                                <textarea
                                    value={transferReason}
                                    onChange={(e) => setTransferReason(e.target.value)}
                                    placeholder="Ex: Paciente mudou de endereço, mudança de horário..."
                                    rows={3}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => setShowTransferModal(false)}
                                className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleTransfer}
                                disabled={transferLoading || !selectedPatient || !selectedFisio}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold text-white disabled:opacity-50"
                                style={{ background: argonTheme.gradients.primary }}
                            >
                                {transferLoading ? 'Transferindo...' : 'Confirmar Transferência'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: argonTheme.gradients.primary }}
                        >
                            <ArrowRightLeft className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
                                Transferências
                            </h1>
                            <p className="text-lg" style={{ color: argonTheme.colors.text.secondary }}>
                                Gestão de transferências de pacientes
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={openTransferModal}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
                        style={{ background: argonTheme.gradients.primary }}
                    >
                        <ArrowRightLeft className="w-5 h-5" />
                        Nova Transferência
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <ArgonStatsCard
                        title="Transferências no Mês"
                        value={stats.totalTransferenciasMes || 0}
                        icon={<ArrowRightLeft className="w-7 h-7" />}
                        iconGradient="primary"
                    />
                    <ArgonStatsCard
                        title="Pacientes Disponíveis"
                        value={stats.pacientesDisponiveisTransferencia || 0}
                        icon={<Users className="w-7 h-7" />}
                        iconGradient="success"
                    />
                    <ArgonStatsCard
                        title="Total de Filiais"
                        value={stats.totalFiliais || 0}
                        icon={<Building2 className="w-7 h-7" />}
                        iconGradient="info"
                    />
                </div>

                {/* Histórico */}
                <ArgonInfoCard
                    title="Transferências Recentes"
                    subtitle="Últimas movimentações de pacientes"
                    icon={<Clock className="w-5 h-5" />}
                    iconGradient="warning"
                >
                    {stats.transferenciasRecentes?.length > 0 ? (
                        <div className="space-y-3">
                            {stats.transferenciasRecentes.map((t: Transferencia) => (
                                <div
                                    key={t.id}
                                    className={`p-4 rounded-xl border-l-4 ${t.inter_filial
                                        ? 'bg-orange-50 border-orange-400'
                                        : 'bg-blue-50 border-blue-400'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-semibold text-lg" style={{ color: argonTheme.colors.text.primary }}>
                                                {t.paciente}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 text-sm">
                                                <span style={{ color: argonTheme.colors.text.secondary }}>
                                                    {t.de_fisio} ({t.de_filial})
                                                </span>
                                                <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                                                <span style={{ color: argonTheme.colors.primary.main }} className="font-medium">
                                                    {t.para_fisio} ({t.para_filial})
                                                </span>
                                            </div>
                                            {t.motivo && t.motivo !== 'Não informado' && (
                                                <p className="text-sm text-gray-500 mt-1">Motivo: {t.motivo}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${t.inter_filial
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}
                                            >
                                                {t.inter_filial ? 'Inter-filial' : 'Intra-filial'}
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
                        <div className="text-center py-12 text-gray-400">
                            <ArrowRightLeft className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">Nenhuma transferência registrada</p>
                            <p className="text-sm">As transferências de pacientes aparecerão aqui</p>
                        </div>
                    )}
                </ArgonInfoCard>
            </div>
        </ArgonLayout>
    );
}

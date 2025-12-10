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
    Sparkles,
    Send,
    CheckCircle,
    XCircle,
    AlertCircle,
    Inbox
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

interface TransferRequest {
    id: number;
    patient: number;
    patient_name: string;
    requested_by: number;
    requested_by_name: string;
    from_filial: number;
    from_filial_name: string;
    to_fisioterapeuta: number;
    to_fisioterapeuta_name: string;
    to_filial: number;
    to_filial_name: string;
    reason: string;
    status: string;
    status_display: string;
    response_note: string | null;
    reviewed_by: number | null;
    reviewed_by_name: string | null;
    created_at: string;
    reviewed_at: string | null;
    is_inter_filial: boolean;
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
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Solicitações de transferência
    const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'historico' | 'solicitacoes'>('solicitacoes');

    // Modal de transferência
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
    const [selectedFisio, setSelectedFisio] = useState<number | null>(null);
    const [transferReason, setTransferReason] = useState('');
    const [transferLoading, setTransferLoading] = useState(false);
    const [searchPatient, setSearchPatient] = useState('');

    // Modal de nova solicitação (para fisioterapeutas)
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false);

    // Modal de resposta (aprovar/rejeitar)
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<TransferRequest | null>(null);
    const [responseAction, setResponseAction] = useState<'approve' | 'reject'>('approve');
    const [responseNote, setResponseNote] = useState('');
    const [responseLoading, setResponseLoading] = useState(false);

    useEffect(() => {
        // Carregar usuário atual
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setCurrentUser(user);
            } catch (e) {}
        }
        loadData();
    }, []);

    useEffect(() => {
        if (activeTab === 'solicitacoes') {
            loadTransferRequests();
        }
    }, [activeTab]);

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

    const loadTransferRequests = async () => {
        setRequestsLoading(true);
        try {
            const response = await apiRoutes.transferRequests.list();
            const data = Array.isArray(response.data) ? response.data : [];
            setTransferRequests(data);
        } catch (error) {
            console.error('Erro ao carregar solicitações:', error);
        } finally {
            setRequestsLoading(false);
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

    // Criar solicitação de transferência
    const handleCreateRequest = async () => {
        if (!selectedPatient || !selectedFisio || !transferReason.trim()) {
            alert('Preencha todos os campos');
            return;
        }

        setRequestLoading(true);
        try {
            await apiRoutes.transferRequests.create({
                patient_id: selectedPatient,
                to_fisioterapeuta_id: selectedFisio,
                reason: transferReason
            });

            alert('Solicitação criada com sucesso! Aguarde a aprovação do gestor.');
            setShowRequestModal(false);
            setSelectedPatient(null);
            setSelectedFisio(null);
            setTransferReason('');
            loadTransferRequests();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao criar solicitação');
        } finally {
            setRequestLoading(false);
        }
    };

    // Aprovar/Rejeitar solicitação
    const handleResponse = async () => {
        if (!selectedRequest) return;

        if (responseAction === 'reject' && !responseNote.trim()) {
            alert('Informe o motivo da rejeição');
            return;
        }

        setResponseLoading(true);
        try {
            if (responseAction === 'approve') {
                await apiRoutes.transferRequests.approve(selectedRequest.id, responseNote);
                alert('Solicitação aprovada! Paciente transferido com sucesso.');
            } else {
                await apiRoutes.transferRequests.reject(selectedRequest.id, responseNote);
                alert('Solicitação rejeitada.');
            }

            setShowResponseModal(false);
            setSelectedRequest(null);
            setResponseNote('');
            loadTransferRequests();
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao processar solicitação');
        } finally {
            setResponseLoading(false);
        }
    };

    // Cancelar solicitação
    const handleCancelRequest = async (request: TransferRequest) => {
        if (!confirm('Tem certeza que deseja cancelar esta solicitação?')) return;

        try {
            await apiRoutes.transferRequests.cancel(request.id);
            alert('Solicitação cancelada.');
            loadTransferRequests();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao cancelar solicitação');
        }
    };

    const openResponseModal = (request: TransferRequest, action: 'approve' | 'reject') => {
        setSelectedRequest(request);
        setResponseAction(action);
        setResponseNote('');
        setShowResponseModal(true);
    };

    const openRequestModal = () => {
        loadTransferData();
        setShowRequestModal(true);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDENTE':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            case 'APROVADA':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'REJEITADA':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'CANCELADA':
                return <X className="w-4 h-4 text-gray-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDENTE':
                return 'bg-yellow-100 text-yellow-700';
            case 'APROVADA':
                return 'bg-green-100 text-green-700';
            case 'REJEITADA':
                return 'bg-red-100 text-red-700';
            case 'CANCELADA':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const pendingRequests = transferRequests.filter(r => r.status === 'PENDENTE');
    const isGestor = currentUser?.user_type === 'GESTOR_FILIAL' || currentUser?.user_type === 'GESTOR_GERAL';
    const isFisioterapeuta = currentUser?.user_type === 'FISIOTERAPEUTA';

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

            {/* Modal de Nova Solicitação (para Fisioterapeutas) */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: argonTheme.gradients.warning }}
                                >
                                    <Send className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
                                    Solicitar Transferência
                                </h2>
                            </div>
                            <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-yellow-700">
                                    <strong>Atenção:</strong> Sua solicitação será enviada para aprovação do gestor da filial.
                                    O paciente só será transferido após a aprovação.
                                </p>
                            </div>

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
                                    3. Motivo da Transferência *
                                </label>
                                <textarea
                                    value={transferReason}
                                    onChange={(e) => setTransferReason(e.target.value)}
                                    placeholder="Ex: Paciente mudou de endereço, mudança de horário, especialização necessária..."
                                    rows={3}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => setShowRequestModal(false)}
                                className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateRequest}
                                disabled={requestLoading || !selectedPatient || !selectedFisio || !transferReason.trim()}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold text-white disabled:opacity-50"
                                style={{ background: argonTheme.gradients.warning }}
                            >
                                {requestLoading ? 'Enviando...' : 'Enviar Solicitação'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Resposta (Aprovar/Rejeitar) */}
            {showResponseModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: responseAction === 'approve' ? argonTheme.gradients.success : argonTheme.gradients.error }}
                                >
                                    {responseAction === 'approve' ? (
                                        <CheckCircle className="w-5 h-5 text-white" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <h2 className="text-xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
                                    {responseAction === 'approve' ? 'Aprovar Solicitação' : 'Rejeitar Solicitação'}
                                </h2>
                            </div>
                            <button onClick={() => setShowResponseModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="font-semibold" style={{ color: argonTheme.colors.text.primary }}>
                                    {selectedRequest.patient_name}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    De: {selectedRequest.requested_by_name} ({selectedRequest.from_filial_name})
                                </p>
                                <p className="text-sm text-gray-500">
                                    Para: {selectedRequest.to_fisioterapeuta_name} ({selectedRequest.to_filial_name})
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    <strong>Motivo:</strong> {selectedRequest.reason}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: argonTheme.colors.text.primary }}>
                                    {responseAction === 'approve' ? 'Observação (opcional)' : 'Motivo da Rejeição *'}
                                </label>
                                <textarea
                                    value={responseNote}
                                    onChange={(e) => setResponseNote(e.target.value)}
                                    placeholder={responseAction === 'approve' ? 'Adicione uma observação...' : 'Informe o motivo da rejeição...'}
                                    rows={3}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    required={responseAction === 'reject'}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => setShowResponseModal(false)}
                                className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleResponse}
                                disabled={responseLoading || (responseAction === 'reject' && !responseNote.trim())}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold text-white disabled:opacity-50"
                                style={{ background: responseAction === 'approve' ? argonTheme.gradients.success : argonTheme.gradients.error }}
                            >
                                {responseLoading ? 'Processando...' : (responseAction === 'approve' ? 'Aprovar' : 'Rejeitar')}
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
                    <div className="flex gap-2">
                        {isFisioterapeuta && (
                            <button
                                onClick={openRequestModal}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
                                style={{ background: argonTheme.gradients.warning }}
                            >
                                <Send className="w-5 h-5" />
                                Solicitar Transferência
                            </button>
                        )}
                        {isGestor && (
                            <button
                                onClick={openTransferModal}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
                                style={{ background: argonTheme.gradients.primary }}
                            >
                                <ArrowRightLeft className="w-5 h-5" />
                                Nova Transferência
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    <ArgonStatsCard
                        title="Solicitações Pendentes"
                        value={pendingRequests.length}
                        icon={<Inbox className="w-7 h-7" />}
                        iconGradient="warning"
                    />
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

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('solicitacoes')}
                            className={`flex-1 py-4 px-6 text-sm font-semibold transition-colors ${activeTab === 'solicitacoes'
                                ? 'border-b-2 text-teal-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            style={activeTab === 'solicitacoes' ? { borderColor: argonTheme.colors.primary.main } : {}}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Inbox className="w-4 h-4" />
                                Solicitações
                                {pendingRequests.length > 0 && (
                                    <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {pendingRequests.length}
                                    </span>
                                )}
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('historico')}
                            className={`flex-1 py-4 px-6 text-sm font-semibold transition-colors ${activeTab === 'historico'
                                ? 'border-b-2 text-teal-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            style={activeTab === 'historico' ? { borderColor: argonTheme.colors.primary.main } : {}}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Clock className="w-4 h-4" />
                                Histórico
                            </div>
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Tab: Solicitações */}
                        {activeTab === 'solicitacoes' && (
                            <div>
                                {requestsLoading ? (
                                    <div className="text-center py-12">
                                        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-gray-500">Carregando solicitações...</p>
                                    </div>
                                ) : transferRequests.length > 0 ? (
                                    <div className="space-y-4">
                                        {transferRequests.map(request => (
                                            <div
                                                key={request.id}
                                                className={`p-4 rounded-xl border-l-4 ${request.status === 'PENDENTE'
                                                    ? 'bg-yellow-50 border-yellow-400'
                                                    : request.status === 'APROVADA'
                                                        ? 'bg-green-50 border-green-400'
                                                        : request.status === 'REJEITADA'
                                                            ? 'bg-red-50 border-red-400'
                                                            : 'bg-gray-50 border-gray-400'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {getStatusIcon(request.status)}
                                                            <p className="font-semibold text-lg" style={{ color: argonTheme.colors.text.primary }}>
                                                                {request.patient_name}
                                                            </p>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                                {request.status_display}
                                                            </span>
                                                            {request.is_inter_filial && (
                                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                                    Inter-filial
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2 text-sm">
                                                            <span style={{ color: argonTheme.colors.text.secondary }}>
                                                                {request.requested_by_name} ({request.from_filial_name})
                                                            </span>
                                                            <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                                                            <span style={{ color: argonTheme.colors.primary.main }} className="font-medium">
                                                                {request.to_fisioterapeuta_name} ({request.to_filial_name})
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            <strong>Motivo:</strong> {request.reason}
                                                        </p>
                                                        {request.response_note && (
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                <strong>Resposta:</strong> {request.response_note}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-400 mt-2">
                                                            Solicitado em: {new Date(request.created_at).toLocaleString('pt-BR')}
                                                            {request.reviewed_at && (
                                                                <> • Analisado em: {new Date(request.reviewed_at).toLocaleString('pt-BR')}</>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col gap-2 ml-4">
                                                        {request.status === 'PENDENTE' && isGestor && (
                                                            <>
                                                                <button
                                                                    onClick={() => openResponseModal(request, 'approve')}
                                                                    className="px-3 py-1.5 rounded-lg text-white text-sm font-medium"
                                                                    style={{ background: argonTheme.gradients.success }}
                                                                >
                                                                    Aprovar
                                                                </button>
                                                                <button
                                                                    onClick={() => openResponseModal(request, 'reject')}
                                                                    className="px-3 py-1.5 rounded-lg text-white text-sm font-medium"
                                                                    style={{ background: argonTheme.gradients.error }}
                                                                >
                                                                    Rejeitar
                                                                </button>
                                                            </>
                                                        )}
                                                        {request.status === 'PENDENTE' && request.requested_by === currentUser?.id && (
                                                            <button
                                                                onClick={() => handleCancelRequest(request)}
                                                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <Inbox className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                        <p className="text-lg font-medium">Nenhuma solicitação</p>
                                        <p className="text-sm">As solicitações de transferência aparecerão aqui</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Histórico */}
                        {activeTab === 'historico' && (
                            <div>
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
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ArgonLayout>
    );
}

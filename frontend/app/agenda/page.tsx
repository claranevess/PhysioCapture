'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArgonLayout from '@/components/Argon/ArgonLayout';
import { api } from '@/lib/api';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    User,
    CheckCircle,
    XCircle,
    X,
    Filter,
    RefreshCw,
    Save
} from 'lucide-react';

interface Session {
    id: number;
    patient: number;
    patient_name: string;
    patient_phone?: string;
    fisioterapeuta: number;
    fisioterapeuta_name: string;
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes: number;
    status: string;
    status_display: string;
    session_number?: number;
    is_today: boolean;
}

interface Patient {
    id: number;
    full_name: string;
    phone?: string;
}

interface Fisioterapeuta {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
}

export default function AgendaPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedFisio, setSelectedFisio] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [showNewSessionModal, setShowNewSessionModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state for new session
    const [newSession, setNewSession] = useState({
        patient: '',
        fisioterapeuta: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '09:00',
        duration_minutes: 50,
        notes: ''
    });

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/welcome');
            return;
        }
        setCurrentUser(JSON.parse(user));
    }, [router]);

    useEffect(() => {
        if (currentUser) {
            fetchSessions();
            fetchPatients();
            if (currentUser.user_type !== 'FISIOTERAPEUTA') {
                fetchFisioterapeutas();
            }
        }
    }, [currentUser, selectedDate, selectedFisio]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const dateStr = selectedDate.toISOString().split('T')[0];
            let url = `/api/prontuario/sessions/?date=${dateStr}`;
            if (selectedFisio) {
                url += `&fisioterapeuta=${selectedFisio}`;
            }
            const response = await api.get(url);
            setSessions(response.data.results || response.data);
        } catch (error) {
            console.error('Erro ao buscar sessões:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await api.get('/api/prontuario/patients/');
            setPatients(response.data.results || response.data);
        } catch (error) {
            console.error('Erro ao buscar pacientes:', error);
        }
    };

    const fetchFisioterapeutas = async () => {
        try {
            const response = await api.get('/api/auth/fisioterapeutas/');
            setFisioterapeutas(response.data);
        } catch (error) {
            console.error('Erro ao buscar fisioterapeutas:', error);
        }
    };

    const handleSessionAction = async (sessionId: number, action: string) => {
        try {
            await api.post(`/api/prontuario/sessions/${sessionId}/${action}/`);
            fetchSessions();
        } catch (error) {
            console.error('Erro na ação:', error);
        }
    };

    const handleCreateSession = async () => {
        if (!newSession.patient || !newSession.scheduled_date || !newSession.scheduled_time) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        try {
            setSaving(true);
            const sessionData: any = {
                patient: parseInt(newSession.patient),
                scheduled_date: newSession.scheduled_date,
                scheduled_time: newSession.scheduled_time,
                duration_minutes: newSession.duration_minutes,
            };

            // Se for fisioterapeuta, usa o próprio ID
            if (currentUser.user_type === 'FISIOTERAPEUTA') {
                sessionData.fisioterapeuta = currentUser.id;
            } else if (newSession.fisioterapeuta) {
                sessionData.fisioterapeuta = parseInt(newSession.fisioterapeuta);
            }

            await api.post('/api/prontuario/sessions/', sessionData);

            // Reset form and close modal
            setNewSession({
                patient: '',
                fisioterapeuta: '',
                scheduled_date: new Date().toISOString().split('T')[0],
                scheduled_time: '09:00',
                duration_minutes: 50,
                notes: ''
            });
            setShowNewSessionModal(false);

            // Atualizar para a data da nova sessão
            setSelectedDate(new Date(newSession.scheduled_date));
            fetchSessions();
        } catch (error: any) {
            console.error('Erro ao criar sessão:', error);
            alert(error.response?.data?.error || 'Erro ao agendar sessão');
        } finally {
            setSaving(false);
        }
    };

    const navigateDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AGENDADA': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'CONFIRMADA': return 'bg-green-100 text-green-800 border-green-200';
            case 'EM_ANDAMENTO': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'REALIZADA': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'CANCELADA': return 'bg-red-100 text-red-800 border-red-200';
            case 'FALTA': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'REALIZADA': return <CheckCircle className="w-4 h-4" />;
            case 'CANCELADA': case 'FALTA': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        };
        return date.toLocaleDateString('pt-BR', options);
    };

    const isToday = selectedDate.toDateString() === new Date().toDateString();

    // Gerar horários do dia (7h às 20h)
    const timeSlots = Array.from({ length: 14 }, (_, i) => {
        const hour = i + 7;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    // Agrupar sessões por horário
    const sessionsByTime: { [key: string]: Session[] } = {};
    sessions.forEach(session => {
        const timeKey = session.scheduled_time.slice(0, 5);
        if (!sessionsByTime[timeKey]) {
            sessionsByTime[timeKey] = [];
        }
        sessionsByTime[timeKey].push(session);
    });

    if (!currentUser) {
        return (
            <ArgonLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <p className="font-medium">Carregando...</p>
                </div>
            </ArgonLayout>
        );
    }

    return (
        <ArgonLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-black flex items-center gap-2">
                            <Calendar className="w-7 h-7 text-teal-500" />
                            Agenda
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Gerencie os agendamentos de sessões
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchSessions}
                            className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                            title="Atualizar"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowNewSessionModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            Agendar Consulta
                        </button>
                    </div>
                </div>

                {/* Date Navigation & Filters */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Date Navigation */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigateDate(-1)}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="text-center min-w-[280px]">
                                <p className={`text-lg font-semibold ${isToday ? 'text-teal-600' : 'text-slate-900'}`}>
                                    {isToday && <span className="text-sm font-normal mr-2">Hoje -</span>}
                                    {formatDate(selectedDate)}
                                </p>
                            </div>
                            <button
                                onClick={() => navigateDate(1)}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            {!isToday && (
                                <button
                                    onClick={goToToday}
                                    className="px-3 py-1 text-sm text-teal-600 hover:bg-teal-50 rounded-lg"
                                >
                                    Hoje
                                </button>
                            )}
                        </div>

                        {/* Fisioterapeuta Filter (for Gestor/Atendente) */}
                        {currentUser.user_type !== 'FISIOTERAPEUTA' && (
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-slate-400" />
                                <select
                                    value={selectedFisio || ''}
                                    onChange={(e) => setSelectedFisio(e.target.value ? Number(e.target.value) : null)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm"
                                >
                                    <option value="">Todos os Fisioterapeutas</option>
                                    {fisioterapeutas.map(fisio => (
                                        <option key={fisio.id} value={fisio.id}>
                                            {fisio.first_name} {fisio.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sessions Grid */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500">
                            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin" />
                            <p>Carregando agenda...</p>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">Nenhuma consulta agendada</p>
                            <button
                                onClick={() => setShowNewSessionModal(true)}
                                className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                            >
                                Agendar Primeira Consulta
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                            {timeSlots.map(time => {
                                const sessionsAtTime = sessionsByTime[time] || [];
                                if (sessionsAtTime.length === 0) return null;

                                return (
                                    <div key={time} className="flex">
                                        {/* Time Column */}
                                        <div className="w-20 flex-shrink-0 p-4 bg-slate-50 dark:bg-slate-700/50 border-r border-slate-200 dark:border-slate-700">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                {time}
                                            </span>
                                        </div>

                                        {/* Sessions */}
                                        <div className="flex-1 p-3 space-y-2">
                                            {sessionsAtTime.map(session => (
                                                <div
                                                    key={session.id}
                                                    className={`p-4 rounded-lg border ${getStatusColor(session.status)} flex items-center justify-between`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(session.status)}
                                                            <span className="text-xs font-medium">
                                                                {session.status_display}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">
                                                                {session.patient_name}
                                                                {session.session_number && (
                                                                    <span className="text-xs ml-2 opacity-70">
                                                                        (Sessão #{session.session_number})
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-sm opacity-75">
                                                                Dr(a). {session.fisioterapeuta_name} • {session.duration_minutes}min
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2">
                                                        {session.status === 'AGENDADA' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleSessionAction(session.id, 'confirm')}
                                                                    className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                                                >
                                                                    Confirmar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSessionAction(session.id, 'cancel')}
                                                                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </>
                                                        )}
                                                        {session.status === 'CONFIRMADA' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleSessionAction(session.id, 'complete')}
                                                                    className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                                >
                                                                    Finalizar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSessionAction(session.id, 'no_show')}
                                                                    className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                                                >
                                                                    Falta
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Stats Footer */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-sm text-slate-500">Total</p>
                        <p className="text-2xl font-bold text-slate-900">{sessions.length}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-sm text-slate-500">Confirmadas</p>
                        <p className="text-2xl font-bold text-green-600">{sessions.filter(s => s.status === 'CONFIRMADA').length}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-sm text-slate-500">Pendentes</p>
                        <p className="text-2xl font-bold text-yellow-600">{sessions.filter(s => s.status === 'AGENDADA').length}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-sm text-slate-500">Realizadas</p>
                        <p className="text-2xl font-bold text-slate-600">{sessions.filter(s => s.status === 'REALIZADA').length}</p>
                    </div>
                </div>
            </div>

            {/* Modal Nova Sessão */}
            {showNewSessionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Agendar Consulta
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Preencha os dados da consulta
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowNewSessionModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {/* Paciente */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Paciente *
                                </label>
                                <select
                                    value={newSession.patient}
                                    onChange={(e) => setNewSession({ ...newSession, patient: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    required
                                >
                                    <option value="">Selecione o paciente</option>
                                    {patients.map(patient => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.full_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Fisioterapeuta (apenas para gestor/atendente) */}
                            {currentUser.user_type !== 'FISIOTERAPEUTA' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Fisioterapeuta *
                                    </label>
                                    <select
                                        value={newSession.fisioterapeuta}
                                        onChange={(e) => setNewSession({ ...newSession, fisioterapeuta: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                        required
                                    >
                                        <option value="">Selecione o fisioterapeuta</option>
                                        {fisioterapeutas.map(fisio => (
                                            <option key={fisio.id} value={fisio.id}>
                                                {fisio.first_name} {fisio.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Data e Hora */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Data *
                                    </label>
                                    <input
                                        type="date"
                                        value={newSession.scheduled_date}
                                        onChange={(e) => setNewSession({ ...newSession, scheduled_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Hora *
                                    </label>
                                    <select
                                        value={newSession.scheduled_time}
                                        onChange={(e) => setNewSession({ ...newSession, scheduled_time: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                        required
                                    >
                                        {timeSlots.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Duração */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Duração (minutos)
                                </label>
                                <select
                                    value={newSession.duration_minutes}
                                    onChange={(e) => setNewSession({ ...newSession, duration_minutes: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                >
                                    <option value={30}>30 minutos</option>
                                    <option value={50}>50 minutos</option>
                                    <option value={60}>60 minutos (1 hora)</option>
                                    <option value={90}>90 minutos</option>
                                </select>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                            <button
                                onClick={() => setShowNewSessionModal(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateSession}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50"
                            >
                                {saving ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {saving ? 'Agendando...' : 'Agendar Consulta'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ArgonLayout>
    );
}

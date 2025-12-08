'use client';

import { useEffect, useState } from 'react';
import { Calendar, Users, Clock, CheckCircle, XCircle, Phone, User, Search, Plus, ChevronRight } from 'lucide-react';

interface AtendenteDashboardProps {
    currentUser: any;
}

interface Session {
    id: number;
    patient: number;
    patient_name: string;
    patient_phone?: string;
    fisioterapeuta: number;
    fisioterapeuta_name: string;
    scheduled_date: string;
    scheduled_time: string;
    status: string;
    status_display: string;
    is_today: boolean;
}

interface Patient {
    id: number;
    full_name: string;
    cpf: string;
    phone: string;
    birth_date: string;
}

export default function AtendenteDashboard({ currentUser }: AtendenteDashboardProps) {
    const [todaySessions, setTodaySessions] = useState<Session[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTodaySessions();
        fetchPatients();
    }, []);

    const fetchTodaySessions = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/prontuario/sessions/today/');
            if (response.ok) {
                const data = await response.json();
                setTodaySessions(data);
            }
        } catch (error) {
            console.error('Erro ao buscar sessões:', error);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/prontuario/patients/?is_active=true');
            if (response.ok) {
                const data = await response.json();
                setPatients(data.results || data);
            }
        } catch (error) {
            console.error('Erro ao buscar pacientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const confirmSession = async (sessionId: number) => {
        try {
            const response = await fetch(`http://localhost:8000/api/prontuario/sessions/${sessionId}/confirm/`, {
                method: 'POST',
            });
            if (response.ok) {
                fetchTodaySessions();
            }
        } catch (error) {
            console.error('Erro ao confirmar sessão:', error);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cpf.includes(searchTerm) ||
        p.phone.includes(searchTerm)
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AGENDADA': return 'bg-blue-100 text-blue-800';
            case 'CONFIRMADA': return 'bg-green-100 text-green-800';
            case 'EM_ANDAMENTO': return 'bg-yellow-100 text-yellow-800';
            case 'REALIZADA': return 'bg-gray-100 text-gray-800';
            case 'CANCELADA': return 'bg-red-100 text-red-800';
            case 'FALTA': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const pendingSessions = todaySessions.filter(s => s.status === 'AGENDADA');
    const confirmedSessions = todaySessions.filter(s => s.status === 'CONFIRMADA');

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Recepção
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Olá, {currentUser.first_name || 'Atendente'}! Gerencie a agenda e os pacientes.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md">
                        <Plus className="w-4 h-4" />
                        Nova Sessão
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Sessões Hoje</p>
                            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{todaySessions.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Pendentes</p>
                            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{pendingSessions.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Confirmadas</p>
                            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{confirmedSessions.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Pacientes Ativos</p>
                            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{patients.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Agenda do Dia */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-teal-500" />
                            Agenda de Hoje
                        </h2>
                    </div>
                    <div className="p-5 max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8 text-slate-500">Carregando...</div>
                        ) : todaySessions.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>Nenhuma sessão agendada para hoje</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {todaySessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                    {session.scheduled_time.slice(0, 5)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {session.patient_name}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    Dr(a). {session.fisioterapeuta_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                                                {session.status_display}
                                            </span>
                                            {session.status === 'AGENDADA' && (
                                                <button
                                                    onClick={() => confirmSession(session.id)}
                                                    className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                                    title="Confirmar presença"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Busca de Pacientes */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-teal-500" />
                            Buscar Paciente
                        </h2>
                        <div className="mt-3 relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nome, CPF ou telefone..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="p-5 max-h-80 overflow-y-auto">
                        {filteredPatients.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>{searchTerm ? 'Nenhum paciente encontrado' : 'Digite para buscar'}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredPatients.slice(0, 10).map((patient) => (
                                    <div
                                        key={patient.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium">
                                                {patient.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {patient.full_name}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {patient.phone}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`tel:${patient.phone}`}
                                                className="p-2 text-slate-500 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
                                                title="Ligar"
                                            >
                                                <Phone className="w-4 h-4" />
                                            </a>
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Ações Rápidas</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <Plus className="w-6 h-6 text-teal-500 mb-2" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Agendar Sessão</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <User className="w-6 h-6 text-blue-500 mb-2" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Novo Paciente</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <Calendar className="w-6 h-6 text-purple-500 mb-2" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ver Agenda</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <Phone className="w-6 h-6 text-green-500 mb-2" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Lista de Espera</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

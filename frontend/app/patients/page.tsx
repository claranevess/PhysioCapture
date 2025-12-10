'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRoutes } from '@/lib/api';
import { Patient } from '@/lib/types';
import ArgonLayout from '@/components/Argon/ArgonLayout';
import { ArgonCard, ArgonInfoCard } from '@/components/Argon/ArgonCard';
import { argonTheme } from '@/lib/argon-theme';
import {
  Search,
  UserPlus,
  Users,
  Phone,
  Mail,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Carregar usuário do localStorage
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await apiRoutes.patients.list();
      const data = response.data.results || response.data;
      setPatients(data);
      setFilteredPatients(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = patients.filter(
      (p) =>
        p.full_name.toLowerCase().includes(term) ||
        p.cpf.includes(term) ||
        p.phone.includes(term) ||
        (p.email && p.email.toLowerCase().includes(term))
    );
    setFilteredPatients(filtered);
  };

  if (loading) {
    return (
      <ArgonLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 
              className="w-12 h-12 mx-auto mb-4 animate-spin"
              style={{ color: argonTheme.colors.primary.main }}
            />
            <p 
              className="font-medium"
              style={{ color: argonTheme.colors.text.primary }}
            >
              Carregando pacientes...
            </p>
          </div>
        </div>
      </ArgonLayout>
    );
  }

  if (error) {
    return (
      <ArgonLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <ArgonCard className="max-w-md p-6">
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${argonTheme.colors.error.main}20` }}
              >
                <AlertCircle 
                  className="w-6 h-6"
                  style={{ color: argonTheme.colors.error.main }}
                />
              </div>
              <div>
                <h3 
                  className="text-lg font-bold mb-2"
                  style={{ color: argonTheme.colors.text.primary }}
                >
                  Erro ao Carregar
                </h3>
                <p 
                  className="text-sm mb-4"
                  style={{ color: argonTheme.colors.text.secondary }}
                >
                  {error}
                </p>
                <button
                  onClick={loadPatients}
                  className="px-4 py-2 rounded-lg font-medium text-white transition-all"
                  style={{ background: argonTheme.gradients.primary }}
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          </ArgonCard>
        </div>
      </ArgonLayout>
    );
  }

  return (
    <ArgonLayout>
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 
              className="text-2xl font-bold mb-1"
              style={{ color: argonTheme.colors.text.primary }}
            >
              {currentUser?.user_type === 'FISIOTERAPEUTA' ? 'Meus Pacientes' : 'Pacientes'}
            </h1>
            {currentUser && (
              <p 
                className="text-sm mb-1 font-medium"
                style={{ color: argonTheme.colors.primary.main }}
              >
                {currentUser.user_type === 'GESTOR_GERAL' 
                  ? '📊 Todos os pacientes da rede' 
                  : currentUser.user_type === 'GESTOR_FILIAL'
                    ? '🏢 Pacientes da filial'
                    : currentUser.user_type === 'FISIOTERAPEUTA'
                      ? '👨‍⚕️ Pacientes sob minha responsabilidade'
                      : currentUser.user_type === 'ATENDENTE'
                        ? '🏢 Pacientes da filial'
                        : '👤 Meus pacientes'}
              </p>
            )}
            <p style={{ color: argonTheme.colors.text.secondary }}>
              {filteredPatients.length} paciente(s) encontrado(s)
            </p>
          </div>
          {currentUser?.user_type === 'ATENDENTE' && (
            <Link
              href="/patients/new"
              className="px-4 py-2 rounded-lg font-medium text-white transition-all flex items-center gap-2 hover:shadow-lg"
              style={{ background: argonTheme.gradients.primary }}
            >
              <UserPlus className="w-4 h-4" />
              Novo Paciente
            </Link>
          )}
        </div>

        {/* Search */}
        <ArgonCard className="p-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: argonTheme.colors.text.secondary }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, CPF, telefone ou email..."
              className="w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: argonTheme.colors.grey[200],
              }}
              onFocus={(e) => {
                e.target.style.borderColor = argonTheme.colors.primary.main;
                e.target.style.boxShadow = argonTheme.shadows.primary;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = argonTheme.colors.grey[200];
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </ArgonCard>

        {/* Patients List */}
        {filteredPatients.length === 0 ? (
          <ArgonCard className="p-12 text-center">
            <div 
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${argonTheme.colors.primary.main}20` }}
            >
              <Users 
                className="w-10 h-10"
                style={{ color: argonTheme.colors.primary.main }}
              />
            </div>
            <h3 
              className="text-xl font-bold mb-2"
              style={{ color: argonTheme.colors.text.primary }}
            >
              {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            </h3>
            <p 
              className="mb-6"
              style={{ color: argonTheme.colors.text.secondary }}
            >
              {searchTerm
                ? 'Tente buscar com outros termos'
                : 'Comece cadastrando seu primeiro paciente'}
            </p>
            {!searchTerm && (
              <Link
                href="/patients/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
                style={{ background: argonTheme.gradients.primary }}
              >
                <UserPlus className="w-5 h-5" />
                Cadastrar Primeiro Paciente
              </Link>
            )}
          </ArgonCard>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredPatients.map((patient) => (
                <ArgonCard key={patient.id} hover>
                  <Link
                    href={`/patients/${patient.id}/records`}
                    className="block p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-white shadow-md flex-shrink-0"
                        style={{ background: argonTheme.gradients.primary }}
                      >
                        {patient.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-semibold truncate mb-1"
                          style={{ color: argonTheme.colors.text.primary }}
                        >
                          {patient.full_name}
                        </h3>
                        <div 
                          className="flex items-center gap-2 text-sm mb-2"
                          style={{ color: argonTheme.colors.text.secondary }}
                        >
                          <Phone className="w-4 h-4" />
                          {patient.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-xs px-2 py-1 rounded-full font-semibold"
                            style={{
                              backgroundColor: patient.is_active
                                ? `${argonTheme.colors.success.main}20`
                                : `${argonTheme.colors.error.main}20`,
                              color: patient.is_active
                                ? argonTheme.colors.success.main
                                : argonTheme.colors.error.main,
                            }}
                          >
                            {patient.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                          <span 
                            className="text-xs"
                            style={{ color: argonTheme.colors.text.secondary }}
                          >
                            {patient.age || '-'} anos
                          </span>
                        </div>
                      </div>
                      <ChevronRight 
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: argonTheme.colors.text.secondary }}
                      />
                    </div>
                  </Link>
                </ArgonCard>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              <ArgonCard>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: argonTheme.colors.light.main }}>
                        <th 
                          className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                          style={{ color: argonTheme.colors.text.secondary }}
                        >
                          Paciente
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                          style={{ color: argonTheme.colors.text.secondary }}
                        >
                          CPF
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                          style={{ color: argonTheme.colors.text.secondary }}
                        >
                          Contato
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                          style={{ color: argonTheme.colors.text.secondary }}
                        >
                          Idade
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                          style={{ color: argonTheme.colors.text.secondary }}
                        >
                          Status
                        </th>
                        <th 
                          className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider"
                          style={{ color: argonTheme.colors.text.secondary }}
                        >
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: argonTheme.colors.grey[100] }}>
                      {filteredPatients.map((patient) => (
                        <tr 
                          key={patient.id} 
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-md"
                                style={{ background: argonTheme.gradients.primary }}
                              >
                                {patient.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div 
                                  className="font-semibold"
                                  style={{ color: argonTheme.colors.text.primary }}
                                >
                                  {patient.full_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td 
                            className="px-6 py-4 whitespace-nowrap text-sm"
                            style={{ color: argonTheme.colors.text.secondary }}
                          >
                            {patient.cpf}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div 
                              className="text-sm"
                              style={{ color: argonTheme.colors.text.secondary }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Phone className="w-4 h-4" />
                                {patient.phone}
                              </div>
                              {patient.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  {patient.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td 
                            className="px-6 py-4 whitespace-nowrap text-sm"
                            style={{ color: argonTheme.colors.text.secondary }}
                          >
                            {patient.age || '-'} anos
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className="px-3 py-1 text-xs font-bold rounded-full"
                              style={{
                                backgroundColor: patient.is_active
                                  ? `${argonTheme.colors.success.main}20`
                                  : `${argonTheme.colors.error.main}20`,
                                color: patient.is_active
                                  ? argonTheme.colors.success.main
                                  : argonTheme.colors.error.main,
                              }}
                            >
                              {patient.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Link
                              href={`/patients/${patient.id}/records`}
                              className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                              style={{ color: argonTheme.colors.primary.main }}
                            >
                              Ver Prontuário
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ArgonCard>
            </div>
          </>
        )}
      </div>
    </ArgonLayout>
  );
}

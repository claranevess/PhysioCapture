'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArgonLayout from '@/components/Argon/ArgonLayout';
import { api } from '@/lib/api';
import { Stethoscope, Mail, Phone, Users, CheckCircle, XCircle, Search } from 'lucide-react';

interface Fisioterapeuta {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  crefito: string;
  especialidade: string;
  is_active_user: boolean;
  patient_count?: number;
}

export default function FisioterapeutasPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 🚧 DESENVOLVIMENTO: Autenticação desabilitada
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    
    loadFisioterapeutas();
  }, [router]);

  const loadFisioterapeutas = async () => {
    try {
      const response = await api.get('/api/auth/fisioterapeutas/');
      setFisioterapeutas(response.data);
    } catch (error) {
      console.error('Erro ao carregar fisioterapeutas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFisioterapeutas = fisioterapeutas.filter(fisio =>
    fisio.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fisio.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fisio.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fisio.crefito?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <ArgonLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Carregando...</p>
          </div>
        </div>
      </ArgonLayout>
    );
  }

  return (
    <ArgonLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fisioterapeutas</h1>
              <p className="text-gray-600">Equipe da clínica</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total</p>
                <p className="text-3xl font-bold text-gray-900">{fisioterapeutas.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Ativos</p>
                <p className="text-3xl font-bold text-green-600">
                  {fisioterapeutas.filter(f => f.is_active_user).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Inativos</p>
                <p className="text-3xl font-bold text-red-600">
                  {fisioterapeutas.filter(f => !f.is_active_user).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou CREFITO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Fisioterapeutas List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredFisioterapeutas.length === 0 ? (
            <div className="p-12 text-center">
              <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Nenhum fisioterapeuta encontrado' : 'Nenhum fisioterapeuta cadastrado'}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Tente ajustar sua busca' : 'Cadastre fisioterapeutas para a clínica'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Fisioterapeuta
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      CREFITO
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Especialidade
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pacientes
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFisioterapeutas.map((fisio) => (
                    <tr key={fisio.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {fisio.first_name.charAt(0)}{fisio.last_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {fisio.first_name} {fisio.last_name}
                            </p>
                            <p className="text-sm text-gray-500">@{fisio.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900">
                          {fisio.crefito || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {fisio.especialidade || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{fisio.email}</span>
                          </div>
                          {fisio.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{fisio.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900">
                            {fisio.patient_count || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {fisio.is_active_user ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3" />
                            Inativo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {filteredFisioterapeutas.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Mostrando {filteredFisioterapeutas.length} de {fisioterapeutas.length} fisioterapeutas
          </div>
        )}
      </div>
    </ArgonLayout>
  );
}


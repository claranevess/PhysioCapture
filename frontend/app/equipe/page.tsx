'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArgonLayout from '@/components/Argon/ArgonLayout';
import { apiRoutes } from '@/lib/api';
import { argonTheme } from '@/lib/argon-theme';
import { 
  Stethoscope, 
  Mail, 
  Phone, 
  Users, 
  CheckCircle, 
  XCircle, 
  Search, 
  Plus,
  UserPlus,
  UsersRound,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

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

interface Atendente {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_active_user: boolean;
}

type TabType = 'fisioterapeutas' | 'atendentes';

export default function EquipePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
  const [atendentes, setAtendentes] = useState<Atendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('fisioterapeutas');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'fisioterapeuta' | 'atendente'>('fisioterapeuta');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    cpf: '',
    crefito: '',
    especialidade: ''
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [fisioResponse, atendenteResponse] = await Promise.all([
        apiRoutes.fisioterapeutas.list(),
        apiRoutes.atendentes.list()
      ]);
      setFisioterapeutas(fisioResponse.data);
      setAtendentes(atendenteResponse.data);
    } catch (error) {
      console.error('Erro ao carregar equipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'fisioterapeuta' | 'atendente') => {
    setModalType(type);
    setFormData({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      cpf: '',
      crefito: '',
      especialidade: ''
    });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (modalType === 'fisioterapeuta') {
        await apiRoutes.fisioterapeutas.create(formData);
      } else {
        await apiRoutes.atendentes.create(formData);
      }
      
      closeModal();
      loadData(); // Recarregar lista
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cadastrar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const filteredFisioterapeutas = fisioterapeutas.filter(fisio =>
    fisio.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fisio.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fisio.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fisio.crefito?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAtendentes = atendentes.filter(atendente =>
    atendente.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    atendente.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    atendente.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: argonTheme.gradients.primary }}
              >
                <UsersRound className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
                  Gerenciar Equipe
                </h1>
                <p style={{ color: argonTheme.colors.text.secondary }}>
                  Fisioterapeutas e Atendentes da filial
                </p>
              </div>
            </div>
            
            <button
              onClick={() => openModal(activeTab === 'fisioterapeutas' ? 'fisioterapeuta' : 'atendente')}
              className="px-6 py-3 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
              style={{ background: argonTheme.gradients.primary }}
            >
              <Plus className="w-5 h-5" />
              {activeTab === 'fisioterapeutas' ? 'Novo Fisioterapeuta' : 'Novo Atendente'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Equipe</p>
                <p className="text-3xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
                  {fisioterapeutas.length + atendentes.length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${argonTheme.colors.primary.main}20` }}
              >
                <UsersRound className="w-6 h-6" style={{ color: argonTheme.colors.primary.main }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Fisioterapeutas</p>
                <p className="text-3xl font-bold" style={{ color: argonTheme.colors.info.main }}>
                  {fisioterapeutas.length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${argonTheme.colors.info.main}20` }}
              >
                <Stethoscope className="w-6 h-6" style={{ color: argonTheme.colors.info.main }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Atendentes</p>
                <p className="text-3xl font-bold" style={{ color: argonTheme.colors.success.main }}>
                  {atendentes.length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${argonTheme.colors.success.main}20` }}
              >
                <UserPlus className="w-6 h-6" style={{ color: argonTheme.colors.success.main }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Ativos</p>
                <p className="text-3xl font-bold text-green-600">
                  {fisioterapeutas.filter(f => f.is_active_user).length + atendentes.filter(a => a.is_active_user).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('fisioterapeutas')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'fisioterapeutas'
                  ? 'border-b-2'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{
                color: activeTab === 'fisioterapeutas' ? argonTheme.colors.primary.main : undefined,
                borderColor: activeTab === 'fisioterapeutas' ? argonTheme.colors.primary.main : undefined,
              }}
            >
              <Stethoscope className="w-5 h-5" />
              Fisioterapeutas ({fisioterapeutas.length})
            </button>
            <button
              onClick={() => setActiveTab('atendentes')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'atendentes'
                  ? 'border-b-2'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{
                color: activeTab === 'atendentes' ? argonTheme.colors.success.main : undefined,
                borderColor: activeTab === 'atendentes' ? argonTheme.colors.success.main : undefined,
              }}
            >
              <UserPlus className="w-5 h-5" />
              Atendentes ({atendentes.length})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'fisioterapeutas' 
                ? "Buscar por nome, email ou CREFITO..." 
                : "Buscar por nome ou email..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': argonTheme.colors.primary.main } as any}
            />
          </div>
        </div>

        {/* Fisioterapeutas List */}
        {activeTab === 'fisioterapeutas' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {filteredFisioterapeutas.length === 0 ? (
              <div className="p-12 text-center">
                <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum fisioterapeuta encontrado' : 'Nenhum fisioterapeuta cadastrado'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Tente ajustar sua busca' : 'Cadastre fisioterapeutas para a equipe'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => openModal('fisioterapeuta')}
                    className="px-6 py-3 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold mx-auto"
                    style={{ background: argonTheme.gradients.primary }}
                  >
                    <Plus className="w-5 h-5" />
                    Cadastrar Fisioterapeuta
                  </button>
                )}
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
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ background: argonTheme.gradients.info }}
                            >
                              {fisio.first_name?.charAt(0)}{fisio.last_name?.charAt(0)}
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
        )}

        {/* Atendentes List */}
        {activeTab === 'atendentes' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {filteredAtendentes.length === 0 ? (
              <div className="p-12 text-center">
                <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum atendente encontrado' : 'Nenhum atendente cadastrado'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Tente ajustar sua busca' : 'Cadastre atendentes para a equipe'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => openModal('atendente')}
                    className="px-6 py-3 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold mx-auto"
                    style={{ background: argonTheme.gradients.success }}
                  >
                    <Plus className="w-5 h-5" />
                    Cadastrar Atendente
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Atendente
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAtendentes.map((atendente) => (
                      <tr key={atendente.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ background: argonTheme.gradients.success }}
                            >
                              {atendente.first_name?.charAt(0)}{atendente.last_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {atendente.first_name} {atendente.last_name}
                              </p>
                              <p className="text-sm text-gray-500">@{atendente.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span>{atendente.email}</span>
                            </div>
                            {atendente.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{atendente.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {atendente.is_active_user ? (
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
        )}

        {/* Footer Info */}
        {((activeTab === 'fisioterapeutas' && filteredFisioterapeutas.length > 0) || 
          (activeTab === 'atendentes' && filteredAtendentes.length > 0)) && (
          <div className="mt-6 text-center text-sm text-gray-600">
            {activeTab === 'fisioterapeutas' 
              ? `Mostrando ${filteredFisioterapeutas.length} de ${fisioterapeutas.length} fisioterapeutas`
              : `Mostrando ${filteredAtendentes.length} de ${atendentes.length} atendentes`
            }
          </div>
        )}
      </div>

      {/* Modal de Cadastro */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: modalType === 'fisioterapeuta' ? argonTheme.gradients.info : argonTheme.gradients.success }}
                >
                  {modalType === 'fisioterapeuta' ? (
                    <Stethoscope className="w-5 h-5 text-white" />
                  ) : (
                    <UserPlus className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
                    Novo {modalType === 'fisioterapeuta' ? 'Fisioterapeuta' : 'Atendente'}
                  </h2>
                  <p className="text-sm" style={{ color: argonTheme.colors.text.secondary }}>
                    Preencha os dados para cadastrar
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sobrenome *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sobrenome"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome de Usuário *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="usuario123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000.000.000-00"
                />
              </div>

              {/* Campos específicos para Fisioterapeuta */}
              {modalType === 'fisioterapeuta' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CREFITO
                    </label>
                    <input
                      type="text"
                      name="crefito"
                      value={formData.crefito}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="CREFITO-X/XXXXX-X"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Especialidade
                    </label>
                    <select
                      name="especialidade"
                      value={formData.especialidade}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione uma especialidade</option>
                      <option value="Ortopédica">Ortopédica</option>
                      <option value="Neurológica">Neurológica</option>
                      <option value="Respiratória">Respiratória</option>
                      <option value="Pediátrica">Pediátrica</option>
                      <option value="Geriátrica">Geriátrica</option>
                      <option value="Desportiva">Desportiva</option>
                      <option value="Dermatofuncional">Dermatofuncional</option>
                      <option value="Aquática">Aquática</option>
                      <option value="Geral">Geral</option>
                    </select>
                  </div>
                </>
              )}

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
                  style={{ background: modalType === 'fisioterapeuta' ? argonTheme.gradients.info : argonTheme.gradients.success }}
                >
                  {saving ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ArgonLayout>
  );
}

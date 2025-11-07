'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRoutes } from '@/lib/api';
import ArgonLayout from '@/components/Argon/ArgonLayout';
import { ArgonCard } from '@/components/Argon/ArgonCard';
import { ArgonButton } from '@/components/Argon/ArgonButton';
import { argonTheme } from '@/lib/argon-theme';
import { User, Mail, Phone, Building2, Shield, Key, Save, Sparkles } from 'lucide-react';

interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  user_type_display: string;
  telefone?: string;
  clinica?: {
    nome: string;
    cnpj: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    telefone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await apiRoutes.auth.me();
      setUserData(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        telefone: response.data.telefone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Atualizar informações pessoais
      const profileData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
      };

      if (formData.telefone) {
        profileData.telefone = formData.telefone;
      }

      await apiRoutes.auth.updateProfile(profileData);

      // Atualizar senha se fornecida
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'As senhas não coincidem!' });
          setSaving(false);
          return;
        }

        if (formData.newPassword.length < 6) {
          setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres!' });
          setSaving(false);
          return;
        }

        await apiRoutes.auth.changePassword({
          old_password: formData.currentPassword,
          new_password: formData.newPassword
        });

        // Limpar campos de senha após sucesso
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }

      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      
      // Atualizar localStorage
      const updatedUser = { ...userData, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Recarregar dados
      await fetchUserData();
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erro ao salvar configurações. Verifique sua senha atual.' 
      });
    } finally {
      setSaving(false);
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
              Carregando...
            </p>
          </div>
        </div>
      </ArgonLayout>
    );
  }

  return (
    <ArgonLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: argonTheme.colors.text.primary }}
          >
            Configurações da Conta
          </h1>
          <p style={{ color: argonTheme.colors.text.secondary }}>
            Gerencie suas informações pessoais e preferências
          </p>
        </div>

        {/* Mensagens */}
        {message.text && (
          <ArgonCard
            className="p-4"
            style={{
              backgroundColor: message.type === 'success' 
                ? `${argonTheme.colors.success.main}20` 
                : `${argonTheme.colors.error.main}20`,
              borderLeft: `4px solid ${message.type === 'success' 
                ? argonTheme.colors.success.main 
                : argonTheme.colors.error.main}`
            }}
          >
            <p style={{ 
              color: message.type === 'success' 
                ? argonTheme.colors.success.main 
                : argonTheme.colors.error.main,
              fontWeight: 500
            }}>
              {message.text}
            </p>
          </ArgonCard>
        )}

        {/* Informações da Clínica - Read-only */}
        {userData?.clinica && (
          <ArgonCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
                style={{ background: argonTheme.gradients.primary }}
              >
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h2 
                className="text-xl font-semibold"
                style={{ color: argonTheme.colors.text.primary }}
              >
                Informações da Clínica
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: argonTheme.colors.text.secondary }}
                >
                  Nome da Clínica
                </label>
                <p 
                  className="font-medium"
                  style={{ color: argonTheme.colors.text.primary }}
                >
                  {userData.clinica.nome}
                </p>
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: argonTheme.colors.text.secondary }}
                >
                  CNPJ
                </label>
                <p 
                  className="font-medium"
                  style={{ color: argonTheme.colors.text.primary }}
                >
                  {userData.clinica.cnpj}
                </p>
              </div>
            </div>
          </ArgonCard>
        )}

        {/* Informações Pessoais */}
        <ArgonCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
              style={{ background: argonTheme.gradients.primary }}
            >
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 
              className="text-xl font-semibold"
              style={{ color: argonTheme.colors.text.primary }}
            >
              Informações Pessoais
            </h2>
          </div>

          <div className="space-y-4">
            {/* Email - Read-only */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: argonTheme.colors.text.primary }}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                E-mail (não editável)
              </label>
              <input
                type="email"
                value={userData?.email || ''}
                disabled
                className="w-full px-4 py-2 border rounded-lg cursor-not-allowed"
                style={{
                  borderColor: argonTheme.colors.grey[200],
                  backgroundColor: argonTheme.colors.grey[50],
                  color: argonTheme.colors.text.secondary
                }}
              />
            </div>

            {/* Tipo de Usuário - Read-only */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: argonTheme.colors.text.primary }}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Tipo de Usuário
              </label>
              <input
                type="text"
                value={userData?.user_type_display || userData?.user_type || ''}
                disabled
                className="w-full px-4 py-2 border rounded-lg cursor-not-allowed"
                style={{
                  borderColor: argonTheme.colors.grey[200],
                  backgroundColor: argonTheme.colors.grey[50],
                  color: argonTheme.colors.text.secondary
                }}
              />
            </div>

            {/* Nome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: argonTheme.colors.text.primary }}
                >
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: argonTheme.colors.grey[200] }}
                  onFocus={(e) => {
                    e.target.style.borderColor = argonTheme.colors.primary.main;
                    e.target.style.boxShadow = argonTheme.shadows.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = argonTheme.colors.grey[200];
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Seu primeiro nome"
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: argonTheme.colors.text.primary }}
                >
                  Sobrenome
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: argonTheme.colors.grey[200] }}
                  onFocus={(e) => {
                    e.target.style.borderColor = argonTheme.colors.primary.main;
                    e.target.style.boxShadow = argonTheme.shadows.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = argonTheme.colors.grey[200];
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Seu sobrenome"
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: argonTheme.colors.text.primary }}
              >
                <Phone className="w-4 h-4 inline mr-2" />
                Telefone
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: argonTheme.colors.grey[200] }}
                onFocus={(e) => {
                  e.target.style.borderColor = argonTheme.colors.primary.main;
                  e.target.style.boxShadow = argonTheme.shadows.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = argonTheme.colors.grey[200];
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </ArgonCard>

        {/* Alteração de Senha */}
        <ArgonCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
              style={{ background: argonTheme.gradients.primary }}
            >
              <Key className="w-5 h-5 text-white" />
            </div>
            <h2 
              className="text-xl font-semibold"
              style={{ color: argonTheme.colors.text.primary }}
            >
              Alterar Senha
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: argonTheme.colors.text.primary }}
              >
                Senha Atual
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: argonTheme.colors.grey[200] }}
                onFocus={(e) => {
                  e.target.style.borderColor = argonTheme.colors.primary.main;
                  e.target.style.boxShadow = argonTheme.shadows.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = argonTheme.colors.grey[200];
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Digite sua senha atual"
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: argonTheme.colors.text.primary }}
              >
                Nova Senha
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: argonTheme.colors.grey[200] }}
                onFocus={(e) => {
                  e.target.style.borderColor = argonTheme.colors.primary.main;
                  e.target.style.boxShadow = argonTheme.shadows.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = argonTheme.colors.grey[200];
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Digite sua nova senha (mínimo 6 caracteres)"
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: argonTheme.colors.text.primary }}
              >
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: argonTheme.colors.grey[200] }}
                onFocus={(e) => {
                  e.target.style.borderColor = argonTheme.colors.primary.main;
                  e.target.style.boxShadow = argonTheme.shadows.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = argonTheme.colors.grey[200];
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Confirme sua nova senha"
              />
            </div>

            <p 
              className="text-sm"
              style={{ color: argonTheme.colors.text.secondary }}
            >
              Deixe em branco se não quiser alterar a senha
            </p>
          </div>
        </ArgonCard>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <ArgonButton
            variant="gradient"
            color="primary"
            size="lg"
            icon={<Save className="w-5 h-5" />}
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </ArgonButton>
        </div>
      </div>
    </ArgonLayout>
  );
}

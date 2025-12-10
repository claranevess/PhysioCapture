'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api, apiRoutes } from '@/lib/api';
import ArgonLayout from '@/components/Argon/ArgonLayout';
import { ArgonCard } from '@/components/Argon/ArgonCard';
import { ArgonButton } from '@/components/Argon/ArgonButton';
import { argonTheme } from '@/lib/argon-theme';
import { ChevronLeft, Loader2, AlertCircle, Camera, Upload, X, Save } from 'lucide-react';

interface Fisioterapeuta {
  id: number;
  full_name: string;
  email: string;
}

interface PatientFormData {
  full_name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  chief_complaint: string;
  medical_history: string;
  allergies: string;
  medications: string;
  blood_type: string;
  fisioterapeuta: string;
  is_active: boolean;
  notes: string;
}

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<PatientFormData>({
    full_name: '',
    cpf: '',
    birth_date: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    chief_complaint: '',
    medical_history: '',
    allergies: '',
    medications: '',
    blood_type: '',
    fisioterapeuta: '',
    is_active: true,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Carregar dados do paciente e fisioterapeutas em paralelo
      const [patientRes, fisiosRes] = await Promise.all([
        api.get(`/api/prontuario/patients/${patientId}/`),
        apiRoutes.fisioterapeutas.list()
      ]);

      const patient = patientRes.data;
      setFisioterapeutas(fisiosRes.data || []);

      setFormData({
        full_name: patient.full_name || '',
        cpf: formatCPF(patient.cpf || ''),
        birth_date: patient.birth_date || '',
        phone: formatPhone(patient.phone || ''),
        email: patient.email || '',
        address: patient.address || '',
        city: patient.city || '',
        state: patient.state || '',
        zip_code: patient.zip_code || '',
        chief_complaint: patient.chief_complaint || '',
        medical_history: patient.medical_history || '',
        allergies: patient.allergies || '',
        medications: patient.medications || '',
        blood_type: patient.blood_type || '',
        fisioterapeuta: patient.fisioterapeuta?.toString() || '',
        is_active: patient.is_active ?? true,
        notes: patient.notes || '',
      });

      if (patient.photo_url) {
        setPhotoPreview(patient.photo_url);
      }
    } catch (err: any) {
      console.error('Error loading patient:', err);
      setError('Erro ao carregar dados do paciente');
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData((prev) => ({ ...prev, cpf: formatted }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setNewPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError('Nome completo é obrigatório');
      return false;
    }
    if (!formData.cpf.trim() || formData.cpf.replace(/\D/g, '').length !== 11) {
      setError('CPF inválido (deve ter 11 dígitos)');
      return false;
    }
    if (!formData.birth_date) {
      setError('Data de nascimento é obrigatória');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      setError('Telefone inválido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const submitData = new FormData();
      submitData.append('full_name', formData.full_name);
      submitData.append('cpf', formData.cpf.replace(/\D/g, ''));
      submitData.append('birth_date', formData.birth_date);
      submitData.append('phone', formData.phone.replace(/\D/g, ''));
      submitData.append('email', formData.email);
      submitData.append('address', formData.address);
      submitData.append('city', formData.city);
      submitData.append('state', formData.state);
      submitData.append('zip_code', formData.zip_code);
      submitData.append('chief_complaint', formData.chief_complaint);
      submitData.append('medical_history', formData.medical_history);
      submitData.append('allergies', formData.allergies);
      submitData.append('medications', formData.medications);
      submitData.append('blood_type', formData.blood_type);
      submitData.append('is_active', formData.is_active.toString());
      submitData.append('notes', formData.notes);

      if (formData.fisioterapeuta) {
        submitData.append('fisioterapeuta', formData.fisioterapeuta);
      }

      if (newPhoto) {
        submitData.append('photo', newPhoto);
      }

      await api.patch(`/api/prontuario/patients/${patientId}/`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Paciente atualizado com sucesso!');
      
      // Redirecionar após 1.5 segundos
      setTimeout(() => {
        router.push(`/patients/${patientId}/records`);
      }, 1500);
    } catch (err: any) {
      console.error('Error updating patient:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Erro ao atualizar paciente. Tente novamente.'
      );
    } finally {
      setSaving(false);
    }
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
            <p className="font-medium" style={{ color: argonTheme.colors.text.primary }}>
              Carregando dados do paciente...
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
        <div className="flex items-center gap-4">
          <Link
            href={`/patients/${patientId}/records`}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: argonTheme.colors.text.secondary }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: argonTheme.colors.text.primary }}>
              Editar Paciente
            </h1>
            <p style={{ color: argonTheme.colors.text.secondary }}>
              Atualize os dados do paciente
            </p>
          </div>
        </div>

        {/* Mensagens de erro/sucesso */}
        {error && (
          <div className="p-4 border-l-4 rounded-lg bg-white shadow-md" style={{ borderLeftColor: argonTheme.colors.error.main }}>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" style={{ color: argonTheme.colors.error.main }} />
              <p style={{ color: argonTheme.colors.error.main }}>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 border-l-4 rounded-lg bg-white shadow-md" style={{ borderLeftColor: argonTheme.colors.success.main }}>
            <p style={{ color: argonTheme.colors.success.main }}>{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto */}
          <ArgonCard className="p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: argonTheme.colors.text.primary }}>
              📸 Foto do Paciente
            </h2>
            <div className="flex items-center gap-6">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4"
                    style={{ borderColor: argonTheme.colors.primary.main }}
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: argonTheme.colors.error.main }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: argonTheme.colors.grey[100] }}
                >
                  <Camera className="w-12 h-12" style={{ color: argonTheme.colors.grey[400] }} />
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: `${argonTheme.colors.primary.main}20`,
                    color: argonTheme.colors.primary.main,
                  }}
                >
                  <Upload className="w-4 h-4" />
                  {photoPreview ? 'Alterar Foto' : 'Enviar Foto'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </ArgonCard>

          {/* Dados Pessoais */}
          <ArgonCard className="p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: argonTheme.colors.text.primary }}>
              ℹ️ Dados Pessoais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: argonTheme.colors.grey[200] }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                  CPF *
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  required
                  maxLength={14}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: argonTheme.colors.grey[200] }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: argonTheme.colors.grey[200] }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  required
                  maxLength={15}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: argonTheme.colors.grey[200] }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: argonTheme.colors.grey[200] }}
                />
              </div>
            </div>
          </ArgonCard>

          {/* Endereço */}
          <ArgonCard className="p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: argonTheme.colors.text.primary }}>
              📍 Endereço
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                  Endereço
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: argonTheme.colors.grey[200] }}
                  placeholder="Rua, Número, Bairro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                  Cidade
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: argonTheme.colors.grey[200] }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                    Estado
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    maxLength={2}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: argonTheme.colors.grey[200] }}
                    placeholder="UF"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                    CEP
                  </label>
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    maxLength={10}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: argonTheme.colors.grey[200] }}
                  />
                </div>
              </div>
            </div>
          </ArgonCard>

          {/* Fisioterapeuta Responsável */}
          <ArgonCard className="p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: argonTheme.colors.text.primary }}>
              👨‍⚕️ Fisioterapeuta Responsável
            </h2>
            <select
              name="fisioterapeuta"
              value={formData.fisioterapeuta}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white"
              style={{ borderColor: argonTheme.colors.grey[200] }}
            >
              <option value="">-- Nenhum (sem fisioterapeuta atribuído) --</option>
              {fisioterapeutas.map((fisio) => (
                <option key={fisio.id} value={fisio.id}>
                  {fisio.full_name}
                </option>
              ))}
            </select>
          </ArgonCard>

          {/* Informações Médicas */}
          <ArgonCard className="p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: argonTheme.colors.text.primary }}>
              🩺 Informações Médicas
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                    Tipo Sanguíneo
                  </label>
                  <select
                    name="blood_type"
                    value={formData.blood_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white"
                    style={{ borderColor: argonTheme.colors.grey[200] }}
                  >
                    <option value="">Selecione</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                  Queixa Principal
                </label>
                <textarea
                  name="chief_complaint"
                  value={formData.chief_complaint}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: argonTheme.colors.grey[200] }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                  Histórico Médico
                </label>
                <textarea
                  name="medical_history"
                  value={formData.medical_history}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: argonTheme.colors.grey[200] }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                  Alergias
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: argonTheme.colors.grey[200] }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                  Medicações em Uso
                </label>
                <textarea
                  name="medications"
                  value={formData.medications}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: argonTheme.colors.grey[200] }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: argonTheme.colors.text.secondary }}>
                  Observações Gerais
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: argonTheme.colors.grey[200] }}
                />
              </div>
            </div>
          </ArgonCard>

          {/* Status */}
          <ArgonCard className="p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: argonTheme.colors.text.primary }}>
              ⚙️ Status
            </h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-5 h-5 rounded"
                style={{ accentColor: argonTheme.colors.primary.main }}
              />
              <span style={{ color: argonTheme.colors.text.primary }}>
                Paciente Ativo
              </span>
            </label>
            <p className="mt-2 text-sm" style={{ color: argonTheme.colors.text.secondary }}>
              Pacientes inativos não aparecem nas listagens principais
            </p>
          </ArgonCard>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/patients/${patientId}/records`}
              className="flex-1 py-3 rounded-lg font-semibold text-center transition-all"
              style={{
                backgroundColor: argonTheme.colors.grey[100],
                color: argonTheme.colors.text.primary,
              }}
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ background: argonTheme.gradients.primary }}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ArgonLayout>
  );
}

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface PatientFormData {
  full_name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  email: string;
  address: string;
  photo?: File | null;
  chief_complaint: string;
  medical_history: string;
}

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<PatientFormData>({
    full_name: '',
    cpf: '',
    birth_date: '',
    phone: '',
    email: '',
    address: '',
    photo: null,
    chief_complaint: '',
    medical_history: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData((prev) => ({ ...prev, cpf: formatted }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Não foi possível acessar a câmera');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'patient-photo.jpg', { type: 'image/jpeg' });
            setFormData((prev) => ({ ...prev, photo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
              setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        }, 'image/jpeg', 0.9);
      }
      stopCamera();
    }
  };

  const toggleCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    if (stream) {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: null }));
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

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('full_name', formData.full_name);
      submitData.append('cpf', formData.cpf.replace(/\D/g, ''));
      submitData.append('birth_date', formData.birth_date);
      submitData.append('phone', formData.phone.replace(/\D/g, ''));
      submitData.append('email', formData.email);
      submitData.append('address', formData.address);
      submitData.append('chief_complaint', formData.chief_complaint);
      submitData.append('medical_history', formData.medical_history);

      if (formData.photo) {
        submitData.append('photo', formData.photo);
      }

      const response = await api.post('/api/prontuario/patients/', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Success! Redirect to patient details
      router.push(`/patients/${response.data.id}/records`);
    } catch (err: any) {
      console.error('Error creating patient:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Erro ao cadastrar paciente. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl pb-24">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/patients"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <span className="mr-2">←</span>
            <span>Voltar</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            👤 Novo Paciente
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Preencha os dados do novo paciente
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">❌ Erro</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
            <div className="p-4 flex justify-between items-center">
              <h2 className="text-white font-semibold">📸 Capturar Foto</h2>
              <button
                onClick={stopCamera}
                className="text-white text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="max-w-full max-h-full"
              />
            </div>
            <div className="p-4 space-y-4">
              <button
                onClick={toggleCamera}
                type="button"
                className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold"
              >
                🔄 Alternar Câmera
              </button>
              <button
                onClick={capturePhoto}
                type="button"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
              >
                📷 Capturar
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📸 Foto do Paciente
            </h2>
            {photoPreview ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-40 h-40 rounded-full object-cover border-4 border-blue-200"
                  />
                </div>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-semibold hover:bg-red-200"
                >
                  🗑️ Remover Foto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={startCamera}
                  className="bg-blue-100 text-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-200"
                >
                  📷 Tirar Foto
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-green-100 text-green-700 py-3 rounded-lg font-semibold hover:bg-green-200"
                >
                  📁 Escolher Arquivo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Personal Data */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ℹ️ Dados Pessoais
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="João da Silva"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF *
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  required
                  maxLength={14}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  required
                  maxLength={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Rua, Número, Bairro, Cidade - UF"
              />
            </div>
          </div>

          {/* Medical Data */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              🩺 Informações Médicas
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Queixa Principal
              </label>
              <textarea
                name="chief_complaint"
                value={formData.chief_complaint}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva a principal queixa do paciente..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Histórico Médico
              </label>
              <textarea
                name="medical_history"
                value={formData.medical_history}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Doenças pré-existentes, cirurgias, alergias, medicamentos..."
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/patients"
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold text-center hover:bg-gray-300"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white ${loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {loading ? '⏳ Cadastrando...' : '✓ Cadastrar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

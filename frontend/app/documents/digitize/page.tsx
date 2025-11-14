'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRoutes } from '@/lib/api';
import { 
  Camera, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  X,
  Sparkles,
  ArrowLeft,
  Image as ImageIcon,
  FileImage,
  Loader2,
  ZoomIn,
  RotateCw,
  Download,
  Trash2
} from 'lucide-react';

interface PreviewFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
}

export default function DigitizePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');

  const loadData = async () => {
    try {
      const [patientsRes, categoriesRes] = await Promise.all([
        apiRoutes.patients.list(),
        apiRoutes.categories.list(),
      ]);
      setPatients(patientsRes.data.results || patientsRes.data);
      setCategories(categoriesRes.data.results || categoriesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  // Carregar pacientes e categorias ao montar o componente
  useEffect(() => {
    loadData();
  }, []);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: PreviewFile[] = Array.from(selectedFiles).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const uploadFiles = async () => {
    // Validação obrigatória de paciente
    if (!selectedPatient) {
      alert('⚠️ É obrigatório selecionar um paciente antes de enviar os documentos!');
      return;
    }
    
    if (files.length === 0) {
      alert('⚠️ Adicione pelo menos um arquivo antes de enviar!');
      return;
    }

    setIsUploading(true);

    for (const fileItem of files) {
      if (fileItem.status !== 'pending') continue;

      try {
        // Atualizar status para uploading
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: 'uploading', progress: 0 } : f
          )
        );

        const formData = new FormData();
        formData.append('file', fileItem.file);
        formData.append('patient_id', selectedPatient.toString());
        formData.append('title', title || fileItem.file.name);
        formData.append('description', description);
        const docType = fileItem.file.type.includes('pdf') ? 'PDF' : 'IMAGE';
        formData.append('document_type', docType);
        if (selectedCategory) {
          formData.append('category', selectedCategory.toString());
        }

        await apiRoutes.documents.digitalize(formData);

        // Atualizar para success
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: 'success', progress: 100 } : f
          )
        );
      } catch (error: any) {
        // Atualizar para error
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? {
                  ...f,
                  status: 'error',
                  errorMessage: error.response?.data?.detail || 'Erro no upload',
                }
              : f
          )
        );
      }
    }

    setIsUploading(false);

    // Se todos foram enviados com sucesso, redirecionar
    const allSuccess = files.every((f) => f.status === 'success');
    if (allSuccess) {
      setTimeout(() => {
        router.push('/documents');
      }, 1500);
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.full_name?.toLowerCase().includes(searchPatient.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header Premium */}
      <header className="bg-gradient-to-r from-[#4DB6AC] to-[#009688] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Digitalização de Documentos
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                Capture e digitalize documentos médicos • PhysioCapture
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Área de Upload - 2 colunas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Zone */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#009688]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#009688] to-[#4DB6AC] rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#2C3E50]">
                      Adicionar Documentos
                    </h2>
                    <p className="text-sm text-[#7F8C8D]">
                      Arraste arquivos ou clique para selecionar
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Drag & Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative border-2 border-dashed rounded-xl p-12 transition-all ${
                    isDragging
                      ? 'border-[#009688] bg-[#009688]/5 scale-105'
                      : 'border-gray-200 hover:border-[#009688]/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#009688]/10 to-[#66BB6A]/10 rounded-full flex items-center justify-center mb-4">
                      <FileImage className="w-10 h-10 text-[#009688]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">
                      Arraste seus documentos aqui
                    </h3>
                    <p className="text-sm text-[#7F8C8D] mb-6">
                      Ou clique nos botões abaixo para selecionar
                    </p>

                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="group px-6 py-3 bg-gradient-to-r from-[#009688] to-[#4DB6AC] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Upload className="w-5 h-5" />
                        Selecionar Arquivos
                      </button>

                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="group px-6 py-3 bg-gradient-to-r from-[#66BB6A] to-[#81C784] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        Usar Câmera
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Preview Grid */}
                {files.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-[#2C3E50] mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Arquivos Selecionados ({files.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {files.map((fileItem) => (
                        <div
                          key={fileItem.id}
                          className="relative group bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:border-[#009688] transition-all"
                        >
                          {/* Preview */}
                          <div className="aspect-square relative bg-gray-100">
                            {fileItem.file.type.startsWith('image/') ? (
                              <img
                                src={fileItem.preview}
                                alt={fileItem.file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText className="w-12 h-12 text-gray-400" />
                              </div>
                            )}

                            {/* Status Overlay */}
                            {fileItem.status === 'uploading' && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                              </div>
                            )}
                            {fileItem.status === 'success' && (
                              <div className="absolute inset-0 bg-[#009688]/90 flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-white" />
                              </div>
                            )}
                            {fileItem.status === 'error' && (
                              <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-white" />
                              </div>
                            )}
                          </div>

                          {/* File Info */}
                          <div className="p-2">
                            <p className="text-xs font-medium text-[#2C3E50] truncate">
                              {fileItem.file.name}
                            </p>
                            <p className="text-xs text-[#7F8C8D]">
                              {(fileItem.file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>

                          {/* Remove Button */}
                          {fileItem.status === 'pending' && (
                            <button
                              onClick={() => removeFile(fileItem.id)}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informações do Documento */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#66BB6A]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#66BB6A] to-[#81C784] rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#2C3E50]">
                      Informações do Documento
                    </h2>
                    <p className="text-sm text-[#7F8C8D]">
                      Preencha os dados do documento
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                    Título do Documento
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Raio-X Coluna Lombar"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Adicione observações sobre o documento..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                    Categoria
                  </label>
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(Number(e.target.value) || null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent transition-all"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Seleção de Paciente */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-4">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#FF8099]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF8099] to-[#FF9FAE] rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#2C3E50]">
                      Selecionar Paciente
                    </h2>
                    <p className="text-sm text-[#7F8C8D]">Obrigatório</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Busca */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                    placeholder="Buscar paciente..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent text-sm"
                  />
                </div>

                {/* Lista de Pacientes */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedPatient === patient.id
                          ? 'border-[#009688] bg-[#009688]/5 shadow-sm'
                          : 'border-gray-200 hover:border-[#009688]/50 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                            selectedPatient === patient.id
                              ? 'bg-gradient-to-br from-[#009688] to-[#4DB6AC]'
                              : 'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`}
                        >
                          {patient.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#2C3E50] text-sm truncate">
                            {patient.full_name}
                          </p>
                          <p className="text-xs text-[#7F8C8D]">{patient.cpf}</p>
                        </div>
                        {selectedPatient === patient.id && (
                          <CheckCircle2 className="w-5 h-5 text-[#009688] flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Botão Upload */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={uploadFiles}
                    disabled={!selectedPatient || files.length === 0 || isUploading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-[#009688] to-[#4DB6AC] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Enviar Documentos
                      </>
                    )}
                  </button>

                  {files.length > 0 && (
                    <p className="text-xs text-center text-[#7F8C8D] mt-3">
                      {files.length} arquivo{files.length !== 1 ? 's' : ''} selecionado
                      {files.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#7F8C8D]">
              © 2025 PhysioCapture • Sistema de Gestão Fisioterapêutica
            </p>
            <p className="text-sm text-[#7F8C8D] flex items-center gap-2">
              Desenvolvido por{' '}
              <span className="font-semibold bg-gradient-to-r from-[#009688] to-[#66BB6A] bg-clip-text text-transparent">
                Core Hive
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

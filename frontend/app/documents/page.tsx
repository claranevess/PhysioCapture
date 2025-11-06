'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRoutes } from '@/lib/api';
import { Document, DocumentCategory } from '@/lib/types';
import { format } from 'date-fns';
import { 
  FileText, 
  Camera, 
  Download, 
  Eye, 
  CheckCircle2,
  Filter,
  Search,
  ArrowLeft,
  Sparkles,
  Upload,
  Loader2,
  FolderOpen,
  Calendar,
  User
} from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsRes, catsRes] = await Promise.all([
        apiRoutes.documents.list(),
        apiRoutes.categories.list(),
      ]);
      setDocuments(docsRes.data.results || docsRes.data);
      setCategories(catsRes.data.results || catsRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docId: number, title: string) => {
    try {
      const response = await apiRoutes.documents.download(docId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', title);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Erro ao baixar documento');
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesCategory = selectedCategory ? doc.category === selectedCategory : true;
    const matchesSearch = searchQuery 
      ? doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.patient_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#009688] to-[#4DB6AC] rounded-full flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-[#2C3E50] font-medium">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-[#2C3E50] text-center mb-2">
            Erro ao carregar
          </h3>
          <p className="text-sm text-[#7F8C8D] text-center">{error}</p>
          <button 
            onClick={loadData}
            className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-[#009688] to-[#4DB6AC] text-white rounded-lg hover:shadow-lg transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header Premium */}
      <header className="bg-gradient-to-r from-[#4DB6AC] to-[#009688] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Documentos Médicos
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                Gerencie e visualize todos os documentos digitalizados
              </p>
            </div>
            <Link
              href="/documents/digitize"
              className="px-6 py-3 bg-white text-[#009688] font-semibold rounded-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              <span className="hidden sm:inline">Digitalizar</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#009688] to-[#4DB6AC] rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-[#7F8C8D]">Total de Documentos</p>
                <p className="text-2xl font-bold text-[#2C3E50]">{documents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#66BB6A] to-[#81C784] rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-[#7F8C8D]">Verificados</p>
                <p className="text-2xl font-bold text-[#2C3E50]">
                  {documents.filter(d => d.is_verified).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF8099] to-[#FF9FAE] rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-[#7F8C8D]">Categorias</p>
                <p className="text-2xl font-bold text-[#2C3E50]">{categories.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7F8C8D]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar documentos ou pacientes..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Filtro de Categoria */}
              <div className="sm:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7F8C8D]" />
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(Number(e.target.value) || null)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.documents_count || 0})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Filtros rápidos */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                  !selectedCategory
                    ? 'bg-gradient-to-r from-[#009688] to-[#4DB6AC] text-white shadow-sm'
                    : 'bg-gray-100 text-[#7F8C8D] hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-[#009688] to-[#4DB6AC] text-white shadow-sm'
                      : 'bg-gray-100 text-[#7F8C8D] hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid de Documentos */}
        {filteredDocs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#009688]/10 to-[#66BB6A]/10 rounded-full flex items-center justify-center mb-4">
              <FolderOpen className="w-10 h-10 text-[#009688]" />
            </div>
            <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">
              Nenhum documento encontrado
            </h3>
            <p className="text-sm text-[#7F8C8D] mb-6">
              {searchQuery || selectedCategory 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece digitalizando seu primeiro documento'
              }
            </p>
            <Link
              href="/documents/digitize"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#009688] to-[#4DB6AC] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <Camera className="w-5 h-5" />
              Digitalizar Documento
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
              >
                {/* Header do Card */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#009688] to-[#4DB6AC] rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    {doc.is_verified && (
                      <span className="px-3 py-1 bg-gradient-to-r from-[#66BB6A] to-[#81C784] text-white text-xs font-semibold rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verificado
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-[#2C3E50] mb-1 line-clamp-2 group-hover:text-[#009688] transition-colors">
                    {doc.title}
                  </h3>

                  {doc.description && (
                    <p className="text-sm text-[#7F8C8D] line-clamp-2">
                      {doc.description}
                    </p>
                  )}
                </div>

                {/* Info do Card */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-[#7F8C8D]" />
                    <span className="text-[#2C3E50] font-medium">
                      {doc.patient_name}
                    </span>
                  </div>

                  {doc.category_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <FolderOpen className="w-4 h-4 text-[#7F8C8D]" />
                      <span className="text-[#7F8C8D]">{doc.category_name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-[#7F8C8D]" />
                    <span className="text-[#7F8C8D]">
                      {format(new Date(doc.created_at), 'dd/MM/yyyy')}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-xs text-[#7F8C8D]">
                      Tamanho: {doc.file_size_formatted}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="p-6 pt-0 flex gap-2">
                  <button
                    onClick={() => handleDownload(doc.id, doc.title)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#009688] to-[#4DB6AC] text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <Link
                    href={`/documents/${doc.id}`}
                    className="flex-1 px-4 py-3 bg-gray-100 text-[#2C3E50] rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
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

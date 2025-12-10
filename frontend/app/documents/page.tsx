'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRoutes } from '@/lib/api';
import { Document, DocumentCategory } from '@/lib/types';
import { format } from 'date-fns';
import { getCurrentUser, CurrentUser } from '@/lib/getCurrentUser';
import ArgonLayout from '@/components/Argon/ArgonLayout';
import { ArgonCard, ArgonStatsCard, ArgonInfoCard } from '@/components/Argon/ArgonCard';
import { ArgonButton } from '@/components/Argon/ArgonButton';
import { argonTheme } from '@/lib/argon-theme';
import DocumentViewerModal from '@/components/UI/DocumentViewerModal';
import {
  FileText,
  Camera,
  Download,
  Eye,
  CheckCircle2,
  Filter,
  Search,
  Loader2,
  FolderOpen,
  Calendar,
  User,
  Trash2
} from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Estado para modal de visualização
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    loadData();
    getCurrentUser().then(user => setCurrentUser(user));
  }, []);

  // GESTOR_GERAL só pode visualizar
  const canManageDocuments = currentUser?.user_type !== 'GESTOR_GERAL';

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

  const handleDownload = async (docId: number, title: string, fileUrl?: string, documentType?: string) => {
    try {
      const response = await apiRoutes.documents.download(docId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Extrair o nome do arquivo da URL ou usar o título com extensão
      let filename = title;
      if (fileUrl) {
        // Pegar o nome do arquivo da URL
        const urlParts = fileUrl.split('/');
        const originalFilename = urlParts[urlParts.length - 1];
        if (originalFilename && originalFilename.includes('.')) {
          filename = originalFilename;
        } else {
          // Adicionar extensão baseada no tipo do documento
          const ext = documentType === 'IMAGE' ? '.jpg' :
            documentType === 'PDF' ? '.pdf' :
              documentType === 'DOC' ? '.docx' :
                documentType === 'EXCEL' ? '.xlsx' : '';
          filename = title + ext;
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erro ao baixar documento');
    }
  };

  const handleDelete = async (docId: number, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir o documento "${title}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await apiRoutes.documents.delete(docId);
      setDocuments(docs => docs.filter(d => d.id !== docId));
    } catch (err) {
      alert('Erro ao excluir documento');
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
      <ArgonLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 animate-pulse"
              style={{ background: argonTheme.gradients.primary }}
            >
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="font-medium" style={{ color: argonTheme.colors.text.primary }}>
              Carregando documentos...
            </p>
          </div>
        </div>
      </ArgonLayout>
    );
  }

  if (error) {
    return (
      <ArgonLayout>
        <ArgonCard className="max-w-md mx-auto p-6">
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${argonTheme.colors.error.main}20` }}
            >
              <FileText
                className="w-6 h-6"
                style={{ color: argonTheme.colors.error.main }}
              />
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: argonTheme.colors.text.primary }}
            >
              Erro ao carregar
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: argonTheme.colors.text.secondary }}
            >
              {error}
            </p>
            <ArgonButton
              variant="gradient"
              color="primary"
              onClick={loadData}
              fullWidth
            >
              Tentar Novamente
            </ArgonButton>
          </div>
        </ArgonCard>
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
              Documentos Médicos
            </h1>
            <p style={{ color: argonTheme.colors.text.secondary }}>
              Gerencie e visualize todos os documentos digitalizados
            </p>
          </div>
          {canManageDocuments && (
            <Link href="/documents/digitize">
              <ArgonButton
                variant="gradient"
                color="primary"
                icon={<Camera className="w-5 h-5" />}
              >
                Digitalizar
              </ArgonButton>
            </Link>
          )}
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ArgonStatsCard
            title="Total de Documentos"
            value={documents.length}
            icon={<FileText className="w-7 h-7" />}
            iconGradient="primary"
          />

          <ArgonStatsCard
            title="Verificados"
            value={documents.filter(d => d.is_verified).length}
            icon={<CheckCircle2 className="w-7 h-7" />}
            iconGradient="success"
          />

          <ArgonStatsCard
            title="Categorias"
            value={categories.length}
            icon={<FolderOpen className="w-7 h-7" />}
            iconGradient="error"
          />
        </div>

        {/* Filtros e Busca */}
        <ArgonCard className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  style={{ color: argonTheme.colors.text.secondary }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar documentos ou pacientes..."
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: argonTheme.colors.grey[200] }}
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
            </div>

            {/* Filtro de Categoria */}
            <div className="sm:w-64">
              <div className="relative">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  style={{ color: argonTheme.colors.text.secondary }}
                />
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(Number(e.target.value) || null)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all appearance-none bg-white"
                  style={{ borderColor: argonTheme.colors.grey[200] }}
                  onFocus={(e) => {
                    e.target.style.borderColor = argonTheme.colors.primary.main;
                    e.target.style.boxShadow = argonTheme.shadows.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = argonTheme.colors.grey[200];
                    e.target.style.boxShadow = 'none';
                  }}
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
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all"
              style={{
                background: !selectedCategory ? argonTheme.gradients.primary : argonTheme.colors.grey[100],
                color: !selectedCategory ? '#FFFFFF' : argonTheme.colors.text.secondary,
              }}
            >
              Todos
            </button>
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all"
                style={{
                  background: selectedCategory === cat.id ? argonTheme.gradients.primary : argonTheme.colors.grey[100],
                  color: selectedCategory === cat.id ? '#FFFFFF' : argonTheme.colors.text.secondary,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </ArgonCard>

        {/* Grid de Documentos */}
        {filteredDocs.length === 0 ? (
          <ArgonCard className="p-12 text-center">
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${argonTheme.colors.primary.main}20` }}
            >
              <FolderOpen
                className="w-10 h-10"
                style={{ color: argonTheme.colors.primary.main }}
              />
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: argonTheme.colors.text.primary }}
            >
              Nenhum documento encontrado
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: argonTheme.colors.text.secondary }}
            >
              {searchQuery || selectedCategory
                ? 'Tente ajustar os filtros de busca'
                : 'Comece digitalizando seu primeiro documento'
              }
            </p>
            {canManageDocuments && (
              <Link href="/documents/digitize">
                <ArgonButton
                  variant="gradient"
                  color="primary"
                  icon={<Camera className="w-5 h-5" />}
                >
                  Digitalizar Documento
                </ArgonButton>
              </Link>
            )}
          </ArgonCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <ArgonCard key={doc.id} hover>
                {/* Header do Card */}
                <div
                  className="p-6 border-b"
                  style={{
                    borderColor: argonTheme.colors.grey[100],
                    background: 'linear-gradient(to right, rgba(245, 247, 250, 1), transparent)'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
                      style={{ background: argonTheme.gradients.primary }}
                    >
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    {doc.is_verified && (
                      <span
                        className="px-3 py-1 text-white text-xs font-semibold rounded-full flex items-center gap-1"
                        style={{ background: argonTheme.gradients.success }}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Verificado
                      </span>
                    )}
                  </div>

                  <h3
                    className="font-semibold mb-1 line-clamp-2"
                    style={{ color: argonTheme.colors.text.primary }}
                  >
                    {doc.title}
                  </h3>

                  {doc.description && (
                    <p
                      className="text-sm line-clamp-2"
                      style={{ color: argonTheme.colors.text.secondary }}
                    >
                      {doc.description}
                    </p>
                  )}
                </div>

                {/* Info do Card */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User
                      className="w-4 h-4"
                      style={{ color: argonTheme.colors.text.secondary }}
                    />
                    <span
                      className="font-medium"
                      style={{ color: argonTheme.colors.text.primary }}
                    >
                      {doc.patient_name}
                    </span>
                  </div>

                  {doc.category_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <FolderOpen
                        className="w-4 h-4"
                        style={{ color: argonTheme.colors.text.secondary }}
                      />
                      <span style={{ color: argonTheme.colors.text.secondary }}>
                        {doc.category_name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar
                      className="w-4 h-4"
                      style={{ color: argonTheme.colors.text.secondary }}
                    />
                    <span style={{ color: argonTheme.colors.text.secondary }}>
                      {format(new Date(doc.created_at), 'dd/MM/yyyy')}
                    </span>
                  </div>

                  <div
                    className="pt-3 border-t"
                    style={{ borderColor: argonTheme.colors.grey[100] }}
                  >
                    <span
                      className="text-xs"
                      style={{ color: argonTheme.colors.text.secondary }}
                    >
                      Tamanho: {doc.file_size_formatted}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="p-6 pt-0 flex gap-2 flex-wrap">
                  <ArgonButton
                    variant="gradient"
                    color="success"
                    size="sm"
                    icon={<Eye className="w-4 h-4" />}
                    onClick={() => setViewingDoc(doc)}
                  >
                    Ver
                  </ArgonButton>
                  <ArgonButton
                    variant="outline"
                    color="primary"
                    size="sm"
                    icon={<Download className="w-4 h-4" />}
                    onClick={() => handleDownload(doc.id, doc.title, doc.file_url, doc.document_type)}
                  >
                    Baixar
                  </ArgonButton>
                  {canManageDocuments && (
                    <ArgonButton
                      variant="outline"
                      color="error"
                      size="sm"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => handleDelete(doc.id, doc.title)}
                    >
                      Excluir
                    </ArgonButton>
                  )}
                </div>
              </ArgonCard>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Visualização de Documento */}
      <DocumentViewerModal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        doc={viewingDoc ? {
          id: viewingDoc.id,
          title: viewingDoc.title,
          file_url: viewingDoc.file_url || '',
          document_type: viewingDoc.document_type,
        } : null}
        onDownload={viewingDoc ? () => handleDownload(viewingDoc.id, viewingDoc.title, viewingDoc.file_url, viewingDoc.document_type) : undefined}
      />
    </ArgonLayout>
  );
}


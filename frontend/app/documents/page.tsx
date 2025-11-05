'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRoutes } from '@/lib/api';
import { Document, DocumentCategory } from '@/lib/types';
import { format } from 'date-fns';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

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

  const filteredDocs = selectedCategory
    ? documents.filter(doc => doc.category === selectedCategory)
    : documents;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erro</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link href="/" className="text-green-600 hover:text-green-800 mb-2 inline-block">
              ← Voltar
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
          </div>
          <Link
            href="/documents/upload"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            📤 Upload de Documento
          </Link>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              !selectedCategory
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat.name} ({cat.documents_count || 0})
            </button>
          ))}
        </div>

        {filteredDocs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">Nenhum documento encontrado</p>
            <Link
              href="/documents/upload"
              className="text-green-600 hover:text-green-800"
            >
              Fazer upload do primeiro documento
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">📄</div>
                  {doc.is_verified && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      ✓ Verificado
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">
                  {doc.title}
                </h3>

                {doc.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {doc.description}
                  </p>
                )}

                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  <p><strong>Paciente:</strong> {doc.patient_name}</p>
                  {doc.category_name && (
                    <p><strong>Categoria:</strong> {doc.category_name}</p>
                  )}
                  <p><strong>Tamanho:</strong> {doc.file_size_formatted}</p>
                  <p><strong>Data:</strong> {format(new Date(doc.created_at), 'dd/MM/yyyy')}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(doc.id, doc.title)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                  >
                    ⬇️ Download
                  </button>
                  <Link
                    href={`/documents/${doc.id}`}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200 text-center"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

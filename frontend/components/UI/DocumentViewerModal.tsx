/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { X, Download, Loader2, ZoomIn, ZoomOut, RotateCw, FileText, AlertCircle, ExternalLink } from 'lucide-react';

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    doc: {
        id: number;
        title: string;
        file_url: string;
        document_type?: string;
    } | null;
    onDownload?: () => void;
}

export default function DocumentViewerModal({
    isOpen,
    onClose,
    doc,
    onDownload,
}: DocumentViewerModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    // Reset states when document changes
    useEffect(() => {
        if (doc) {
            setIsLoading(true);
            setHasError(false);
            setScale(1);
            setRotation(0);
        }
    }, [doc?.id]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !doc) return null;

    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(doc.file_url) ||
        doc.document_type === 'IMAGE';
    const isPDF = /\.pdf$/i.test(doc.file_url) ||
        doc.document_type === 'PDF';

    const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
    const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#009688] to-[#4DB6AC] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-lg font-semibold text-white truncate">
                            {doc.title}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Zoom controls for images */}
                        {isImage && (
                            <>
                                <button
                                    onClick={handleZoomOut}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                                    title="Diminuir zoom"
                                >
                                    <ZoomOut className="w-5 h-5" />
                                </button>
                                <span className="text-white/80 text-sm min-w-[3rem] text-center">
                                    {Math.round(scale * 100)}%
                                </span>
                                <button
                                    onClick={handleZoomIn}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                                    title="Aumentar zoom"
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleRotate}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                                    title="Rotacionar"
                                >
                                    <RotateCw className="w-5 h-5" />
                                </button>
                                <div className="w-px h-6 bg-white/30 mx-1" />
                            </>
                        )}

                        {/* Download button */}
                        {onDownload && (
                            <button
                                onClick={onDownload}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                                title="Baixar arquivo"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        )}

                        {/* Open in new tab */}
                        <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                            title="Abrir em nova aba"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </a>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/20 hover:bg-red-500 rounded-lg text-white transition-colors"
                            title="Fechar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-gray-100 relative">
                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                            <div className="text-center">
                                <Loader2 className="w-12 h-12 text-[#009688] animate-spin mx-auto mb-4" />
                                <p className="text-[#7F8C8D]">Carregando documento...</p>
                            </div>
                        </div>
                    )}

                    {/* Error state */}
                    {hasError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">
                                    Erro ao carregar arquivo
                                </h3>
                                <p className="text-[#7F8C8D] mb-4">
                                    Não foi possível visualizar este documento.
                                </p>
                                <a
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#009688] text-white rounded-lg hover:bg-[#00796B] transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Abrir em nova aba
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Image viewer */}
                    {isImage && (
                        <div className="min-h-[60vh] flex items-center justify-center p-4 overflow-auto">
                            <img
                                src={doc.file_url}
                                alt={doc.title}
                                className="max-w-full transition-transform duration-200"
                                style={{
                                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                                }}
                                onLoad={() => setIsLoading(false)}
                                onError={() => {
                                    setIsLoading(false);
                                    setHasError(true);
                                }}
                            />
                        </div>
                    )}

                    {/* PDF viewer */}
                    {isPDF && (
                        <iframe
                            src={`${doc.file_url}#toolbar=1&navpanes=1`}
                            className="w-full min-h-[70vh] border-0"
                            title={doc.title}
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setIsLoading(false);
                                setHasError(true);
                            }}
                        />
                    )}

                    {/* Unsupported file type */}
                    {!isImage && !isPDF && (
                        <div className="min-h-[40vh] flex items-center justify-center p-6">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">
                                    Visualização não disponível
                                </h3>
                                <p className="text-[#7F8C8D] mb-4">
                                    Este tipo de arquivo não pode ser visualizado no navegador.
                                </p>
                                <div className="flex gap-3 justify-center">
                                    {onDownload && (
                                        <button
                                            onClick={onDownload}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#009688] text-white rounded-lg hover:bg-[#00796B] transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            Baixar Arquivo
                                        </button>
                                    )}
                                    <a
                                        href={doc.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#009688] text-[#009688] rounded-lg hover:bg-[#009688]/5 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Tentar Abrir
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

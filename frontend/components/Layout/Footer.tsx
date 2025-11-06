/**
 * Footer Component - PhysioCapture
 * Desenvolvido por Core Hive
 */

'use client';

import Link from 'next/link';

interface FooterProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

export default function Footer({ variant = 'default', className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  if (variant === 'minimal') {
    return (
      <footer className={`mt-12 pb-24 md:pb-8 text-center ${className}`}>
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md">
          <span className="text-gray-600 text-sm">Desenvolvido com</span>
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-600 text-sm">por</span>
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#14B8B8] to-[#26C2C2]">
            Core Hive
          </span>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`bg-gradient-to-r from-[#0D7676] via-[#14B8B8] to-[#26C2C2] text-white mt-16 ${className}`}>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold">PhysioCapture</h3>
                <p className="text-sm text-white/70">by Core Hive</p>
              </div>
            </div>
            <p className="text-white/80 leading-relaxed mb-4 max-w-md">
              Sistema completo de gestão para clínicas de fisioterapia com digitalização inteligente de documentos via OCR.
            </p>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                100% Digital
              </div>
              <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                Mobile First
              </div>
              <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                OCR Integrado
              </div>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-lg font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-white/80 hover:text-white transition-colors duration-300">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/patients" className="text-white/80 hover:text-white transition-colors duration-300">
                  Pacientes
                </Link>
              </li>
              <li>
                <Link href="/camera" className="text-white/80 hover:text-white transition-colors duration-300">
                  Digitalizar Documento
                </Link>
              </li>
              <li>
                <Link href="/documents" className="text-white/80 hover:text-white transition-colors duration-300">
                  Documentos
                </Link>
              </li>
            </ul>
          </div>

          {/* Funcionalidades */}
          <div>
            <h4 className="text-lg font-bold mb-4">Funcionalidades</h4>
            <ul className="space-y-2 text-white/80 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#4CAF50]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                OCR de Documentos
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#4CAF50]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Prontuário Digital
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#4CAF50]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Chatbot IA
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#4CAF50]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Gestão Centralizada
              </li>
            </ul>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-white/80 text-sm">
                © {currentYear} PhysioCapture. Todos os direitos reservados.
              </p>
            </div>

            {/* Branding Core Hive */}
            <div className="flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              <span className="text-white/80 text-sm">Desenvolvido com</span>
              <svg className="w-4 h-4 text-red-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-white/80 text-sm">por</span>
              <span className="font-bold text-white text-sm">
                Core Hive
              </span>
            </div>

            {/* Tech Stack */}
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>Next.js</span>
              <span>•</span>
              <span>Django</span>
              <span>•</span>
              <span>Tesseract OCR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decoração de fundo */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 pointer-events-none"></div>
    </footer>
  );
}

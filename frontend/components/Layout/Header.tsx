/**
 * Header Component - PhysioCapture
 * Desenvolvido por Core Hive
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, User, Bell, Search } from 'lucide-react';
import { Badge } from '@/components/UI/Badge';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0D7676] via-[#14B8B8] to-[#26C2C2] shadow-xl">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-white hidden sm:block drop-shadow-md">
                PhysioCapture
              </span>
              <span className="text-xl font-bold text-white sm:hidden drop-shadow-md">
                PC
              </span>
              <p className="text-xs text-white/70 hidden lg:block">by Core Hive</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 font-semibold backdrop-blur-sm"
            >
              Dashboard
            </Link>
            <Link
              href="/patients"
              className="px-4 py-2 rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 font-semibold backdrop-blur-sm"
            >
              Pacientes
            </Link>
            <Link
              href="/camera"
              className="px-4 py-2 rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 font-semibold backdrop-blur-sm"
            >
              Digitalizar
            </Link>
            <Link
              href="/documents"
              className="px-4 py-2 rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 font-semibold backdrop-blur-sm"
            >
              Documentos
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Search Button (Mobile) */}
            <button
              className="p-2.5 rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 md:hidden backdrop-blur-sm"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button
              className="p-2.5 rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 relative backdrop-blur-sm"
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF9800] rounded-full animate-pulse shadow-md"></span>
            </button>

            {/* User Menu */}
            <button
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
              aria-label="Menu do usuário"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                <User className="h-4 w-4 text-[#14B8B8]" />
              </div>
              <span className="hidden lg:block text-sm font-semibold text-white">
                Admin
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 md:hidden backdrop-blur-sm"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4 backdrop-blur-md">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                className="px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-all duration-300 font-semibold flex items-center gap-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/patients"
                className="px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-all duration-300 font-semibold flex items-center gap-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Pacientes
              </Link>
              <Link
                href="/camera"
                className="px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-all duration-300 font-semibold flex items-center gap-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                Digitalizar
              </Link>
              <Link
                href="/documents"
                className="px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-all duration-300 font-semibold flex items-center gap-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documentos
              </Link>
            </nav>
            <div className="mt-4 px-4">
              <Badge variant="primary" className="bg-white/20 text-white backdrop-blur-sm">
                Desenvolvido por Core Hive
              </Badge>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

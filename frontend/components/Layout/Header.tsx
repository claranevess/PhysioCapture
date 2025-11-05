'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, User, Bell, Search } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl">🏥</div>
            <span className="text-xl font-bold text-blue-600 hidden sm:block">
              PhysioCapture
            </span>
            <span className="text-xl font-bold text-blue-600 sm:hidden">
              PC
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/patients"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Pacientes
            </Link>
            <Link
              href="/documents"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Documentos
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Button (Mobile) */}
            <button
              className="p-2 text-gray-600 hover:text-blue-600 md:hidden"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button
              className="p-2 text-gray-600 hover:text-blue-600 relative"
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <button
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              aria-label="Menu do usuário"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                Admin
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-blue-600 md:hidden"
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
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                🏠 Dashboard
              </Link>
              <Link
                href="/patients"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                👥 Pacientes
              </Link>
              <Link
                href="/documents"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                📁 Documentos
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

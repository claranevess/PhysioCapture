/**
 * Header Component - PhysioCapture
 * Desenvolvido por Core Hive
 */

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, User, Bell, Search, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/UI/Badge';
import { apiRoutes } from '@/lib/api';

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await apiRoutes.auth.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0D7676] via-[#14B8B8] to-[#26C2C2] shadow-xl">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-white hidden sm:block drop-shadow-md">PhysioCapture</span>
              <span className="text-xl font-bold text-white sm:hidden drop-shadow-md">PC</span>
              <p className="text-xs text-white/70 hidden lg:block">by Core Hive</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/dashboard" className="px-4 py-2 rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 font-semibold backdrop-blur-sm">Dashboard</Link>
            <Link href="/patients" className="px-4 py-2 rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 font-semibold backdrop-blur-sm">Pacientes</Link>
            <Link href="/camera" className="px-4 py-2 rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 font-semibold backdrop-blur-sm">Digitalizar</Link>
            <Link href="/documents" className="px-4 py-2 rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 font-semibold backdrop-blur-sm">Documentos</Link>
          </nav>
          <div className="flex items-center space-x-2">
            <button className="p-2.5 rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 md:hidden backdrop-blur-sm"><Search className="h-5 w-5" /></button>
            <button className="p-2.5 rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 relative backdrop-blur-sm">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF9800] rounded-full animate-pulse shadow-md"></span>
            </button>
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                  <User className="h-4 w-4 text-[#14B8B8]" />
                </div>
                <span className="hidden lg:block text-sm font-semibold text-white">{currentUser?.first_name || 'Usuário'}</span>
                <ChevronDown className={`hidden lg:block h-4 w-4 text-white transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-[#2C3E50]">{currentUser?.first_name} {currentUser?.last_name}</p>
                    <p className="text-xs text-[#7F8C8D] truncate">{currentUser?.email}</p>
                    {currentUser?.clinica_data && (<p className="text-xs text-[#009688] font-medium mt-1">{currentUser.clinica_data.nome}</p>)}
                  </div>
                  <button onClick={() => { setUserMenuOpen(false); router.push('/profile'); }} className="w-full px-4 py-2 text-left text-sm text-[#2C3E50] hover:bg-[#F5F7FA] transition-colors flex items-center gap-3"><Settings className="h-4 w-4 text-[#7F8C8D]" />Configurações</button>
                  <div className="border-t border-gray-100 my-2"></div>
                  <button onClick={() => { setUserMenuOpen(false); handleLogout(); }} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"><LogOut className="h-4 w-4" />Sair</button>
                </div>
              )}
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2.5 rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 md:hidden backdrop-blur-sm">{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4 backdrop-blur-md">
            <nav className="flex flex-col space-y-2">
              <Link href="/dashboard" className="px-4 py-3 text-white hover:bg-white/20 rounded-lg transition-all duration-300 font-semibold flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>Dashboard
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

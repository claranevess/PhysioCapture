'use client';

/**
 * Argon Sidenav Component - PhysioCapture
 * Sidebar profissional inspirado no Argon Dashboard
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { argonTheme } from '@/lib/argon-theme';
import { getCurrentUser, CurrentUser } from '@/lib/getCurrentUser';
import {
  LayoutDashboard,
  Users,
  FileText,
  Camera,
  FolderOpen,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  User,
  Calendar,
  ArrowRightLeft,
  UsersRound,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  children?: NavItem[];
  onlyFor?: 'GESTOR' | 'GESTOR_GERAL' | 'GESTOR_FILIAL' | 'FISIOTERAPEUTA' | 'ATENDENTE';
  hideFor?: ('GESTOR_GERAL' | 'GESTOR_FILIAL' | 'FISIOTERAPEUTA' | 'ATENDENTE')[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  {
    name: 'Banco de Pacientes',
    href: '/patients',
    icon: Users,
    children: [
      { name: 'Ver Todos', href: '/patients', icon: Users },
      { name: 'Novo Paciente', href: '/patients/new', icon: User, onlyFor: 'ATENDENTE' },
      { name: 'Transferências', href: '/patients/transferencias', icon: ArrowRightLeft },
    ]
  },
  {
    name: 'Gerenciar Equipe',
    href: '/equipe',
    icon: UsersRound,
    onlyFor: 'GESTOR_FILIAL'
  },
  { name: 'Documentos', href: '/documents', icon: FolderOpen },
  { name: 'Digitalizar', href: '/documents/digitize', icon: Camera, hideFor: ['GESTOR_GERAL'] },
];

const bottomItems: NavItem[] = [
  { name: 'Perfil', href: '/profile', icon: User },
];

export default function ArgonSidenav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    // Carregar usuário para filtrar itens de menu por papel
    getCurrentUser().then(user => {
      if (user) {
        setCurrentUser(user);
      }
    });
  }, []);

  const toggleItem = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg text-gray-700 hover:bg-gray-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidenav */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        style={{ width: '280px' }}
      >
        <div className="h-full flex flex-col bg-white shadow-2xl">
          {/* Logo e Brand */}
          <div className="p-6 border-b border-gray-100">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                style={{ background: argonTheme.gradients.primary }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: argonTheme.colors.text.primary }}>
                  PhysioCapture
                </h1>
                <p className="text-xs" style={{ color: argonTheme.colors.text.secondary }}>
                  Sistema de Gestão
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems
                .filter(item => {
                  // Check onlyFor (exclusive access)
                  if (item.onlyFor) {
                    // 'GESTOR' means both GESTOR_GERAL and GESTOR_FILIAL
                    if (item.onlyFor === 'GESTOR') {
                      if (currentUser?.user_type !== 'GESTOR_GERAL' && currentUser?.user_type !== 'GESTOR_FILIAL') {
                        return false;
                      }
                    } else if (item.onlyFor !== currentUser?.user_type) {
                      return false;
                    }
                  }
                  // Check hideFor (hide from specific types)
                  if (item.hideFor && currentUser?.user_type && item.hideFor.includes(currentUser.user_type as any)) return false;
                  return true;
                })
                .map((item) => (
                  <div key={item.name}>
                    {item.children ? (
                      <>
                        <button
                          onClick={() => toggleItem(item.name)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all"
                          style={{
                            backgroundColor: isActive(item.href) ? argonTheme.colors.light.main : 'transparent',
                            color: isActive(item.href) ? argonTheme.colors.primary.main : argonTheme.colors.text.secondary,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.name}</span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${expandedItems.includes(item.name) ? 'rotate-180' : ''
                              }`}
                          />
                        </button>
                        {expandedItems.includes(item.name) && (
                          <div className="ml-4 mt-1 space-y-1">
                            {item.children
                              .filter((child) => {
                                // Check onlyFor (exclusive access)
                                if (child.onlyFor) {
                                  if (child.onlyFor === 'GESTOR') {
                                    if (currentUser?.user_type !== 'GESTOR_GERAL' && currentUser?.user_type !== 'GESTOR_FILIAL') {
                                      return false;
                                    }
                                  } else if (child.onlyFor !== currentUser?.user_type) {
                                    return false;
                                  }
                                }
                                // Check hideFor (hide from specific types)
                                if (child.hideFor && currentUser?.user_type && child.hideFor.includes(currentUser.user_type as any)) {
                                  return false;
                                }
                                return true;
                              })
                              .map((child) => (
                                <Link
                                  key={child.name}
                                  href={child.href}
                                  onClick={() => setIsOpen(false)}
                                  className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm"
                                  style={{
                                    backgroundColor: isActive(child.href) ? argonTheme.colors.light.main : 'transparent',
                                    color: isActive(child.href) ? argonTheme.colors.primary.main : argonTheme.colors.text.secondary,
                                  }}
                                >
                                  <child.icon className="w-4 h-4" />
                                  <span className="font-medium">{child.name}</span>
                                </Link>
                              ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all group"
                        style={{
                          backgroundColor: isActive(item.href) ? argonTheme.colors.light.main : 'transparent',
                          color: isActive(item.href) ? argonTheme.colors.primary.main : argonTheme.colors.text.secondary,
                        }}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{item.name}</span>
                        {item.badge && (
                          <span
                            className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full text-white"
                            style={{ background: argonTheme.gradients.error }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )}
                  </div>
                ))}
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-gray-200" />

            {/* Bottom Items */}
            <div className="space-y-1">
              {bottomItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                  style={{
                    backgroundColor: isActive(item.href) ? argonTheme.colors.light.main : 'transparent',
                    color: isActive(item.href) ? argonTheme.colors.primary.main : argonTheme.colors.text.secondary,
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all hover:shadow-lg text-white"
              style={{ background: argonTheme.gradients.error }}
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <p className="text-xs text-center" style={{ color: argonTheme.colors.text.secondary }}>
              © 2025 PhysioCapture
              <br />
              <span className="font-semibold" style={{ color: argonTheme.colors.primary.main }}>
                Core Hive
              </span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

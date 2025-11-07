'use client';

/**
 * Argon Navbar Component - PhysioCapture
 * Navbar profissional com breadcrumbs e perfil
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { argonTheme } from '@/lib/argon-theme';
import { getCurrentUser, CurrentUser } from '@/lib/getCurrentUser';
import {
  ChevronRight,
  Home,
} from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  href: string;
}

export default function ArgonNavbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    // Carregar usuário (do localStorage ou API)
    getCurrentUser().then(user => {
      if (user) {
        setCurrentUser(user);
      }
    });

    // Generate breadcrumbs
    generateBreadcrumbs();
  }, [pathname]);

  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbsList: BreadcrumbItem[] = [
      { name: 'Home', href: '/dashboard' },
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Evitar duplicar o dashboard no breadcrumb
      if (currentPath === '/dashboard') {
        return;
      }
      
      const name = segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbsList.push({
        name: name.replace(/-/g, ' '),
        href: currentPath,
      });
    });

    setBreadcrumbs(breadcrumbsList);
  };

  const getPageTitle = () => {
    const segment = pathname.split('/').filter(Boolean).pop();
    if (!segment || segment === 'dashboard') return 'Dashboard';
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  };

  return (
    <nav 
      className="bg-white border-b border-gray-100"
      style={{ boxShadow: argonTheme.shadows.sm }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Breadcrumbs & Page Title */}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm mb-1">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-2">
                  {index === 0 && <Home className="w-4 h-4" style={{ color: argonTheme.colors.text.secondary }} />}
                  <Link
                    href={crumb.href}
                    className="hover:underline transition-colors"
                    style={{ 
                      color: index === breadcrumbs.length - 1 
                        ? argonTheme.colors.primary.main 
                        : argonTheme.colors.text.secondary 
                    }}
                  >
                    {crumb.name}
                  </Link>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="w-4 h-4" style={{ color: argonTheme.colors.text.secondary }} />
                  )}
                </div>
              ))}
            </div>
            <h1 
              className="text-xl font-bold"
              style={{ color: argonTheme.colors.text.primary }}
            >
              {getPageTitle()}
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* User Info (sem dropdown - perfil está no sidebar) */}
            {currentUser && (
              <div className="flex items-center gap-3 px-3 py-2">
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md"
                  style={{ background: argonTheme.gradients.primary }}
                >
                  {currentUser.first_name?.charAt(0) || currentUser.username?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <p 
                    className="text-sm font-semibold"
                    style={{ color: argonTheme.colors.text.primary }}
                  >
                    {currentUser.first_name} {currentUser.last_name}
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: argonTheme.colors.text.secondary }}
                  >
                    {currentUser.user_type_display || currentUser.user_type}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

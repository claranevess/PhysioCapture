'use client';

/**
 * Argon Dashboard Layout - PhysioCapture
 * Layout principal com Sidenav e Navbar
 */

import { usePathname } from 'next/navigation';
import ArgonSidenav from './ArgonSidenav';
import ArgonNavbar from './ArgonNavbar';
import { argonTheme } from '@/lib/argon-theme';

interface ArgonLayoutProps {
  children: React.ReactNode;
}

const publicRoutes = ['/login', '/register', '/welcome', '/'];

export default function ArgonLayout({ children }: ArgonLayoutProps) {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: argonTheme.colors.background.default }}>
      {/* Sidenav */}
      <ArgonSidenav />

      {/* Main Content Area */}
      <div className="lg:ml-[280px] min-h-screen flex flex-col">
        {/* Navbar */}
        <ArgonNavbar />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 py-4">
          {/* Espaço em branco */}
        </footer>
      </div>
    </div>
  );
}

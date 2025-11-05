'use client';

import Link from 'next/link';
import { Home, Users, FileText, Camera, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Início',
      active: pathname === '/',
    },
    {
      href: '/patients',
      icon: Users,
      label: 'Pacientes',
      active: pathname?.startsWith('/patients'),
    },
    {
      href: '/camera',
      icon: Camera,
      label: 'Digitalizar',
      active: pathname === '/camera',
      primary: true,
    },
    {
      href: '/documents',
      icon: FileText,
      label: 'Documentos',
      active: pathname?.startsWith('/documents'),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 gap-1 px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all
                ${
                  item.primary
                    ? 'bg-blue-600 text-white transform -translate-y-2 shadow-lg'
                    : item.active
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }
              `}
            >
              <Icon className={`h-6 w-6 ${item.primary ? 'h-7 w-7' : ''}`} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

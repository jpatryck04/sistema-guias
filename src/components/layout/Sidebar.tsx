'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, History, Settings, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  isAdmin?: boolean;
}

const baseItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/formularios', label: 'Formularios', icon: FileText },
  { href: '/historial', label: 'Historial', icon: History },
];

export function Sidebar({ isAdmin }: Props) {
  const pathname = usePathname();

  const items = isAdmin
    ? [...baseItems, { href: '/configuracion', label: 'Configuración', icon: Settings }]
    : baseItems;

  return (
    <aside className="sidebar-shell hidden h-screen w-64 flex-col border-r text-white md:flex">
      <div className="sidebar-brand flex h-17 items-center gap-3 border-b px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-teal-100 ring-1 ring-white/10">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <span className="text-sm font-semibold tracking-tight">Guías de Inspección</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'sidebar-nav-item flex items-center gap-3 text-sm transition-colors',
                active ? 'sidebar-nav-item-active font-medium' : 'hover:bg-white/10'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export { baseItems };
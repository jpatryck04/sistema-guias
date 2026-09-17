'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, History, Settings, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types/database';

const baseItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/formularios', label: 'Formularios', icon: FileText },
  { href: '/historial', label: 'Historial', icon: History },
];

export function Topbar({ user }: { user: Profile | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isAdmin = user?.role === 'ADMINISTRADOR';
  const items = isAdmin
    ? [...baseItems, { href: '/configuracion', label: 'Configuración', icon: Settings }]
    : baseItems;

  async function logout() {
    await fetch('/auth/signout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="topbar flex items-center justify-between border-b px-4 md:px-7">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            nativeButton
            render={
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="sidebar-shell w-64 border-r p-0 text-white">
            <div className="sidebar-brand flex h-17 items-center gap-3 border-b px-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-teal-100 ring-1 ring-white/10">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold tracking-tight">Guías</span>
            </div>
            <nav className="space-y-1 p-3">
              {items.map((item) => {
                const active = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'sidebar-nav-item flex items-center gap-3 text-sm',
                      active ? 'sidebar-nav-item-active' : 'hover:bg-white/10'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <h1 className="text-base font-semibold tracking-tight text-primary">Sistema de Guías de Inspección</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          nativeButton
          render={
            <Button variant="ghost" className="gap-2">
              <UserCircle2 className="h-5 w-5" />
              <span className="hidden text-sm sm:inline">{user?.full_name ?? 'Usuario'}</span>
              {isAdmin && <Badge className="hidden sm:inline-flex">Admin</Badge>}
            </Button>
          }
        />
        <DropdownMenuContent
          align="end"
          className="w-72 border border-border/80 bg-background/95 p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-sm"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-2">
              <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/40 px-2.5 py-2.5 shadow-sm">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                  <UserCircle2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-sm font-medium text-foreground">{user?.full_name ?? 'Usuario'}</p>
                  <p className="break-all text-[11px] leading-4 text-muted-foreground">{user?.email ?? 'sin-email@dominio.com'}</p>
                  <span className="inline-flex rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    {user?.role ?? 'OPERADOR'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-red-600 focus:text-red-600 data-[variant=destructive]:text-red-600">
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
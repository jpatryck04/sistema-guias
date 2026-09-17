import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import type { Profile } from '@/types/database';

export function AppShell({ user, children }: { user: Profile | null; children: React.ReactNode }) {
  return (
    <div className="app-shell flex h-screen overflow-hidden">
      <Sidebar isAdmin={user?.role === 'ADMINISTRADOR'} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={user} />
        <main className="app-main flex-1 overflow-y-auto p-4 md:p-7 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
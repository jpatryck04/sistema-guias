import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/AppShell';
import type { Profile } from '@/types/database';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError && profileError.code !== '42703') {
    await supabase.auth.signOut();
    redirect('/login');
  }

  if (profileError?.code !== '42703' && profile?.active === false) {
    await supabase.auth.signOut();
    redirect('/login');
  }

  return <AppShell user={(profile ?? ({ id: user.id, email: user.email, full_name: user.email?.split('@')[0] ?? 'Usuario', role: 'OPERADOR' } as Profile))}>{children}</AppShell>;
}
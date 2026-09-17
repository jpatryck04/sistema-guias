import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UsuariosClient } from '@/components/configuracion/UsuariosClient';
import type { Profile } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function UsuariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single();

  if (profile?.role !== 'ADMINISTRADOR') redirect('/dashboard');

  const { data: usuarios } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F2B5B]">Gestión de Usuarios</h1>
      <UsuariosClient inicial={(usuarios ?? []) as Profile[]} />
    </div>
  );
}
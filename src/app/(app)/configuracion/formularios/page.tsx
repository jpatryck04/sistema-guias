import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FormulariosAdminClient } from '@/components/configuracion/FormulariosAdminClient';
import type { Formulario } from '@/types/formulario';

export const dynamic = 'force-dynamic';

export default async function FormulariosAdminPage() {
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

  const { data } = await supabase
    .from('formularios')
    .select('*')
    .order('orden', { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F2B5B]">Administración de Formularios</h1>
      <FormulariosAdminClient inicial={(data ?? []) as Formulario[]} />
    </div>
  );
}
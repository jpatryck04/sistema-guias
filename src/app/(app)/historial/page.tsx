import { createClient } from '@/lib/supabase/server';
import { HistorialClient } from '@/components/historial/HistorialClient';

export const dynamic = 'force-dynamic';

export default async function HistorialPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single();

  const isAdmin = profile?.role === 'ADMINISTRADOR';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F2B5B]">Historial de Impresiones</h1>
      <HistorialClient isAdmin={isAdmin} />
    </div>
  );
}
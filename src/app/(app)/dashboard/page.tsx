import Link from 'next/link';
import { FileText, History } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentPrints } from '@/components/dashboard/RecentPrints';
import { AdminAnalytics } from '@/components/dashboard/AdminAnalytics';
import { Button } from '@/components/ui/button';
import type { ImpresionConUsuario } from '@/types/impresion';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id ?? '')
    .maybeSingle();

  const { count: totalFormularios } = await supabase
    .from('formularios')
    .select('*', { count: 'exact', head: true })
    .eq('activo', true);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const { count: impresionesHoy } = await supabase
    .from('impresiones')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', hoy.toISOString());

  const { count: impresionesMes } = await supabase
    .from('impresiones')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', inicioMes.toISOString());

  const { data: ultima } = await supabase
    .from('impresiones')
    .select('created_at, formulario_nombre')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: recientes } = await supabase
    .from('impresiones')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  const userIds = Array.from(new Set((recientes ?? []).map((r) => r.user_id).filter(Boolean)));
  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('id, full_name, email').in('id', userIds)
    : { data: [] };
  const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  const recientesConUsuario: ImpresionConUsuario[] = (recientes ?? []).map((r) => {
    const prof = profilesById.get(r.user_id ?? '');
    return {
      id: r.id,
      user_id: r.user_id,
      formulario_id: r.formulario_id,
      formulario_nombre: r.formulario_nombre,
      copias: r.copias,
      created_at: r.created_at,
      usuario_nombre: r.usuario_nombre ?? prof?.full_name ?? null,
      usuario_email: r.usuario_email ?? prof?.email ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-title">Dashboard</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link href="/formularios">
                <FileText className="mr-2 h-4 w-4" /> Ver catálogo
              </Link>
            }
          />
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link href="/historial">
                <History className="mr-2 h-4 w-4" /> Historial
              </Link>
            }
          />
        </div>
      </div>

      <StatsCards
        totalFormularios={totalFormularios ?? 0}
        impresionesHoy={impresionesHoy ?? 0}
        impresionesMes={impresionesMes ?? 0}
        ultimaImpresion={ultima ?? null}
      />

      {profile?.role === 'ADMINISTRADOR' && <AdminAnalytics />}

      <RecentPrints data={recientesConUsuario} />
    </div>
  );
}
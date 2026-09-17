import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Users, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function ConfiguracionPage() {
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F2B5B]">Configuración</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/configuracion/usuarios">
          <Card className="transition-colors hover:border-primary">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-[#0F2B5B] text-white">
                <Users className="h-5 w-5" />
              </div>
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>Crear, activar, desactivar y eliminar usuarios.</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/configuracion/formularios">
          <Card className="transition-colors hover:border-primary">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-[#0F2B5B] text-white">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle>Formularios</CardTitle>
              <CardDescription>Administrar catálogo de formularios.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
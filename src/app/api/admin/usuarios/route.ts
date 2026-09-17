import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { crearUsuarioSchema } from '@/lib/validations/auth';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, active')
    .eq('id', user.id)
    .single();

  if (!profile?.active || profile.role !== 'ADMINISTRADOR') return null;
  return user;
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const body = await req.json();
  const parsed = crearUsuarioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const { email, password, full_name, role } = parsed.data;
  const adminClient = await createAdminClient();

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? 'Error creando usuario' }, { status: 400 });
  }

  const { error: profErr } = await adminClient
    .from('profiles')
    .update({ role, full_name })
    .eq('id', data.user.id);

  if (profErr) {
    await adminClient.auth.admin.deleteUser(data.user.id);
    return NextResponse.json({ error: profErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.user.id });
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  if (id === admin.id) return NextResponse.json({ error: 'No puedes eliminarte' }, { status: 400 });

  const adminClient = await createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
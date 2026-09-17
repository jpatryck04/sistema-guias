import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

function hourKey(date: Date) {
  return date.toISOString().slice(0, 13);
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'ADMINISTRADOR') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const since = new Date();
  since.setUTCMinutes(0, 0, 0);
  since.setUTCHours(since.getUTCHours() - 23);

  const { data: rows, error } = await supabase
    .from('impresiones')
    .select('created_at, formulario_nombre, copias, usuario_nombre, user_id')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const hours = Array.from({ length: 24 }, (_, index) => {
    const date = new Date(since);
    date.setUTCHours(since.getUTCHours() + index);
    return {
      date: hourKey(date),
      label: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }),
      value: 0,
    };
  });

  const hourMap = new Map(hours.map((hour) => [hour.date, hour]));
  const forms = new Map<string, number>();
  let copies = 0;

  for (const row of rows ?? []) {
    const hour = hourMap.get(hourKey(new Date(row.created_at)));
    if (hour) hour.value += 1;
    forms.set(row.formulario_nombre, (forms.get(row.formulario_nombre) ?? 0) + (row.copias ?? 0));
    copies += row.copias ?? 0;
  }

  const { count: activeUsersCount, error: activeUsersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('active', true);

  if (activeUsersError) return NextResponse.json({ error: activeUsersError.message }, { status: 500 });

  const adminClient = await createAdminClient();
  let loginRows: Array<{ created_at: string; user_id: string | null }> = [];

  const { data: sessionsRows, error: sessionsError } = await supabase
    .from('user_sessions')
    .select('created_at, user_id')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true });

  if (!sessionsError && sessionsRows) {
    loginRows = sessionsRows;
  } else if (sessionsError?.code === '42P01') {
    const { data: authUsers, error: authUsersError } = await adminClient
      .schema('auth')
      .from('users')
      .select('id, last_sign_in_at')
      .not('last_sign_in_at', 'is', null)
      .gte('last_sign_in_at', since.toISOString())
      .order('last_sign_in_at', { ascending: true });

    if (!authUsersError && authUsers) {
      loginRows = authUsers
        .filter((user) => user.last_sign_in_at)
        .map((user) => ({ created_at: user.last_sign_in_at as string, user_id: user.id }));
    }
  }

  for (const row of loginRows) {
    const hour = hourMap.get(hourKey(new Date(row.created_at)));
    if (hour) hour.value += 1;
  }

  const topForms = Array.from(forms.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  return NextResponse.json({
    activity: hours,
    topForms,
    copies,
    users: activeUsersCount ?? 0,
    prints: rows?.length ?? 0,
    sessions: loginRows.length,
    updatedAt: new Date().toISOString(),
  });
}

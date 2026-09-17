'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate } from '@/lib/utils';
import type { ImpresionConUsuario } from '@/types/impresion';

export function HistorialClient({ isAdmin }: { isAdmin: boolean }) {
  const [data, setData] = useState<ImpresionConUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [usuario, setUsuario] = useState('');

  const load = useCallback(async () => {
    const supabase = createClient();

    let query = supabase
      .from('impresiones')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (desde) query = query.gte('created_at', new Date(desde).toISOString());
    if (hasta) {
      const d = new Date(hasta);
      d.setHours(23, 59, 59, 999);
      query = query.lte('created_at', d.toISOString());
    }

    const { data: rows, error } = await query;
    if (error) {
      console.error('Error cargando historial:', error);
      return [];
    }

    const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id).filter(Boolean)));
    const { data: profiles } = userIds.length
      ? await supabase.from('profiles').select('id, full_name, email').in('id', userIds)
      : { data: [] };
    const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

    let mapped: ImpresionConUsuario[] = (rows ?? []).map((r) => {
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

    if (usuario.trim()) {
      const u = usuario.toLowerCase();
      mapped = mapped.filter(
        (r) =>
          (r.usuario_nombre ?? '').toLowerCase().includes(u) ||
          (r.usuario_email ?? '').toLowerCase().includes(u)
      );
    }

    return mapped;
  }, [desde, hasta, usuario]);

  useEffect(() => {
    let active = true;

    void (async () => {
      setLoading(true);
      const mapped = await load();

      if (!active) return;
      setData(mapped);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [load]);

  function exportCSV() {
    const header = ['Fecha', 'Usuario', 'Email', 'Formulario', 'Copias'];
    const rows = data.map((r) => [
      formatDate(r.created_at),
      r.usuario_nombre ?? '',
      r.usuario_email ?? '',
      r.formulario_nombre,
      String(r.copias),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Desde</Label>
            <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Hasta</Label>
            <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
          {isAdmin && (
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Input
                placeholder="Nombre o email"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </div>
          )}
          <div className="flex items-end gap-2">
            <Button variant="outline" onClick={() => { setDesde(''); setHasta(''); setUsuario(''); }}>
              Limpiar
            </Button>
            <Button onClick={exportCSV} variant="secondary">
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingSpinner />
      ) : data.length === 0 ? (
        <EmptyState title="Sin impresiones" description="No hay registros para los filtros seleccionados." />
      ) : (
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                {isAdmin && <TableHead>Usuario</TableHead>}
                <TableHead>Formulario</TableHead>
                <TableHead className="text-right">Copias</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs">{formatDate(r.created_at)}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-xs">
                      {r.usuario_nombre ?? '—'}
                      <div className="text-[10px] text-muted-foreground">{r.usuario_email}</div>
                    </TableCell>
                  )}
                  <TableCell className="text-xs">{r.formulario_nombre}</TableCell>
                  <TableCell className="text-right text-xs font-medium">{r.copias}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
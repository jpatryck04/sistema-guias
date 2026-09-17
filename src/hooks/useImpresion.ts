'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { printFormularios } from '@/lib/printing/print';
import type { ItemImpresion, ProgresoImpresion } from '@/types/impresion';

export function useImpresion() {
  const [imprimiendo, setImprimiendo] = useState(false);
  const [progreso, setProgreso] = useState<ProgresoImpresion | null>(null);

  const imprimir = useCallback(async (items: ItemImpresion[]): Promise<boolean> => {
    if (!items.length) return false;

    setImprimiendo(true);
    setProgreso({ actual: 0, total: items.reduce((a, b) => a + b.copias, 0), formularioNombre: '' });

    try {
      await printFormularios(items, (p) => setProgreso(p));

      // Registrar impresiones (una fila por formulario, no por copia)
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Sesión no válida');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .maybeSingle();
      const usuarioNombre = profile?.full_name ?? user.user_metadata?.full_name ?? user.email ?? 'Usuario';
      const usuarioEmail = profile?.email ?? user.email ?? null;

      const rows = items.map((it) => ({
        user_id: user.id,
        usuario_nombre: usuarioNombre,
        usuario_email: usuarioEmail,
        formulario_id: it.formularioId,
        formulario_nombre: it.formularioNombre,
        copias: it.copias,
      }));

      const { error } = await supabase.from('impresiones').insert(rows);
      if (error) throw error;

      window.dispatchEvent(new CustomEvent('dashboard-metrics-refresh'));
      toast.success('Impresiones registradas correctamente');
      return true;
    } catch (err) {
      console.error(err);
      toast.error('Error al imprimir o registrar');
      return false;
    } finally {
      setImprimiendo(false);
      setProgreso(null);
    }
  }, []);

  return { imprimir, imprimiendo, progreso };
}
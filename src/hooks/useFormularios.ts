'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Formulario } from '@/types/formulario';

interface Params {
  busqueda?: string;
  categoria?: string | null;
  soloActivos?: boolean;
}

export function useFormularios({ busqueda = '', categoria = null, soloActivos = true }: Params = {}) {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFormularios = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    let query = supabase.from('formularios').select('*').order('orden', { ascending: true });

    if (soloActivos) query = query.eq('activo', true);
    if (categoria) query = query.eq('categoria', categoria);
    if (busqueda.trim()) query = query.ilike('nombre', `%${busqueda.trim()}%`);

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
      setFormularios([]);
    } else {
      setFormularios((data ?? []) as Formulario[]);
    }
    setLoading(false);
  }, [busqueda, categoria, soloActivos]);

  useEffect(() => {
    // La carga inicial depende de parámetros externos y la actualización del estado
    // es parte del ciclo de sincronización del hook. Esta regla es conservadora y
    // en este caso la carga se hace de manera controlada y segura.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchFormularios();
  }, [fetchFormularios]);

  return { formularios, loading, error, refetch: fetchFormularios };
}
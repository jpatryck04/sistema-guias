'use client';

import { useCallback, useMemo, useState } from 'react';

export function useSeleccion() {
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const limpiar = useCallback(() => setSeleccion(new Set()), []);

  const seleccionarTodos = useCallback((ids: string[]) => {
    setSeleccion(new Set(ids));
  }, []);

  const estaSeleccionado = useCallback((id: string) => seleccion.has(id), [seleccion]);

  const ids = useMemo(() => Array.from(seleccion), [seleccion]);

  return {
    seleccion,
    ids,
    count: seleccion.size,
    toggle,
    limpiar,
    seleccionarTodos,
    estaSeleccionado,
  };
}
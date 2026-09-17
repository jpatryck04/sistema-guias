'use client';

import { Printer, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  count: number;
  onLimpiar: () => void;
  onImprimir: () => void;
}

export function BarraSeleccion({ count, onLimpiar, onImprimir }: Props) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-full border bg-white px-4 py-2 shadow-lg">
        <span className="text-sm font-medium">
          {count} formulario{count !== 1 ? 's' : ''} seleccionado{count !== 1 ? 's' : ''}
        </span>
        <Button variant="ghost" size="sm" onClick={onLimpiar}>
          <Trash2 className="mr-1 h-4 w-4" /> Limpiar
        </Button>
        <Button size="sm" onClick={onImprimir}>
          <Printer className="mr-1 h-4 w-4" /> Imprimir seleccionados
        </Button>
      </div>
    </div>
  );
}
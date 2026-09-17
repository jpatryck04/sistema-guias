'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Formulario } from '@/types/formulario';

interface Props {
  formulario: Formulario | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function VistaPreviaDialog({ formulario, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{formulario?.nombre}</DialogTitle>
        </DialogHeader>
        {formulario && (
          <div className="h-[70vh] w-full overflow-hidden rounded-md border">
            <iframe
              src={encodeURI(formulario.storage_path)}
              className="h-full w-full"
              title={formulario.nombre}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
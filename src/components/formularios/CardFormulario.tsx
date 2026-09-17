'use client';

import { Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import type { Formulario } from '@/types/formulario';

interface Props {
  formulario: Formulario;
  seleccionado: boolean;
  onToggle: (id: string) => void;
  onPreview: (f: Formulario) => void;
}

export function CardFormulario({ formulario, seleccionado, onToggle, onPreview }: Props) {
  return (
    <Card className={seleccionado ? 'border-primary' : ''}>
      <CardContent className="flex items-start gap-3 p-4">
        <Checkbox
          checked={seleccionado}
          onCheckedChange={() => onToggle(formulario.id)}
          className="mt-1"
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-tight">{formulario.nombre}</h3>
            <Button variant="ghost" size="icon" onClick={() => onPreview(formulario)}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
          <Badge variant="secondary" className="text-xs">{formulario.categoria}</Badge>
          {formulario.descripcion && (
            <p className="line-clamp-2 text-xs text-muted-foreground">{formulario.descripcion}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
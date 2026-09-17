'use client';

import { Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Formulario } from '@/types/formulario';

interface Props {
  formularios: Formulario[];
  seleccionados: Set<string>;
  onToggle: (id: string) => void;
  onToggleTodos: (checked: boolean) => void;
  onPreview: (f: Formulario) => void;
}

export function TablaFormularios({
  formularios,
  seleccionados,
  onToggle,
  onToggleTodos,
  onPreview,
}: Props) {
  const todosSeleccionados =
    formularios.length > 0 && formularios.every((f) => seleccionados.has(f.id));

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/90">
          <TableRow>
            <TableHead className="w-12 px-4 py-3">
              <Checkbox
                checked={todosSeleccionados}
                onCheckedChange={(v) => onToggleTodos(Boolean(v))}
                className="data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
              />
            </TableHead>
            <TableHead className="px-4 py-3 text-sm font-semibold text-slate-700">Nombre</TableHead>
            <TableHead className="px-4 py-3 text-sm font-semibold text-slate-700">Categoría</TableHead>
            <TableHead className="hidden px-4 py-3 text-sm font-semibold text-slate-700 md:table-cell">Descripción</TableHead>
            <TableHead className="w-24 px-4 py-3 text-right text-sm font-semibold text-slate-700">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formularios.map((f) => (
            <TableRow key={f.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/80">
              <TableCell className="px-4 py-3">
                <Checkbox
                  checked={seleccionados.has(f.id)}
                  onCheckedChange={() => onToggle(f.id)}
                  className="data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                />
              </TableCell>
              <TableCell className="px-4 py-3 font-medium text-slate-800">{f.nombre}</TableCell>
              <TableCell className="px-4 py-3">
                <Badge variant="secondary" className="rounded-full border border-sky-100 bg-sky-50 text-sky-700">
                  {f.categoria}
                </Badge>
              </TableCell>
              <TableCell className="hidden max-w-md truncate px-4 py-3 text-sm text-slate-600 md:table-cell">
                {f.descripcion ?? '—'}
              </TableCell>
              <TableCell className="px-4 py-3 text-right">
                <Button variant="ghost" size="icon" onClick={() => onPreview(f)} className="rounded-full hover:bg-sky-50 hover:text-sky-700">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
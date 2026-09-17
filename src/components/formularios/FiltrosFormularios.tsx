'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Props {
  categorias: string[];
  categoria: string | null;
  onCategoriaChange: (c: string | null) => void;
  soloActivos: boolean;
  onSoloActivosChange: (v: boolean) => void;
}

export function FiltrosFormularios({
  categorias,
  categoria,
  onCategoriaChange,
  soloActivos,
  onSoloActivosChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 shadow-sm">
        <Label className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Categoría</Label>
        <Select
          value={categoria ?? 'todas'}
          onValueChange={(v) => onCategoriaChange(v === 'todas' ? null : v)}
        >
          <SelectTrigger className="h-9 w-44 border-0 bg-transparent shadow-none focus:ring-0">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
        <Checkbox
          id="solo-activos"
          checked={soloActivos}
          onCheckedChange={(v) => onSoloActivosChange(Boolean(v))}
          className="data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
        />
        <Label htmlFor="solo-activos" className="cursor-pointer text-sm font-medium text-slate-700">
          Solo activos
        </Label>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { createClient } from '@/lib/supabase/client';
import type { Formulario } from '@/types/formulario';

interface FormState {
  id?: string;
  nombre: string;
  nombre_archivo: string;
  categoria: string;
  descripcion: string;
  storage_path: string;
  orden: number;
  activo: boolean;
}

const empty: FormState = {
  nombre: '',
  nombre_archivo: '',
  categoria: 'General',
  descripcion: '',
  storage_path: '/formularios/',
  orden: 0,
  activo: true,
};

export function FormulariosAdminClient({ inicial }: { inicial: Formulario[] }) {
  const [formularios, setFormularios] = useState<Formulario[]>(inicial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Formulario | null>(null);

  async function refrescar() {
    const supabase = createClient();
    const { data } = await supabase.from('formularios').select('*').order('orden');
    setFormularios((data ?? []) as Formulario[]);
  }

  function abrirNuevo() {
    setForm(empty);
    setOpen(true);
  }

  function abrirEditar(f: Formulario) {
    setForm({
      id: f.id,
      nombre: f.nombre,
      nombre_archivo: f.nombre_archivo,
      categoria: f.categoria,
      descripcion: f.descripcion ?? '',
      storage_path: f.storage_path,
      orden: f.orden,
      activo: f.activo,
    });
    setOpen(true);
  }

  async function guardar() {
    if (!form.nombre || !form.nombre_archivo || !form.storage_path) {
      toast.error('Completa los campos obligatorios');
      return;
    }
    if (!/^\/formularios\/[^?#\r\n]+\.pdf$/i.test(form.storage_path)) {
      toast.error('La ruta debe comenzar por /formularios/ y terminar en .pdf');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const payload = {
      nombre: form.nombre,
      nombre_archivo: form.nombre_archivo,
      categoria: 'General',
      descripcion: form.descripcion || null,
      storage_path: form.storage_path,
      orden: Number(form.orden) || 0,
      activo: form.activo,
    };

    const { error } = form.id
      ? await supabase.from('formularios').update(payload).eq('id', form.id)
      : await supabase.from('formularios').insert(payload);

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(form.id ? 'Formulario actualizado' : 'Formulario creado');
    setOpen(false);
    refrescar();
  }

  async function toggleActivo(f: Formulario) {
    const supabase = createClient();
    const { error } = await supabase
      .from('formularios')
      .update({ activo: !f.activo })
      .eq('id', f.id);
    if (error) toast.error(error.message);
    else {
      toast.success('Estado actualizado');
      refrescar();
    }
  }

  async function eliminar() {
    if (!confirmDelete) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from('formularios').delete().eq('id', confirmDelete.id);
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success('Formulario eliminado');
      setConfirmDelete(null);
      refrescar();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={abrirNuevo}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo formulario
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Orden</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Ruta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formularios.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.orden}</TableCell>
                <TableCell className="font-medium">{f.nombre}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{f.categoria}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                  {f.storage_path}
                </TableCell>
                <TableCell>
                  <Badge variant={f.activo ? 'default' : 'secondary'}>
                    {f.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => abrirEditar(f)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toggleActivo(f)}>
                    <Power className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600"
                    onClick={() => setConfirmDelete(f)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar formulario' : 'Nuevo formulario'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre del archivo</Label>
              <Input
                value={form.nombre_archivo}
                onChange={(e) => setForm({ ...form, nombre_archivo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Input
                value="General"
                readOnly
                className="bg-muted/30 text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ruta del PDF</Label>
              <Input
                value={form.storage_path}
                onChange={(e) => setForm({ ...form, storage_path: e.target.value })}
                placeholder="/formularios/archivo.pdf"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Orden</Label>
                <Input
                  type="number"
                  value={form.orden}
                  onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-end gap-2">
                <Checkbox
                  id="activo"
                  checked={form.activo}
                  onCheckedChange={(v) => setForm({ ...form, activo: Boolean(v) })}
                />
                <Label htmlFor="activo" className="cursor-pointer">
                  Activo
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={guardar} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
        title="Eliminar formulario"
        description={`¿Eliminar ${confirmDelete?.nombre}?`}
        destructive
        loading={loading}
        onConfirm={eliminar}
      />
    </div>
  );
}
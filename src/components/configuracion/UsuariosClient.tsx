'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import type { Profile, UserRole } from '@/types/database';

export function UsuariosClient({ inicial }: { inicial: Profile[] }) {
  const [usuarios, setUsuarios] = useState<Profile[]>(inicial);
  const [openCrear, setOpenCrear] = useState(false);
  const [nuevo, setNuevo] = useState({
    email: '',
    full_name: '',
    role: 'OPERADOR' as UserRole,
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<Profile | null>(null);

  async function refrescar() {
    const supabase = createClient();
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsuarios((data ?? []) as Profile[]);
  }

  async function crearUsuario() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error');
      toast.success('Usuario creado');
      setOpenCrear(false);
      setNuevo({ email: '', full_name: '', role: 'OPERADOR', password: '' });
      refrescar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function cambiarRol(u: Profile, role: UserRole) {
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({ role }).eq('id', u.id);
    if (error) toast.error(error.message);
    else {
      toast.success('Rol actualizado');
      refrescar();
    }
  }

  async function toggleActivo(u: Profile) {
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ active: !u.active })
      .eq('id', u.id);
    if (error) toast.error(error.message);
    else {
      toast.success(u.active ? 'Usuario desactivado' : 'Usuario activado');
      refrescar();
    }
  }

  async function eliminar(u: Profile) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/usuarios?id=${u.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error');
      toast.success('Usuario eliminado');
      setConfirmDelete(null);
      refrescar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpenCrear(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo usuario
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.full_name}</TableCell>
                <TableCell className="text-sm">{u.email}</TableCell>
                <TableCell>
                  <Select value={u.role} onValueChange={(v) => cambiarRol(u, v as UserRole)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMINISTRADOR">ADMINISTRADOR</SelectItem>
                      <SelectItem value="OPERADOR">OPERADOR</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant={u.active ? 'default' : 'secondary'}>
                    {u.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => toggleActivo(u)} title="Activar/Desactivar">
                    <Power className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600"
                    onClick={() => setConfirmDelete(u)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openCrear} onOpenChange={setOpenCrear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Nombre completo</Label>
              <Input
                value={nuevo.full_name}
                onChange={(e) => setNuevo({ ...nuevo, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={nuevo.email}
                onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={nuevo.role}
                onValueChange={(v) => setNuevo({ ...nuevo, role: v as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMINISTRADOR">ADMINISTRADOR</SelectItem>
                  <SelectItem value="OPERADOR">OPERADOR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contraseña temporal</Label>
              <Input
                type="password"
                value={nuevo.password}
                onChange={(e) => setNuevo({ ...nuevo, password: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCrear(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={crearUsuario} disabled={loading}>
              {loading ? 'Creando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
        title="Eliminar usuario"
        description={`¿Eliminar a ${confirmDelete?.full_name}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        loading={loading}
        onConfirm={() => confirmDelete && eliminar(confirmDelete)}
      />
    </div>
  );
}
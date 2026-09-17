export type UserRole = 'ADMINISTRADOR' | 'OPERADOR';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormularioRow {
  id: string;
  nombre: string;
  nombre_archivo: string;
  categoria: string;
  descripcion: string | null;
  storage_path: string;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ImpresionRow {
  id: string;
  user_id: string | null;
  usuario_nombre: string | null;
  usuario_email: string | null;
  formulario_id: string;
  formulario_nombre: string;
  copias: number;
  created_at: string;
}
import type { FormularioRow } from './database';

export type Formulario = FormularioRow;

export interface FormularioInput {
  nombre: string;
  nombre_archivo: string;
  categoria: string;
  descripcion?: string | null;
  storage_path: string;
  orden: number;
  activo: boolean;
}

export interface FormularioFiltros {
  busqueda: string;
  categoria: string | null;
  soloActivos: boolean;
}
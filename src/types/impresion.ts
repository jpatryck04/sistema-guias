import type { ImpresionRow } from './database';

export type Impresion = ImpresionRow;

export interface ItemImpresion {
  formularioId: string;
  formularioNombre: string;
  storagePath: string;
  copias: number;
}

export interface ImpresionConUsuario extends ImpresionRow {
  usuario_nombre: string | null;
  usuario_email: string | null;
}

export interface ProgresoImpresion {
  actual: number;
  total: number;
  formularioNombre: string;
}
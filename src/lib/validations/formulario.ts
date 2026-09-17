import { z } from 'zod';

export const formularioSchema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres').max(200),
  nombre_archivo: z.string().min(3).max(300),
  categoria: z.string().min(2).max(100),
  descripcion: z.string().max(500).optional().nullable(),
  storage_path: z
    .string()
    .min(1)
    .regex(/^\/formularios\/[^?#\r\n]+\.pdf$/i, 'Debe ser una ruta /formularios/...pdf válida'),
  orden: z.number().int().min(0).default(0),
  activo: z.boolean().default(true),
});

export type FormularioInput = z.infer<typeof formularioSchema>;

export const impresionItemSchema = z.object({
  formularioId: z.string().uuid(),
  formularioNombre: z.string().min(1),
  storagePath: z.string().min(1),
  copias: z.number().int().min(1).max(20),
});

export const impresionSchema = z.object({
  items: z.array(impresionItemSchema).min(1, 'Selecciona al menos un formulario'),
});

export type ImpresionInput = z.infer<typeof impresionSchema>;
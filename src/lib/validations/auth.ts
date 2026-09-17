import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const crearUsuarioSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  full_name: z.string().min(3, 'Nombre muy corto').max(120),
  role: z.enum(['ADMINISTRADOR', 'OPERADOR']),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;

export const actualizarUsuarioSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(3).max(120).optional(),
  role: z.enum(['ADMINISTRADOR', 'OPERADOR']).optional(),
  active: z.boolean().optional(),
});

export type ActualizarUsuarioInput = z.infer<typeof actualizarUsuarioSchema>;
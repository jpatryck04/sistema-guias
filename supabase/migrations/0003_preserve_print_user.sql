-- Conserva quién imprimió aunque la cuenta Auth sea eliminada.
ALTER TABLE public.impresiones
  ADD COLUMN IF NOT EXISTS usuario_nombre text,
  ADD COLUMN IF NOT EXISTS usuario_email text;
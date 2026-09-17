-- Alinea tablas existentes con los triggers de updated_at.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.formularios
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

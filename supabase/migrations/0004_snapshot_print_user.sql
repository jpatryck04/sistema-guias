-- Rellena automáticamente el usuario impresor antes de guardar cada impresión.
UPDATE public.impresiones AS i
SET usuario_nombre = p.full_name,
    usuario_email = p.email
FROM public.profiles AS p
WHERE p.id = i.user_id
  AND (i.usuario_nombre IS NULL OR i.usuario_email IS NULL);

CREATE OR REPLACE FUNCTION public.snapshot_print_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    SELECT p.full_name, p.email
      INTO NEW.usuario_nombre, NEW.usuario_email
    FROM public.profiles AS p
    WHERE p.id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_snapshot_print_user ON public.impresiones;
CREATE TRIGGER trg_snapshot_print_user
  BEFORE INSERT ON public.impresiones
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_print_user();

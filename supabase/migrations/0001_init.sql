-- =============================================================================
-- SISTEMA DE GESTIÓN E IMPRESIÓN DE GUÍAS DE INSPECCIÓN
-- Migración inicial
-- =============================================================================

-- 1. EXTENSIONES
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       text NOT NULL,
    full_name   text NOT NULL,
    role        text NOT NULL DEFAULT 'OPERADOR' CHECK (role IN ('ADMINISTRADOR', 'OPERADOR')),
    active      boolean NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. TABLA FORMULARIOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.formularios (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre          text NOT NULL,
    nombre_archivo  text NOT NULL,
    categoria       text NOT NULL,
    descripcion     text NULL,
    storage_path    text NOT NULL,
    orden           integer NOT NULL DEFAULT 0,
    activo          boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.formularios
    ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_formularios_categoria ON public.formularios(categoria);
CREATE INDEX IF NOT EXISTS idx_formularios_activo ON public.formularios(activo);
CREATE INDEX IF NOT EXISTS idx_formularios_nombre_trgm ON public.formularios USING gin (nombre gin_trgm_ops);

-- 4. TABLA IMPRESIONES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.impresiones (
    id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id            uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    usuario_nombre    text,
    usuario_email     text,
    formulario_id      uuid NOT NULL REFERENCES public.formularios(id) ON DELETE RESTRICT,
    formulario_nombre  text NOT NULL,
    copias             integer NOT NULL DEFAULT 1 CHECK (copias > 0),
    created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impresiones_user ON public.impresiones(user_id);
CREATE INDEX IF NOT EXISTS idx_impresiones_fecha ON public.impresiones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_impresiones_formulario ON public.impresiones(formulario_id);

-- 5. FUNCIÓN is_admin()
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'ADMINISTRADOR'
          AND active = true
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- 6. TRIGGER handle_new_user
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'OPERADOR',
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. TRIGGER set_updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_formularios_updated_at ON public.formularios;
CREATE TRIGGER trg_formularios_updated_at
    BEFORE UPDATE ON public.formularios
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formularios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impresiones ENABLE ROW LEVEL SECURITY;

-- 9. POLICIES: PROFILES
-- =============================================================================
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid() OR public.is_admin())
    WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;
CREATE POLICY "profiles_insert_admin"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 10. POLICIES: FORMULARIOS
-- =============================================================================
DROP POLICY IF EXISTS "formularios_select_auth" ON public.formularios;
CREATE POLICY "formularios_select_auth"
    ON public.formularios FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND active = true
        )
    );

DROP POLICY IF EXISTS "formularios_insert_admin" ON public.formularios;
CREATE POLICY "formularios_insert_admin"
    ON public.formularios FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "formularios_update_admin" ON public.formularios;
CREATE POLICY "formularios_update_admin"
    ON public.formularios FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "formularios_delete_admin" ON public.formularios;
CREATE POLICY "formularios_delete_admin"
    ON public.formularios FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 11. POLICIES: IMPRESIONES
-- =============================================================================
DROP POLICY IF EXISTS "impresiones_select_own_or_admin" ON public.impresiones;
CREATE POLICY "impresiones_select_own_or_admin"
    ON public.impresiones FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "impresiones_insert_own" ON public.impresiones;
CREATE POLICY "impresiones_insert_own"
    ON public.impresiones FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "impresiones_delete_admin" ON public.impresiones;
CREATE POLICY "impresiones_delete_admin"
    ON public.impresiones FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 12. PERMISOS
-- =============================================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.formularios TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.impresiones TO authenticated;
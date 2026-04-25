-- ============================================================
-- CAOV — Migración Fase 2 v2.0.0
-- Flujo de aprobación, nuevos roles, cuotas, grupo familiar
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- 1. AMPLIAR ROL EN PROFILES (jugador, profesor)
-- ============================================================
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('socio', 'admin', 'superadmin', 'jugador', 'profesor'));

-- ============================================================
-- 2. AGREGAR account_status A PROFILES
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'pendiente'
  CHECK (account_status IN ('pendiente', 'aprobado', 'rechazado'));

-- Los admins/superadmins ya creados quedan aprobados
UPDATE public.profiles
  SET account_status = 'aprobado'
  WHERE role IN ('admin', 'superadmin');

-- ============================================================
-- 3. AGREGAR CAMPOS EXTRA A PROFILES
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS discipline_id UUID REFERENCES public.disciplinas(id),
  ADD COLUMN IF NOT EXISTS tipo_socio TEXT CHECK (tipo_socio IN ('cadete', 'activo', 'grupo_familiar')),
  ADD COLUMN IF NOT EXISTS es_grupo_familiar BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id);

-- ============================================================
-- 4. TABLA: cuotas_config (valores editables por admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cuotas_config (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo        TEXT NOT NULL UNIQUE CHECK (tipo IN ('cadete', 'activo', 'grupo_familiar', 'deportiva')),
  monto       NUMERIC(10,2) NOT NULL,
  descripcion TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.cuotas_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cuotas_config_public_read" ON public.cuotas_config
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "cuotas_config_admin_write" ON public.cuotas_config
  FOR ALL USING (public.is_admin());

-- Valores iniciales según foto del cliente
INSERT INTO public.cuotas_config (tipo, monto, descripcion)
VALUES
  ('cadete',         10000.00, 'A partir de 3 años (activo en una disciplina). Hasta 17 años inclusive'),
  ('activo',         12000.00, 'A partir de 18 años inclusive'),
  ('grupo_familiar', 15000.00, 'Máximo 5 personas (solo familia directa)'),
  ('deportiva',      25000.00, 'Cuota deportiva mensual para jugadores activos en disciplinas')
ON CONFLICT (tipo) DO NOTHING;

-- ============================================================
-- 5. TABLA: grupo_familiar
-- ============================================================
CREATE TABLE IF NOT EXISTS public.grupo_familiar (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titular_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  integrante_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (titular_id, integrante_id)
);

ALTER TABLE public.grupo_familiar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grupo_familiar_select_own" ON public.grupo_familiar
  FOR SELECT USING (
    titular_id = auth.uid() OR integrante_id = auth.uid()
  );

CREATE POLICY "grupo_familiar_admin_all" ON public.grupo_familiar
  FOR ALL USING (public.is_admin());

-- ============================================================
-- 6. AMPLIAR TABLA pagos (tipo de pago)
-- ============================================================
ALTER TABLE public.pagos
  ADD COLUMN IF NOT EXISTS tipo_pago TEXT NOT NULL DEFAULT 'societaria'
  CHECK (tipo_pago IN ('societaria', 'deportiva'));

ALTER TABLE public.pagos
  ADD COLUMN IF NOT EXISTS cuota_tipo TEXT
  CHECK (cuota_tipo IN ('cadete', 'activo', 'grupo_familiar'));

ALTER TABLE public.pagos
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ============================================================
-- 7. TABLA: pagos_profesores (honorarios)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pagos_profesores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  periodo_mes     INTEGER NOT NULL CHECK (periodo_mes BETWEEN 1 AND 12),
  periodo_anio    INTEGER NOT NULL CHECK (periodo_anio >= 2024),
  monto           NUMERIC(10,2) NOT NULL,
  estado          TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'retenido')),
  concepto        TEXT,
  comprobante_url TEXT,
  fecha_pago      TIMESTAMPTZ,
  registrado_por  UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pagos_profesores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pagos_prof_select_own" ON public.pagos_profesores
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "pagos_prof_admin_all" ON public.pagos_profesores
  FOR ALL USING (public.is_admin());

-- ============================================================
-- 8. ACTUALIZAR TRIGGER handle_new_user
--    → Nuevos usuarios quedan en estado 'pendiente'
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, birth_date, dni, role, account_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    CASE 
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'birth_date')::DATE
      ELSE NULL 
    END,
    NEW.raw_user_meta_data->>'dni',
    'socio',        -- rol por defecto, admin lo cambia
    'pendiente'     -- estado por defecto
  );
  RETURN NEW;
END;
$$;

-- ============================================================
-- 9. ACTUALIZAR RLS EN profiles PARA ADMIN VER TODOS
-- ============================================================
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.is_admin());

-- Admin puede ver TODOS los perfiles (incluyendo pendientes)
CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR public.is_admin()
  );

-- ============================================================
-- 10. ACTUALIZAR is_admin() para que incluya jugador/profesor
--     con socios aprobados
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_approved()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND account_status = 'aprobado'
  );
$$;

-- ============================================================
-- 11. TRIGGER updated_at para cuotas_config
-- ============================================================
CREATE TRIGGER cuotas_config_updated_at
  BEFORE UPDATE ON public.cuotas_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- CAOV — Migración Inicial v1.0.0
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLA: profiles (extiende auth.users de Supabase)
-- ============================================================
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  birth_date   DATE,
  dni          TEXT,
  address      TEXT,
  role         TEXT NOT NULL DEFAULT 'socio' CHECK (role IN ('socio', 'admin', 'superadmin')),
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'superadmin')
    )
  );

-- ============================================================
-- FUNCIÓN: is_admin()
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  );
$$;

-- ============================================================
-- TABLA: socios
-- ============================================================
CREATE TABLE public.socios (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  numero_socio      TEXT UNIQUE NOT NULL,
  tipo_socio        TEXT NOT NULL DEFAULT 'activo' CHECK (tipo_socio IN ('activo', 'cadete', 'honorario', 'vitalicio')),
  estado            TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'moroso', 'suspendido', 'inactivo')),
  fecha_alta        DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  monto_cuota       NUMERIC(10,2) NOT NULL DEFAULT 1500.00,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.socios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "socios_select_own" ON public.socios
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "socios_admin_all" ON public.socios
  FOR ALL USING (public.is_admin());

-- Secuencia para número de socio
CREATE SEQUENCE IF NOT EXISTS socio_number_seq START 1000;

-- ============================================================
-- TABLA: pagos
-- ============================================================
CREATE TABLE public.pagos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  socio_id            UUID NOT NULL REFERENCES public.socios(id) ON DELETE CASCADE,
  periodo_mes         INTEGER NOT NULL CHECK (periodo_mes BETWEEN 1 AND 12),
  periodo_anio        INTEGER NOT NULL CHECK (periodo_anio >= 2024),
  monto               NUMERIC(10,2) NOT NULL,
  estado              TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'reembolsado')),
  metodo              TEXT CHECK (metodo IN ('mercadopago', 'efectivo', 'transferencia')),
  mp_payment_id       TEXT,
  mp_preference_id    TEXT,
  mp_external_ref     TEXT UNIQUE,
  comprobante_url     TEXT,
  fecha_pago          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pagos_select_own" ON public.pagos
  FOR SELECT USING (
    socio_id IN (SELECT id FROM public.socios WHERE profile_id = auth.uid())
  );

CREATE POLICY "pagos_admin_all" ON public.pagos
  FOR ALL USING (public.is_admin());

-- ============================================================
-- TABLA: disciplinas
-- ============================================================
CREATE TABLE public.disciplinas (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name      TEXT NOT NULL,
  category  TEXT NOT NULL DEFAULT 'Primera División',
  icon_url  TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.disciplinas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disciplinas_public_read" ON public.disciplinas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "disciplinas_admin_write" ON public.disciplinas FOR ALL USING (public.is_admin());

-- Datos iniciales
INSERT INTO public.disciplinas (name, category, sort_order) VALUES
  ('Fútbol', 'Primera División', 1),
  ('Fútbol', 'Reserva', 2),
  ('Fútbol', 'Inferiores', 3),
  ('Básquet', 'Primera División', 4),
  ('Básquet', 'U19', 5),
  ('Vóley', 'Primera Femenino', 6);

-- ============================================================
-- TABLA: jugadores
-- ============================================================
CREATE TABLE public.jugadores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disciplina_id   UUID NOT NULL REFERENCES public.disciplinas(id),
  full_name       TEXT NOT NULL,
  position        TEXT NOT NULL,
  shirt_number    INTEGER,
  birth_date      DATE,
  nationality     TEXT DEFAULT 'Argentina',
  photo_url       TEXT,
  bio             TEXT,
  is_archived     BOOLEAN NOT NULL DEFAULT FALSE,
  is_captain      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.jugadores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jugadores_public_read" ON public.jugadores FOR SELECT TO anon, authenticated USING (NOT is_archived);
CREATE POLICY "jugadores_admin_write" ON public.jugadores FOR ALL USING (public.is_admin());

-- ============================================================
-- TABLA: partidos
-- ============================================================
CREATE TABLE public.partidos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disciplina_id   UUID NOT NULL REFERENCES public.disciplinas(id),
  opponent_name   TEXT NOT NULL,
  match_date      TIMESTAMPTZ NOT NULL,
  location        TEXT NOT NULL DEFAULT 'local' CHECK (location IN ('local', 'visitante')),
  venue_name      TEXT,
  result          TEXT NOT NULL DEFAULT 'Pendiente',
  competition     TEXT,
  notes           TEXT,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.partidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partidos_public_read" ON public.partidos FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "partidos_admin_write" ON public.partidos FOR ALL USING (public.is_admin());

-- ============================================================
-- TABLA: noticias
-- ============================================================
CREATE TABLE public.noticias (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  excerpt         TEXT,
  content         TEXT NOT NULL DEFAULT '',
  image_url       TEXT,
  category        TEXT NOT NULL DEFAULT 'Institucional',
  author_id       UUID REFERENCES public.profiles(id),
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "noticias_public_read" ON public.noticias FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "noticias_admin_write" ON public.noticias FOR ALL USING (public.is_admin());

-- Auto-update slug desde title
CREATE OR REPLACE FUNCTION public.noticias_set_slug()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(
      unaccent(NEW.title), '[^a-z0-9]+', '-', 'g'
    )) || '-' || extract(epoch from NOW())::bigint::text;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================
-- TABLA: galeria
-- ============================================================
CREATE TABLE public.galeria (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url   TEXT NOT NULL,
  title       TEXT,
  event_name  TEXT,
  disciplina_id UUID REFERENCES public.disciplinas(id),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.galeria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "galeria_public_read" ON public.galeria FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "galeria_admin_write" ON public.galeria FOR ALL USING (public.is_admin());

-- ============================================================
-- TABLA: sponsors
-- ============================================================
CREATE TABLE public.sponsors (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  logo_url    TEXT NOT NULL,
  website_url TEXT,
  tier        TEXT NOT NULL DEFAULT 'plata' CHECK (tier IN ('oro', 'plata', 'bronce')),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sponsors_public_read" ON public.sponsors FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "sponsors_admin_write" ON public.sponsors FOR ALL USING (public.is_admin());

-- ============================================================
-- TABLA: productos (tienda)
-- ============================================================
CREATE TABLE public.productos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL,
  image_url       TEXT,
  category        TEXT NOT NULL DEFAULT 'camisetas' CHECK (category IN ('camisetas', 'shorts', 'accesorios')),
  is_available    BOOLEAN NOT NULL DEFAULT TRUE,
  whatsapp_link   TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "productos_public_read" ON public.productos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "productos_admin_write" ON public.productos FOR ALL USING (public.is_admin());

-- ============================================================
-- TABLA: palmares
-- ============================================================
CREATE TABLE public.palmares (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  competition     TEXT NOT NULL,
  year            INTEGER NOT NULL,
  disciplina_id   UUID REFERENCES public.disciplinas(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.palmares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "palmares_public_read" ON public.palmares FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "palmares_admin_write" ON public.palmares FOR ALL USING (public.is_admin());

-- ============================================================
-- TRIGGER: new_user_profile (crear perfil automáticamente al registrarse)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER noticias_updated_at
  BEFORE UPDATE ON public.noticias
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',       'avatars',       true,  2097152,  ARRAY['image/jpeg','image/png','image/webp']),
  ('noticias',      'noticias',      true,  5242880,  ARRAY['image/jpeg','image/png','image/webp']),
  ('galeria',       'galeria',       true,  10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('comprobantes',  'comprobantes',  false, 5242880,  ARRAY['image/jpeg','image/png','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- ---- Políticas de Storage ----

-- avatars: cualquiera puede ver, solo el dueño puede subir/borrar
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- noticias: lectura pública, escritura solo admins
CREATE POLICY "noticias_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'noticias');

CREATE POLICY "noticias_admin_write" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'noticias' AND public.is_admin())
  WITH CHECK (bucket_id = 'noticias' AND public.is_admin());

-- galeria: lectura pública, escritura solo admins
CREATE POLICY "galeria_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'galeria');

CREATE POLICY "galeria_admin_write" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'galeria' AND public.is_admin())
  WITH CHECK (bucket_id = 'galeria' AND public.is_admin());

-- comprobantes: solo el socio dueño puede ver/subir los suyos
CREATE POLICY "comprobantes_owner_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'comprobantes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "comprobantes_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'comprobantes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "comprobantes_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'comprobantes' AND public.is_admin())
  WITH CHECK (bucket_id = 'comprobantes' AND public.is_admin());

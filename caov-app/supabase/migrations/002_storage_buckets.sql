-- ============================================================
-- CAOV — Migración v1.0.1 — Storage Buckets
-- Ejecutar solo si ya corriste 001_initial_schema.sql
-- ============================================================

-- Crear los 4 buckets (ON CONFLICT DO NOTHING evita error si ya existen)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',       'avatars',       true,  2097152,  ARRAY['image/jpeg','image/png','image/webp']),
  ('noticias',      'noticias',      true,  5242880,  ARRAY['image/jpeg','image/png','image/webp']),
  ('galeria',       'galeria',       true,  10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('comprobantes',  'comprobantes',  false, 5242880,  ARRAY['image/jpeg','image/png','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Políticas de Storage
-- (DROP IF EXISTS para evitar error si ya existieran)
-- ============================================================

-- avatars
DROP POLICY IF EXISTS "avatars_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_upload"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_delete"  ON storage.objects;

CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- noticias
DROP POLICY IF EXISTS "noticias_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "noticias_admin_write"  ON storage.objects;

CREATE POLICY "noticias_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'noticias');

CREATE POLICY "noticias_admin_write" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'noticias' AND public.is_admin())
  WITH CHECK (bucket_id = 'noticias' AND public.is_admin());

-- galeria
DROP POLICY IF EXISTS "galeria_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "galeria_admin_write"   ON storage.objects;

CREATE POLICY "galeria_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'galeria');

CREATE POLICY "galeria_admin_write" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'galeria' AND public.is_admin())
  WITH CHECK (bucket_id = 'galeria' AND public.is_admin());

-- comprobantes
DROP POLICY IF EXISTS "comprobantes_owner_select" ON storage.objects;
DROP POLICY IF EXISTS "comprobantes_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "comprobantes_admin_all"    ON storage.objects;

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

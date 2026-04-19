-- ============================================================
-- CAOV — Migración v1.0.4 (Cuerpo Técnico)
-- ============================================================

CREATE TABLE public.cuerpo_tecnico (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disciplina_id   UUID NOT NULL REFERENCES public.disciplinas(id),
  full_name       TEXT NOT NULL,
  role            TEXT NOT NULL,
  photo_url       TEXT,
  bio             TEXT,
  is_archived     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cuerpo_tecnico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cuerpo_tecnico_public_read" ON public.cuerpo_tecnico FOR SELECT TO anon, authenticated USING (NOT is_archived);
CREATE POLICY "cuerpo_tecnico_admin_write" ON public.cuerpo_tecnico FOR ALL USING (public.is_admin());

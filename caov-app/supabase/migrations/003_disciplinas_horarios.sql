-- ============================================================
-- CAOV — Migración v1.0.2 — Horarios Disciplinas
-- ============================================================

-- Agregar la columna schedules a la tabla disciplinas (si no existe)
ALTER TABLE public.disciplinas 
ADD COLUMN IF NOT EXISTS schedules TEXT;

-- Ya que la base de datos se crea a partir de las migraciones, agregar o actualizar 
-- los registros base de las disciplinas con horarios por defecto. 

UPDATE public.disciplinas SET schedules = 'Lun y Mié 18:00hs' WHERE name = 'Fútbol';
UPDATE public.disciplinas SET schedules = 'Mar y Jue 19:30hs' WHERE name = 'Básquet';
UPDATE public.disciplinas SET schedules = 'Mar y Jue 20:00hs' WHERE name = 'Vóley';

-- Insertamos las nuevas requeridas si no existen
INSERT INTO public.disciplinas (name, category, schedules, sort_order) VALUES
  ('Handball', 'Primera', 'Lun, Mié y Vie 20:30hs', 7),
  ('Patín', 'General', 'Mar y Jue 17:00hs', 8),
  ('Hockey sobre césped', 'Primera', 'Mar, Jue y Sáb 18:00hs', 9)
ON CONFLICT DO NOTHING;

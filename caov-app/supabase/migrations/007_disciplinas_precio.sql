-- ============================================================
-- Agregar precio individual por disciplina
-- ============================================================
ALTER TABLE public.disciplinas
  ADD COLUMN IF NOT EXISTS monto_mensual NUMERIC(10,2) NOT NULL DEFAULT 15000.00;

-- Eliminar el registro de 'deportiva' genérico de cuotas_config si ya no se usa
-- DELETE FROM public.cuotas_config WHERE tipo = 'deportiva';

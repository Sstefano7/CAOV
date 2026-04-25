-- ============================================================
-- 1. Vincular Jugadores con Perfiles de Usuarios
-- ============================================================
ALTER TABLE public.jugadores
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Permitir a los administradores actualizar perfiles (para cambiar rol a 'jugador')
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update" ON public.profiles
  FOR UPDATE USING (public.is_admin());

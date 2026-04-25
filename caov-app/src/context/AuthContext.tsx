import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// ============================================================
// Types
// ============================================================
export type UserRole = 'socio' | 'admin' | 'superadmin' | 'jugador' | 'profesor';
export type AccountStatus = 'pendiente' | 'aprobado' | 'rechazado';
export type TipoSocio = 'cadete' | 'activo' | 'grupo_familiar';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  dni?: string;
  address?: string;
  role: UserRole;
  account_status: AccountStatus;
  avatar_url?: string;
  tipo_socio?: TipoSocio;
  discipline_id?: string;
  es_grupo_familiar?: boolean;
  approved_at?: string;
  rejected_at?: string;
}

export interface Socio {
  id: string;
  profile_id: string;
  numero_socio: string;
  tipo_socio: 'activo' | 'cadete' | 'honorario' | 'vitalicio';
  estado: 'activo' | 'moroso' | 'suspendido' | 'inactivo';
  fecha_alta: string;
  fecha_vencimiento?: string;
  monto_cuota: number;
}

export interface CuotasConfig {
  cadete: number;
  activo: number;
  grupo_familiar: number;
  deportiva: number;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  socio: Socio | null;
  cuotasConfig: CuotasConfig | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isJugador: boolean;
  isProfesor: boolean;
  isApproved: boolean;
  accountStatus: AccountStatus | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null; status?: AccountStatus | UserRole }>;
  signUp: (data: SignUpData) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  birth_date?: string;
  dni?: string;
}

// ============================================================
// Context
// ============================================================
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [socio, setSocio] = useState<Socio | null>(null);
  const [cuotasConfig, setCuotasConfig] = useState<CuotasConfig | null>(null);
  // Empieza en true hasta que obtengamos la sesión inicial
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
  const isSuperAdmin = profile?.role === 'superadmin';
  const isJugador = profile?.role === 'jugador';
  const isProfesor = profile?.role === 'profesor';
  const isApproved = profile?.account_status === 'aprobado';
  const accountStatus = profile?.account_status ?? null;

  // ── Helpers internos ──────────────────────────────────────
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn('[Auth] No se pudo cargar el perfil:', error?.message);
      return null;
    }
    return data as Profile;
  };

  const fetchSocio = async (userId: string) => {
    const { data } = await supabase
      .from('socios')
      .select('*')
      .eq('profile_id', userId)
      .maybeSingle();
    return data as Socio | null;
  };

  const fetchCuotasConfig = async () => {
    const { data } = await supabase.from('cuotas_config').select('tipo, monto');
    if (data) {
      const config: Partial<CuotasConfig> = {};
      data.forEach((row: { tipo: string; monto: number }) => {
        config[row.tipo as keyof CuotasConfig] = row.monto;
      });
      setCuotasConfig(config as CuotasConfig);
    }
  };

  const applySession = async (newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);

    if (newSession?.user) {
      const [p, s] = await Promise.all([
        fetchProfile(newSession.user.id),
        fetchSocio(newSession.user.id),
      ]);
      setProfile(p);
      setSocio(s);
    } else {
      setProfile(null);
      setSocio(null);
    }
  };

  // ── Inicialización ────────────────────────────────────────
  useEffect(() => {
    // Cargar cuotas en paralelo (no bloquea el auth)
    fetchCuotasConfig();

    // PATRÓN OFICIAL DE SUPABASE:
    // onAuthStateChange dispara INITIAL_SESSION primero, que es equivalente a
    // getSession() pero es el único lugar correcto para inicializar el estado.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        // Ejecutar de forma asíncrona sin bloquear el Auth de Supabase
        // Esto evita el error: 'Lock was not released within 5000ms'
        applySession(newSession).finally(() => {
          setLoading(false);
        });
      }
    );

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Acciones de Auth ──────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: translateAuthError(error.message) };
    }

    // El onAuthStateChange ya cargará el perfil en paralelo.
    // Hacemos una lectura directa para obtener el status/role actualizado.
    const p = await fetchProfile(data.user.id);

    if (p?.account_status === 'rechazado') {
      await supabase.auth.signOut();
      return {
        error: 'Tu solicitud fue rechazada por la administración del club. Dirigite a las oficinas del club.',
        status: 'rechazado' as AccountStatus,
      };
    }

    if (p?.account_status === 'pendiente') {
      return { error: null, status: 'pendiente' as AccountStatus };
    }

    // Para admins devolvemos el rol para que LoginPage pueda redirigir al panel
    if (p?.role === 'superadmin' || p?.role === 'admin') {
      return { error: null, status: p.role as AccountStatus | UserRole };
    }

    return { error: null, status: 'aprobado' as AccountStatus };
  };

  const signUp = async (data: SignUpData) => {
    const { email, password, full_name, phone, birth_date, dni } = data;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, phone, birth_date, dni }, emailRedirectTo: undefined },
    });
    if (error) return { error: translateAuthError(error.message) };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // El onAuthStateChange se encargará de limpiar el estado vía applySession(null)
  };

  const refreshProfile = async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      setProfile(p);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, socio, cuotasConfig, loading,
      isAdmin, isSuperAdmin, isJugador, isProfesor, isApproved, accountStatus,
      signIn, signUp, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

// ── Helpers ───────────────────────────────────────────────
function translateAuthError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.';
  if (msg.includes('Email not confirmed')) return 'Tu cuenta aún no fue confirmada. Contactá a la administración.';
  if (msg.includes('User already registered')) return 'Ya existe una cuenta con ese email.';
  if (msg.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('rate limit')) return 'Demasiados intentos. Esperá unos minutos.';
  return 'Ocurrió un error. Intentá de nuevo.';
}

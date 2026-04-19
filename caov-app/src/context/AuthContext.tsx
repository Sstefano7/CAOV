import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// ============================================================
// Types
// ============================================================
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  dni?: string;
  address?: string;
  role: 'socio' | 'admin' | 'superadmin';
  avatar_url?: string;
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

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  socio: Socio | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
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
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';

  // Cargar perfil desde Supabase
  const loadProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileData) {
      setProfile(profileData as Profile);

      // Cargar datos de socio
      const { data: socioData } = await supabase
        .from('socios')
        .select('*')
        .eq('profile_id', userId)
        .single();

      if (socioData) setSocio(socioData as Socio);
    }
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setSocio(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: translateAuthError(error.message) };
    return { error: null };
  };

  const signUp = async (data: SignUpData) => {
    const { email, password, full_name, phone, birth_date, dni } = data;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, phone, birth_date, dni },
      },
    });

    if (error) return { error: translateAuthError(error.message) };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSocio(null);
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, socio, loading, isAdmin,
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

// ============================================================
// Helpers
// ============================================================
function translateAuthError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.';
  if (msg.includes('Email not confirmed')) return 'Confirmá tu email antes de ingresar.';
  if (msg.includes('User already registered')) return 'Ya existe una cuenta con ese email.';
  if (msg.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('rate limit')) return 'Demasiados intentos. Esperá unos minutos.';
  return 'Ocurrió un error. Intentá de nuevo.';
}

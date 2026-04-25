import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

export default function PendingPage() {
  const { profile, signOut } = useAuth();

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <img src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80" alt="Fondo CAOV" />
        <div className="auth-bg-overlay" />
      </div>

      <div className="auth-card-wrap">
        <div className="auth-card" style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div className="auth-logo">
            <img src="/escudo.png" alt="C.A.O.V." />
            <div>
              <div className="auth-logo-name">C.A.O.V.</div>
              <div className="auth-logo-sub">Solicitud en Revisión</div>
            </div>
          </div>

          <div style={{
            fontSize: '4rem',
            marginBottom: 'var(--space-4)',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            ⏳
          </div>

          <h1 className="auth-title" style={{ fontSize: 'var(--text-2xl)' }}>
            Tu solicitud está siendo revisada
          </h1>

          <p className="auth-subtitle" style={{ lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
            Hola <strong>{profile?.full_name?.split(' ')[0] ?? 'socio'}</strong>, recibimos tu solicitud de asociación al
            <strong> Club Atlético Oro Verde</strong>.
            <br /><br />
            La administración del club la está revisando. Te contactaremos a la brevedad para completar el proceso.
          </p>

          <div style={{
            background: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            textAlign: 'left',
          }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-dark)', margin: 0 }}>
              📧 <strong>Email registrado:</strong> {profile?.email}
              <br />
              📱 <strong>Teléfono:</strong> {profile?.phone ?? 'No informado'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Link to="/" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}>
              🏠 Volver al sitio del club
            </Link>
            <button onClick={signOut} className="btn btn-outline btn-lg" style={{ justifyContent: 'center' }}>
              Cerrar sesión
            </button>
          </div>

          <p style={{
            marginTop: 'var(--space-6)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}>
            ¿Tenés alguna consulta? Visitá nuestras oficinas o escribinos.
          </p>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import './AuthPages.css';

export default function RejectedPage() {
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
              <div className="auth-logo-sub">Solicitud no Admitida</div>
            </div>
          </div>

          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🚫</div>

          <h1 className="auth-title" style={{ fontSize: 'var(--text-2xl)', color: '#dc2626' }}>
            Solicitud no admitida
          </h1>

          <p className="auth-subtitle" style={{ lineHeight: 1.7, marginBottom: 'var(--space-6)' }}>
            Tu solicitud de asociación al <strong>Club Atlético Oro Verde</strong> no fue admitida
            por la administración del club.
          </p>

          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-6)',
          }}>
            <p style={{ fontSize: 'var(--text-sm)', color: '#991b1b', margin: 0, lineHeight: 1.6 }}>
              Si considerás que esto es un error o necesitás más información sobre los motivos,
              <strong> dirigite personalmente a las oficinas del Club Atlético Oro Verde</strong>.
              Nuestro equipo administrativo te atenderá y podrá brindarte todos los detalles.
            </p>
          </div>

          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            textAlign: 'left',
          }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-light)', margin: 0 }}>
              🏢 <strong>Oficinas del Club</strong>
              <br />
              📅 Lunes a Viernes — Horario de oficina
              <br />
              📍 Oro Verde, Entre Ríos
            </p>
          </div>

          <Link to="/" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
            🏠 Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

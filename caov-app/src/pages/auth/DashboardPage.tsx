import { useAuth } from '../../context/AuthContext';
import { LogIn, User } from '../../icons';
import './AuthPages.css';

export default function DashboardPage() {
  const { profile, socio, signOut } = useAuth();

  return (
    <div className="section bg-bg">
      <div className="container" style={{ maxWidth: '800px', paddingTop: 'var(--header-total)' }}>
        <div className="section-header">
          <div>
            <div className="section-label">Área Privada</div>
            <h1 className="section-title">Panel del Socio</h1>
          </div>
          <button onClick={signOut} className="btn btn-outline">
            <LogIn size={16} /> Cerrar Sesión
          </button>
        </div>

        <div className="auth-card" style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', 
              backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <User size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-1)' }}>
                {profile?.full_name}
              </h2>
              <p style={{ color: 'var(--color-text-light)' }}>{profile?.email}</p>
            </div>
          </div>
        </div>

        {socio ? (
          <div className="auth-card">
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Carnet Digital</h3>
            <div style={{
              background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
              color: 'var(--color-white)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <p style={{ opacity: 0.8, fontSize: 'var(--text-sm)' }}>Socio {socio.tipo_socio}</p>
                <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Nº {socio.numero_socio}</p>
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <span className={`badge ${socio.estado === 'activo' ? 'badge-primary' : 'badge-outline'}`} style={{ backgroundColor: socio.estado === 'activo' ? 'var(--color-white)' : 'transparent', color: socio.estado === 'activo' ? 'var(--color-primary)' : 'var(--color-white)', borderColor: 'var(--color-white)' }}>
                    Estado: {socio.estado.toUpperCase()}
                  </span>
                </div>
              </div>
              <img src="/escudo.png" alt="CAOV" style={{ width: '80px', opacity: 0.5 }} />
            </div>
          </div>
        ) : (
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>⏳</div>
            <h3>Tu solicitud está en proceso</h3>
            <p style={{ color: 'var(--color-text-light)', marginTop: 'var(--space-2)' }}>
              Nos estamos comunicando con vos para terminar el alta de socio.
              Una vez completada verás tu carnet digital acá.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

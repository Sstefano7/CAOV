import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, Star, Users } from '../../icons';
import './AuthPages.css';

interface FormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone: string;
  birth_date: string;
  dni: string;
  accept_terms: boolean;
}

const INITIAL: FormData = {
  full_name: '',
  email: '',
  password: '',
  confirm_password: '',
  phone: '',
  birth_date: '',
  dni: '',
  accept_terms: false,
};

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>(INITIAL);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const validate = (): string | null => {
    if (!form.full_name.trim()) return 'El nombre completo es obligatorio.';
    if (!form.email.trim()) return 'El email es obligatorio.';
    if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (form.password !== form.confirm_password) return 'Las contraseñas no coinciden.';
    if (form.dni && !/^\d{7,8}$/.test(form.dni.replace(/\./g, ''))) return 'DNI inválido.';
    if (!form.accept_terms) return 'Debés aceptar los términos y condiciones.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError('');
    setLoading(true);

    const { error } = await signUp({
      email: form.email.trim(),
      password: form.password,
      full_name: form.full_name.trim(),
      phone: form.phone || undefined,
      birth_date: form.birth_date || undefined,
      dni: form.dni || undefined,
    });

    setLoading(false);

    if (error) {
      setError(error);
    } else {
      setSuccess(true);
      // Redirigir al login tras 5 segundos
      setTimeout(() => navigate('/login'), 5000);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-bg">
          <img src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80" alt="" />
          <div className="auth-bg-overlay" />
        </div>
        <div className="auth-card-wrap">
          <div className="auth-card auth-success-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🎉</div>
            <h2 className="auth-title">¡Solicitud enviada!</h2>
            <p className="auth-subtitle" style={{ lineHeight: 1.7 }}>
              Tu solicitud de asociación al <strong>C.A.O.V.</strong> fue recibida correctamente.
              <br /><br />
              La <strong>administración del club</strong> revisará tu solicitud y te contactará
              para informarte sobre tu aprobación.
            </p>
            <div style={{
              background: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              margin: 'var(--space-6) 0',
            }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-dark)', margin: 0 }}>
                📧 Se te notificará en: <strong>{form.email}</strong>
              </p>
            </div>
            <Link to="/" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              Volver al inicio
            </Link>
            <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Redirigiendo al login en unos segundos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <img src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80" alt="Fondo CAOV" />
        <div className="auth-bg-overlay" />
      </div>

      <div className="auth-card-wrap">
        <div className="auth-card auth-card-wide">
          {/* Logo */}
          <div className="auth-logo">
            <img src="/escudo.png" alt="C.A.O.V." />
            <div>
              <div className="auth-logo-name">C.A.O.V.</div>
              <div className="auth-logo-sub">Asociate al Club</div>
            </div>
          </div>

          <h1 className="auth-title">Crear cuenta de socio</h1>
          <p className="auth-subtitle">Completá tus datos para asociarte</p>

          {error && <div className="auth-error" role="alert">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-name" className="form-label">Nombre completo *</label>
                <input id="reg-name" type="text" className="form-input" placeholder="Juan Pérez"
                  value={form.full_name} onChange={set('full_name')} required />
              </div>
              <div className="form-group">
                <label htmlFor="reg-dni" className="form-label">DNI</label>
                <input id="reg-dni" type="text" className="form-input" placeholder="30.000.000"
                  value={form.dni} onChange={set('dni')} inputMode="numeric" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-email" className="form-label">Email *</label>
                <input id="reg-email" type="email" className="form-input" placeholder="tu@email.com"
                  value={form.email} onChange={set('email')} required autoComplete="email" />
              </div>
              <div className="form-group">
                <label htmlFor="reg-phone" className="form-label">Teléfono</label>
                <input id="reg-phone" type="tel" className="form-input" placeholder="(343) 15-XXX-XXXX"
                  value={form.phone} onChange={set('phone')} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-birth" className="form-label">Fecha de nacimiento</label>
                <input id="reg-birth" type="date" className="form-input"
                  value={form.birth_date} onChange={set('birth_date')} max={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            <div className="form-divider">Contraseña</div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-pass" className="form-label">Contraseña *</label>
                <div className="input-icon-wrap">
                  <input id="reg-pass" type={showPass ? 'text' : 'password'} className="form-input"
                    placeholder="Mínimo 6 caracteres" value={form.password} onChange={set('password')} required />
                  <button type="button" className="input-icon-btn" onClick={() => setShowPass(s => !s)}>
                    <Eye size={18} />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reg-confirm" className="form-label">Repetir contraseña *</label>
                <input id="reg-confirm" type={showPass ? 'text' : 'password'} className="form-input"
                  placeholder="Repetí la contraseña" value={form.confirm_password} onChange={set('confirm_password')} required />
              </div>
            </div>

            <label className="form-checkbox">
              <input type="checkbox" id="reg-terms" checked={form.accept_terms} onChange={set('accept_terms')} />
              <span>
                Acepto los <a href="#" className="text-link">Términos y Condiciones</a> y la{' '}
                <a href="#" className="text-link">Política de Privacidad</a> del C.A.O.V.
              </span>
            </label>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : <><Star size={18} /> Solicitar asociación</>}
            </button>
          </form>

          <div className="auth-divider">
            <span>¿Ya tenés cuenta?</span>
          </div>

          <Link to="/login" className="btn btn-secondary btn-lg auth-submit">
            <Users size={16} /> Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

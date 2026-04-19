import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, LogIn, Star } from '../../icons';
import './AuthPages.css';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from ?? '/mi-cuenta';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(form.email.trim(), form.password);

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <img
          src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80"
          alt="Fondo CAOV"
        />
        <div className="auth-bg-overlay" />
      </div>

      <div className="auth-card-wrap">
        <div className="auth-card">
          {/* Logo */}
          <div className="auth-logo">
            <img src="/escudo.png" alt="C.A.O.V." />
            <div>
              <div className="auth-logo-name">C.A.O.V.</div>
              <div className="auth-logo-sub">Área de Socios</div>
            </div>
          </div>

          <h1 className="auth-title">Iniciá sesión</h1>
          <p className="auth-subtitle">Accedé a tu panel de socio</p>

          {error && (
            <div className="auth-error" role="alert">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="tu@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Contraseña
                <Link to="/recuperar-password" className="form-label-link">
                  ¿La olvidaste?
                </Link>
              </label>
              <div className="input-icon-wrap">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPass(s => !s)}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  <LogIn size={18} /> Ingresar
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>¿Todavía no sos socio?</span>
          </div>

          <Link to="/registro" className="btn btn-secondary btn-lg auth-submit">
            <Star size={16} /> Asociarme al club
          </Link>
        </div>
      </div>
    </div>
  );
}

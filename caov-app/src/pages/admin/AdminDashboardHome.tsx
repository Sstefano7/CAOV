import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import './Admin.css';

interface Stats {
  totalUsuarios: number;
  pendientes: number;
  socios: number;
  morosos: number;
}

export default function AdminDashboardHome() {
  const [stats, setStats] = useState<Stats>({ totalUsuarios: 0, pendientes: 0, socios: 0, morosos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: total }, { count: pendientes }, { count: socios }, { count: morosos }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('account_status', 'pendiente'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('account_status', 'aprobado'),
        supabase.from('socios').select('*', { count: 'exact', head: true }).eq('estado', 'moroso'),
      ]);

      setStats({
        totalUsuarios: total ?? 0,
        pendientes: pendientes ?? 0,
        socios: socios ?? 0,
        morosos: morosos ?? 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const quickActions = [
    { label: 'Aprobar usuarios', href: '/admin/usuarios', icon: '👥', color: '#16a34a', desc: 'Gestionar solicitudes pendientes' },
    { label: 'Gestionar cuotas', href: '/admin/cuotas', icon: '💰', color: '#2563eb', desc: 'Registrar y revisar pagos' },
    { label: 'Publicar noticia', href: '/admin/noticias', icon: '📰', color: '#9333ea', desc: 'Crear y editar noticias' },
    { label: 'Subir fotos', href: '/admin/galeria', icon: '📸', color: '#ea580c', desc: 'Administrar galería del club' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🏠 Panel de Control</h1>
          <p className="admin-page-subtitle">Bienvenido al panel de administración del C.A.O.V.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat-icon">👤</div>
          <div className="admin-stat-value">{loading ? '—' : stats.totalUsuarios}</div>
          <div className="admin-stat-label">Usuarios totales</div>
        </div>
        <div className="admin-stat" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="admin-stat-icon">⏳</div>
          <div className="admin-stat-value" style={{ color: '#92400e' }}>{loading ? '—' : stats.pendientes}</div>
          <div className="admin-stat-label">Solicitudes pendientes</div>
        </div>
        <div className="admin-stat" style={{ borderLeft: '4px solid #16a34a' }}>
          <div className="admin-stat-icon">✅</div>
          <div className="admin-stat-value" style={{ color: '#14532d' }}>{loading ? '—' : stats.socios}</div>
          <div className="admin-stat-label">Socios activos</div>
        </div>
        <div className="admin-stat" style={{ borderLeft: '4px solid #dc2626' }}>
          <div className="admin-stat-icon">❌</div>
          <div className="admin-stat-value" style={{ color: '#7f1d1d' }}>{loading ? '—' : stats.morosos}</div>
          <div className="admin-stat-label">Socios morosos</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">⚡ Acciones rápidas</h2>
        </div>
        <div className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            {quickActions.map(action => (
              <Link
                key={action.href}
                to={action.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-lg)',
                  border: `1px solid ${action.color}22`,
                  background: `${action.color}08`,
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '2rem' }}>{action.icon}</span>
                <span style={{ fontWeight: 700, color: action.color, fontSize: 'var(--text-base)' }}>
                  {action.label}
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {action.desc}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {stats.pendientes > 0 && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4) var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
        }}>
          <div>
            <strong style={{ color: '#92400e' }}>
              ⚠️ Hay {stats.pendientes} solicitud{stats.pendientes > 1 ? 'es' : ''} de socio pendiente{stats.pendientes > 1 ? 's' : ''}
            </strong>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: '#92400e' }}>
              Revisalas para aprobar o rechazar el acceso.
            </p>
          </div>
          <Link to="/admin/usuarios" className="btn btn-sm" style={{ background: '#92400e', color: 'white', whiteSpace: 'nowrap' }}>
            Ver solicitudes →
          </Link>
        </div>
      )}
    </div>
  );
}

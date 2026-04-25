import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Inicio', href: '/admin', icon: '🏠' },
  { label: 'Usuarios', href: '/admin/usuarios', icon: '👥' },
  { label: 'Cuotas', href: '/admin/cuotas', icon: '💰' },
  { label: 'Config. Cuotas', href: '/admin/cuotas-config', icon: '⚙️' },
  { label: 'Noticias', href: '/admin/noticias', icon: '📰' },
  { label: 'Galería', href: '/admin/galeria', icon: '📸' },
  { label: 'Jugadores', href: '/admin/jugadores', icon: '⚽' },
  { label: 'Logros y Títulos', href: '/admin/logros', icon: '🏆' },
  { label: 'Tienda', href: '/admin/tienda', icon: '🛍️' },
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar-header">
          <img src="/escudo.png" alt="CAOV" className="admin-sidebar-logo" />
          <div>
            <div className="admin-sidebar-club">C.A.O.V.</div>
            <div className="admin-sidebar-sub">Panel Admin</div>
          </div>
        </div>

        <nav className="admin-nav">
          {sidebarItems.map(item => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/admin'}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge != null && (
                <span className="admin-nav-badge">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-user-avatar">
              {profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div>
              <div className="admin-user-name">{profile?.full_name}</div>
              <div className="admin-user-role">
                {profile?.role === 'superadmin' ? 'Super Admin' : 'Administrador'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            <Link to="/" className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
              🌐 Sitio
            </Link>
            <button onClick={handleSignOut} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
              🚪 Salir
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <button
            className="admin-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <span className="admin-topbar-title">Panel de Administración — C.A.O.V.</span>
          <Link to="/" className="btn btn-ghost btn-sm">🌐 Ver sitio</Link>
        </header>

        {/* Page content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Menu, X, ChevronDown,
  LogIn, Star, User, Settings
} from '../../icons';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

interface NavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string; icon?: React.ReactNode }[];
}

const navItems: NavItem[] = [
  { label: 'Noticias', href: '/noticias' },
  {
    label: 'Deportes',
    children: [
      { label: 'Plantel Fútbol', href: '/plantel?d=futbol', icon: <span style={{ fontSize: '1.2em' }}>⚽</span> },
      { label: 'Plantel Básquet', href: '/plantel?d=basquet', icon: <span style={{ fontSize: '1.2em' }}>🏀</span> },
      { label: 'Plantel Vóley', href: '/plantel?d=voley', icon: <span style={{ fontSize: '1.2em' }}>🏐</span> },
      { label: 'Plantel Handball', href: '/plantel?d=handball', icon: <span style={{ fontSize: '1.2em' }}>🤾‍♂️</span> },
      { label: 'Plantel Patín', href: '/plantel?d=patin', icon: <span style={{ fontSize: '1.2em' }}>⛸️</span> },
      { label: 'Plantel Hockey', href: '/plantel?d=hockey', icon: <span style={{ fontSize: '1.2em' }}>🏑</span> },
      { label: 'Fixture / Resultados', href: '/fixture', icon: <span style={{ fontSize: '1.2em' }}>📅</span> },
    ],
  },
  {
    label: 'Club',
    children: [
      { label: 'Historia', href: '/historia', icon: <span>📜</span> },
      { label: 'Logros y Títulos', href: '/logros', icon: <span>🏆</span> },
      { label: 'Galería', href: '/galeria', icon: <span>📸</span> },
      { label: 'Sponsors', href: '/sponsors', icon: <span>🤝</span> },
    ],
  },
  { label: 'Tienda', href: '/tienda' },
];

export default function Header() {
  const { user, isAdmin, profile, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
      {/* Top Ribbon */}
      <div className="header-ribbon">
        <div className="container">
          <div className="ribbon-inner">
            <span className="ribbon-text">
              🟢⚪ <strong>PRÓXIMOS PARTIDOS</strong> — Sábado 20/04 · Fútbol vs Atlético Crespo · 16:00hs (LOCAL)
            </span>
            <div className="ribbon-actions">
              <Link to="/fixture" className="ribbon-link">Ver fixture completo →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="header-nav" ref={dropdownRef}>
        <div className="container">
          <div className="nav-inner">
            {/* Logo */}
            <Link to="/" className="nav-logo" aria-label="Club Atlético Oro Verde - Inicio">
              <img src="/escudo.png" alt="Escudo C.A.O.V." className="nav-logo-img" />
              <div className="nav-logo-text">
                <span className="nav-logo-name">C.A.O.V.</span>
                <span className="nav-logo-sub">Club Atlético Oro Verde</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <ul className="nav-menu">
              {navItems.map((item) => (
                <li key={item.label} className="nav-item">
                  {item.children ? (
                    <>
                      <button
                        className={`nav-link nav-link--dropdown ${openDropdown === item.label ? 'active' : ''}`}
                        onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                        aria-expanded={openDropdown === item.label}
                      >
                        {item.label}
                        <ChevronDown size={14} className={`nav-chevron ${openDropdown === item.label ? 'rotated' : ''}`} />
                      </button>
                      {openDropdown === item.label && (
                        <div className="nav-dropdown">
                          {item.children.map((child) => (
                            <Link key={child.href} to={child.href} className="dropdown-item">
                              {child.icon && <span className="dropdown-icon">{child.icon}</span>}
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={item.href!}
                      className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
                    >
                      {item.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>

            {/* CTA Buttons — dinámico según estado de sesión */}
            <div className="nav-actions">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="btn btn-primary btn-sm">
                      <Settings size={14} /> Panel Admin
                    </Link>
                  )}
                  <Link to="/mi-cuenta" className="btn btn-ghost btn-sm nav-btn-login">
                    <User size={15} />
                    {profile?.full_name?.split(' ')[0] ?? 'Mi Cuenta'}
                  </Link>
                  <button onClick={signOut} className="btn btn-outline btn-sm" style={{ padding: '0 var(--space-3)' }}>
                    <LogIn size={14} /> Salir
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost btn-sm nav-btn-login">
                    <LogIn size={15} /> Ingresar
                  </Link>
                  <Link to="/registro" className="btn btn-primary btn-sm">
                    <Star size={14} /> Hacete Socio
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="nav-hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menú"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-inner">
            <MobileNav items={navItems} />
            <div className="mobile-cta">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                      <Settings size={16} /> Panel Admin
                    </Link>
                  )}
                  <Link to="/mi-cuenta" className="btn btn-secondary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                    <User size={16} /> Mi Cuenta
                  </Link>
                  <button onClick={signOut} className="btn btn-outline btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                    <LogIn size={16} /> Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-secondary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                    <LogIn size={16} /> Ingresar
                  </Link>
                  <Link to="/registro" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                    <Star size={16} /> Hacete Socio
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className="mobile-nav">
      {items.map((item) => (
        <li key={item.label} className="mobile-nav-item">
          {item.children ? (
            <>
              <button
                className="mobile-nav-link mobile-nav-link--parent"
                onClick={() => setOpen(open === item.label ? null : item.label)}
              >
                {item.label}
                <ChevronDown size={16} className={open === item.label ? 'rotated' : ''} />
              </button>
              {open === item.label && (
                <ul className="mobile-nav-sub">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link to={child.href} className="mobile-nav-link">
                        {child.icon} {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <Link to={item.href!} className="mobile-nav-link">{item.label}</Link>
          )}
        </li>
      ))}
    </ul>
  );
}

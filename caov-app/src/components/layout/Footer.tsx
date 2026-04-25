import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Twitter, MapPin, Phone, Mail } from '../../icons';
import './Footer.css';

const footerLinks = {
  club: [
    { label: 'Historia', href: '/historia' },
    { label: 'Logros', href: '/logros' },
    { label: 'Galería', href: '/galeria' },
    { label: 'Sponsors', href: '/sponsors' },
  ],
  deportes: [
    { label: 'Plantel Fútbol', href: '/plantel?d=futbol' },
    { label: 'Plantel Básquet', href: '/plantel?d=basquet' },
    { label: 'Plantel Vóley', href: '/plantel?d=voley' },
    { label: 'Fixture & Resultados', href: '/fixture' },
  ],
  socios: [
    { label: 'Hacete Socio', href: '/registro' },
    { label: 'Panel del Socio', href: '/mi-cuenta' },
    { label: 'Estado de Cuota', href: '/mi-cuenta/cuotas' },
    { label: 'Carnet Digital', href: '/mi-cuenta/carnet' },
  ],
};

const socialLinks = [
  { icon: <Instagram size={20} />, label: 'Instagram', href: 'https://www.instagram.com/caoroverde' },
  { icon: <Facebook size={20} />, label: 'Facebook', href: 'https://www.facebook.com/caovoficial/' },
  { icon: <Youtube size={20} />, label: 'YouTube', href: 'https://www.youtube.com/@clubatleticooroverde6575' },
  //{ icon: <Twitter size={20} />, label: 'Twitter / X', href: 'https://twitter.com' },
];


export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <img src="/escudo.png" alt="Escudo C.A.O.V." className="footer-logo-img" />
                <div className="footer-logo-text">
                  <span className="footer-logo-name">C.A.O.V.</span>
                  <span className="footer-logo-sub">Club Atlético Oro Verde</span>
                </div>
              </Link>
              <p className="footer-tagline">
                Más que un club. Una familia verde y blanca con historia, pasión y orgullo desde 1961.
              </p>
              <div className="footer-social">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn"
                    aria-label={s.label}
                    title={s.label}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div className="footer-links-col">
              <h4 className="footer-col-title">El Club</h4>
              <ul className="footer-link-list">
                {footerLinks.club.map((l) => (
                  <li key={l.href}>
                    <Link to={l.href} className="footer-link">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-col-title">Deportes</h4>
              <ul className="footer-link-list">
                {footerLinks.deportes.map((l) => (
                  <li key={l.href}>
                    <Link to={l.href} className="footer-link">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-col-title">Socios</h4>
              <ul className="footer-link-list">
                {footerLinks.socios.map((l) => (
                  <li key={l.href}>
                    <Link to={l.href} className="footer-link">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="footer-links-col">
              <h4 className="footer-col-title">Contacto</h4>
              <ul className="footer-contact-list">
                <li>
                  <MapPin size={14} />
                  <span>Los Jacarandaes 54, Oro Verde, Entre Ríos</span>
                </li>
                <li>
                  <Phone size={14} />
                  <span>(0343) 4XXX-XXXX</span>
                </li>
                <li>
                  <Mail size={14} />
                  <a href="mailto:info@caov.com.ar" className="footer-link">info@caov.com.ar</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <p className="footer-copyright">
              © {currentYear} Club Atlético Oro Verde. Todos los derechos reservados.
            </p>
            <div className="footer-legal">
              <a href="#" className="footer-link-sm">Política de Privacidad</a>
              <span className="dot-separator" />
              <a href="#" className="footer-link-sm">Términos de Uso</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

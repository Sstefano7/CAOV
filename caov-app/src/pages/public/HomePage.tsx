import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Calendar, MapPin, Trophy,
  Star, Users, Newspaper
} from '../../icons';
import { mockNews, mockMatches, mockSponsors, mockDisciplines, mockPalmares } from '../../data/mockData';
import { formatMatchDate, formatRelativeDate, isPast } from '../../utils/dateUtils';
import './HomePage.css';

export default function HomePage() {
  const upcomingMatches = mockMatches.filter(m => !isPast(m.match_date)).slice(0, 3);
  const recentResults = mockMatches.filter(m => isPast(m.match_date) && m.result !== 'Pendiente').slice(0, 3);
  const featuredMatch = upcomingMatches[0];
  const latestNews = mockNews.slice(0, 4);
  const activeSponsors = mockSponsors.filter(s => s.is_active);

  return (
    <div className="home-page">
      {/* ======= HERO SECTION ======= */}
      <section className="hero" id="inicio">
        <div className="hero-bg">
          <img
            src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1600&q=85"
            alt="Estadio C.A.O.V."
            className="hero-bg-img"
          />
          <div className="hero-overlay" />
        </div>

        <div className="container hero-content">
          <div className="hero-badge animate-fade-in-up">
            <span>⚽</span> Temporada 2026 en Marcha
          </div>

          <h1 className="hero-title animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Club Atlético<br />
            <span className="hero-title-accent">Oro Verde</span>
          </h1>

          <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Pasión, esfuerzo y compromiso. Nuestra cancha, nuestra gente, nuestro orgullo.
          </p>

          <div className="hero-actions animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link to="/registro" className="btn btn-white btn-lg">
              <Star size={18} />
              Hacete Socio
            </Link>
            <Link to="/noticias" className="btn btn-outline-white btn-lg">
              <Newspaper size={18} />
              Últimas Noticias
            </Link>
          </div>
        </div>

        {/* Match Ticker */}
        {featuredMatch && (
          <div className="hero-ticker">
            <div className="container">
              <div className="ticker-inner">
                <div className="ticker-label">
                  <Calendar size={14} />
                  Próximo Partido
                </div>
                <div className="ticker-match">
                  <span className="ticker-team">C.A.O.V.</span>
                  <div className="ticker-vs">
                    <span className="vs-text">vs</span>
                    <div className="ticker-date">
                      {formatMatchDate(featuredMatch.match_date)}
                    </div>
                  </div>
                  <span className="ticker-team">{featuredMatch.opponent_name}</span>
                </div>
                <div className="ticker-meta">
                  <span className={`ticker-location ${featuredMatch.location}`}>
                    {featuredMatch.location === 'local' ? '🏠 Local' : '✈️ Visitante'}
                  </span>
                  {featuredMatch.venue_name && (
                    <span className="ticker-venue">
                      <MapPin size={12} /> {featuredMatch.venue_name}
                    </span>
                  )}
                </div>
                <Link to="/fixture" className="btn btn-primary btn-sm">
                  Ver Fixture <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ======= STATS BAR ======= */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            {[
              { value: '65+', label: 'Años de Historia', icon: <Trophy size={22} /> },
              { value: '320+', label: 'Socios Activos', icon: <Users size={22} /> },
              { value: '6', label: 'Disciplinas Deportivas', icon: <Star size={22} /> },
              { value: '12', label: 'Títulos Regionales', icon: <Trophy size={22} /> },
            ].map((stat) => (
              <div key={stat.label} className="stat-item">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= LATEST NEWS ======= */}
      <section className="section bg-white" id="noticias">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-label">Información</div>
              <h2 className="section-title">Últimas Noticias</h2>
            </div>
            <Link to="/noticias" className="btn btn-secondary btn-sm">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          <div className="news-grid stagger">
            {/* Featured news - large card */}
            <Link to={`/noticias/${latestNews[0]?.slug}`} className="news-card-featured animate-fade-in-up">
              <div className="news-card-featured-img">
                <img src={latestNews[0]?.image_url} alt={latestNews[0]?.title} />
                <div className="news-card-featured-overlay" />
              </div>
              <div className="news-card-featured-body">
                <span className="badge badge-primary">{latestNews[0]?.category}</span>
                <h3 className="news-card-featured-title">{latestNews[0]?.title}</h3>
                <p className="news-card-featured-excerpt">{latestNews[0]?.excerpt}</p>
                <div className="news-card-date">{formatRelativeDate(latestNews[0]?.published_at || '')}</div>
              </div>
            </Link>

            {/* Side news - smaller cards */}
            <div className="news-side-list">
              {latestNews.slice(1).map((article) => (
                <Link key={article.id} to={`/noticias/${article.slug}`} className="news-card-side animate-fade-in-up">
                  <div className="news-card-side-img">
                    <img src={article.image_url} alt={article.title} />
                  </div>
                  <div className="news-card-side-body">
                    <span className="badge badge-outline">{article.category}</span>
                    <h4 className="news-card-side-title">{article.title}</h4>
                    <div className="news-card-date">{formatRelativeDate(article.published_at || '')}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======= DISCIPLINES ======= */}
      <section className="section disciplines-section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-label" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ background: 'rgba(255,255,255,0.4)', marginRight: '8px', display: 'inline-block', width: '24px', height: '2px', verticalAlign: 'middle' }} />
                Deportes
              </div>
              <h2 className="section-title section-title-on-dark">Nuestras Disciplinas</h2>
            </div>
            <Link to="/plantel" className="btn btn-outline-white btn-sm">
              Ver Plantel <ArrowRight size={14} />
            </Link>
          </div>

          <div className="disciplines-grid">
            {[
              { icon: '⚽', name: 'Fútbol', desc: 'Primera · Reserva · Inferiores', schedule: 'Lun, Mié y Vie - 18 a 20hs', href: '/plantel?d=futbol', bg: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80' },
              { icon: '🏐', name: 'Vóley', desc: 'Primera Femenino · Mixto', schedule: 'Mar y Jue - 20 a 22hs', href: '/plantel?d=voley', bg: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80' },
              { icon: '🤾‍♂️', name: 'Handball', desc: 'Masculino · Femenino', schedule: 'Mié y Vie - 19:30 a 21hs', href: '/plantel?d=handball', bg: '/images/handball.png' },
              { icon: '🏀', name: 'Básquet', desc: 'Primera · U19', schedule: 'Mar, Jue y Sáb - 18:30 a 20:30', href: '/plantel?d=basquet', bg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80' },
              { icon: '⛸️', name: 'Patín', desc: 'Artístico · Competición', schedule: 'Lun y Mié - 17 a 19hs', href: '/plantel?d=patin', bg: '/images/patin.png' },
              { icon: '🏑', name: 'Hockey sobre césped', desc: 'Primera Femenino', schedule: 'Mar, Jue y Sáb - 17:30 a 19:30', href: '/plantel?d=hockey', bg: '/images/hockey.png' },
            ].map((disc) => (
              <Link key={disc.name} to={disc.href} className="discipline-card">
                <img src={disc.bg} alt={disc.name} className="discipline-bg" />
                <div className="discipline-overlay" />
                <div className="discipline-content">
                  <span className="discipline-icon">{disc.icon}</span>
                  <h3 className="discipline-name">{disc.name}</h3>
                  <p className="discipline-desc">{disc.desc}</p>
                  <p style={{ fontSize: '0.85rem', color: '#5fdf8a', marginTop: '6px', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <Calendar size={14} /> {disc.schedule}
                  </p>
                  <span className="discipline-cta" style={{ marginTop: 'var(--space-4)' }}>Ver Detalle <ArrowRight size={14} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======= FIXTURE / RESULTS ======= */}
      <section className="section bg-white" id="fixture">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-label">Actividad Deportiva</div>
              <h2 className="section-title">Partidos & Resultados</h2>
            </div>
            <Link to="/fixture" className="btn btn-secondary btn-sm">
              Fixture completo <ArrowRight size={14} />
            </Link>
          </div>

          <div className="fixture-two-col">
            {/* Upcoming */}
            <div>
              <h3 className="fixture-col-title">
                <Calendar size={16} /> Próximos Partidos
              </h3>
              <div className="match-list">
                {upcomingMatches.length > 0 ? upcomingMatches.map((match) => (
                  <div key={match.id} className="match-item">
                    <div className="match-discipline-badge">{match.discipline?.name}</div>
                    <div className="match-teams">
                      <div className="match-team-home">
                        <img src="/escudo.png" alt="CAOV" className="match-team-logo" />
                        <span>C.A.O.V.</span>
                      </div>
                      <div className="match-center">
                        <div className="match-vs-box">
                          <div className="match-score-pending">VS</div>
                          <div className="match-date-small">{formatMatchDate(match.match_date)}</div>
                        </div>
                      </div>
                      <div className="match-team-away">
                        <span>{match.opponent_name}</span>
                        <div className="match-team-placeholder-logo">{match.opponent_name.charAt(0)}</div>
                      </div>
                    </div>
                    <div className="match-meta">
                      <span className={`match-location-tag ${match.location}`}>
                        {match.location === 'local' ? '🏠 Local' : '✈️ Visitante'}
                      </span>
                      {match.venue_name && <span className="match-venue">{match.venue_name}</span>}
                    </div>
                  </div>
                )) : (
                  <div className="empty-state" style={{ padding: 'var(--space-12) var(--space-4)' }}>
                    <div className="empty-state-icon">📅</div>
                    <p className="empty-state-title" style={{ fontSize: 'var(--text-base)' }}>
                      ¡El fixture se sorteará pronto!
                    </p>
                    <p className="empty-state-text" style={{ fontSize: 'var(--text-sm)' }}>
                      Mantente atento a nuestras redes.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Results */}
            <div>
              <h3 className="fixture-col-title">
                <Trophy size={16} /> Últimos Resultados
              </h3>
              <div className="match-list">
                {recentResults.length > 0 ? recentResults.map((match) => {
                  const [goalsHome, goalsAway] = match.result.split('-').map(Number);
                  const resultClass = goalsHome > goalsAway ? 'win' : goalsHome < goalsAway ? 'loss' : 'draw';
                  return (
                    <div key={match.id} className="match-item">
                      <div className="match-discipline-badge">{match.discipline?.name}</div>
                      <div className="match-teams">
                        <div className="match-team-home">
                          <img src="/escudo.png" alt="CAOV" className="match-team-logo" />
                          <span>C.A.O.V.</span>
                        </div>
                        <div className="match-center">
                          <div className={`match-result-box result-${resultClass}`}>
                            {match.result}
                          </div>
                          <div className="match-date-small">{formatMatchDate(match.match_date)}</div>
                        </div>
                        <div className="match-team-away">
                          <span>{match.opponent_name}</span>
                          <div className="match-team-placeholder-logo">{match.opponent_name.charAt(0)}</div>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="empty-state" style={{ padding: 'var(--space-12) var(--space-4)' }}>
                    <div className="empty-state-icon">🏆</div>
                    <p className="empty-state-title" style={{ fontSize: 'var(--text-base)' }}>
                      Aún no hay resultados
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======= MEMBERSHIP CTA ======= */}
      <section className="membership-cta-section">
        <div className="membership-cta-bg">
          <img
            src="https://images.unsplash.com/photo-1551958219-acbc608b0a5b?w=1400&q=80"
            alt="Sé parte del club"
          />
          <div className="membership-cta-overlay" />
        </div>
        <div className="container membership-cta-content">
          <div className="membership-cta-card">
            <div className="section-label" style={{ fontSize: '0.7rem' }}>
              Familia Verde & Blanca
            </div>
            <h2 className="membership-cta-title">Hacete Socio del C.A.O.V.</h2>
            <p className="membership-cta-text">
              Formá parte de la historia. Accedé a beneficios exclusivos, carnet digital, descuentos en la tienda y mucho más.
            </p>
            <div className="membership-benefits">
              {['✅ Carnet digital válido', '✅ Descuentos en tienda', '✅ Acceso a eventos exclusivos', '✅ Apoyo directo al club'].map(b => (
                <span key={b} className="membership-benefit">{b}</span>
              ))}
            </div>
            <div className="hero-actions" style={{ justifyContent: 'flex-start' }}>
              <Link to="/registro" className="btn btn-white btn-lg">
                <Star size={18} /> Asociarme Ahora
              </Link>
              <Link to="/mi-cuenta" className="btn btn-outline-white btn-lg">
                <Users size={18} /> Ya soy socio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======= PALMARES TROPHY SHOWCASE ======= */}
      <section className="section bg-white">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-label">Historia</div>
              <h2 className="section-title">Nuestros Títulos</h2>
            </div>
            <Link to="/palmares" className="btn btn-secondary btn-sm">
              Ver todo <ArrowRight size={14} />
            </Link>
          </div>

          <div className="palmares-showcase">
            {mockPalmares.slice(0, 4).map((trophy) => (
              <div key={trophy.id} className="trophy-card animate-fade-in-up">
                <div className="trophy-icon">🏆</div>
                <div className="trophy-year">{trophy.year}</div>
                <h4 className="trophy-title">{trophy.title}</h4>
                <p className="trophy-competition">{trophy.competition}</p>
                {trophy.discipline && (
                  <span className="badge badge-outline">{trophy.discipline.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= SPONSORS ======= */}
      <section className="sponsors-section">
        <div className="container">
          <div className="sponsors-header">
            <div className="section-label" style={{ color: 'var(--color-text-muted)', justifyContent: 'center' }}>
              <span style={{ background: 'var(--color-text-muted)' }} />
              Nuestros Sponsors
            </div>
          </div>
          <div className="sponsors-track-wrapper">
            <div className="sponsors-track">
              {[...activeSponsors, ...activeSponsors].map((sponsor, i) => (
                <a
                  key={`${sponsor.id}-${i}`}
                  href={sponsor.website_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sponsor-item"
                  title={sponsor.name}
                >
                  <img src={sponsor.logo_url} alt={sponsor.name} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

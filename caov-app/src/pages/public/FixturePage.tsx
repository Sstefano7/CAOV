import { useState } from 'react';
import { Calendar, MapPin, ChevronRight } from '../../icons';
import { mockMatches, mockDisciplines } from '../../data/mockData';
import { formatMatchDate, isPast } from '../../utils/dateUtils';
import './FixturePage.css';

export default function FixturePage() {
  const [activeDiscipline, setActiveDiscipline] = useState('Todos');

  const disciplines = ['Todos', ...Array.from(new Set(mockDisciplines.map(d => d.name)))];

  const filtered = mockMatches.filter(m =>
    activeDiscipline === 'Todos' || m.discipline?.name === activeDiscipline
  );

  const currentDisciplines = activeDiscipline === 'Todos' 
    ? mockDisciplines 
    : mockDisciplines.filter(d => d.name === activeDiscipline);

  const upcoming = filtered.filter(m => !isPast(m.match_date));
  const results = filtered.filter(m => isPast(m.match_date) && m.result !== 'Pendiente');

  return (
    <div>
      <div className="page-header-banner">
        <img src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1400&q=80" alt="Fixture" className="page-header-bg" style={{objectPosition:'center 70%'}} />
        <div className="page-header-overlay" />
        <div className="container page-header-content">
          <div className="section-label" style={{color:'rgba(255,255,255,0.6)'}}>
            <span style={{background:'rgba(255,255,255,0.4)'}} /> Actividad
          </div>
          <h1 className="page-header-title">Fixture & Resultados</h1>
        </div>
      </div>

      <div className="section bg-white">
        <div className="container">
          {/* Filter Tabs */}
          <div style={{marginBottom:'var(--space-10)'}}>
            <div className="tabs">
              {disciplines.map(d => (
                <button
                  key={d}
                  className={`tab ${activeDiscipline === d ? 'active' : ''}`}
                  onClick={() => setActiveDiscipline(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="fixture-sections">
            {/* Training Schedules */}
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <h2 className="fixture-section-title" style={{ color: 'var(--color-primary-dark)', borderBottom: '2px solid rgba(26,122,60,0.1)' }}>
                <Calendar size={20} /> Horarios de Entrenamiento
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                {currentDisciplines.map(d => (
                  <div key={d.id} style={{
                    background: 'var(--color-bg-section)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: 'var(--radius-lg)', 
                    padding: 'var(--space-4)'
                  }}>
                    <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                      {d.name} {d.category && <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-muted)', marginLeft: '4px' }}>• {d.category}</span>}
                    </strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                      <Calendar size={15} style={{ color: 'var(--color-primary)' }} /> 
                      {d.schedules || 'Por confirmar'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Matches */}
            <div>
              <h2 className="fixture-section-title">
                <Calendar size={20} /> Próximos Partidos
              </h2>
              {upcoming.length > 0 ? (
                <div className="fixture-table">
                  {upcoming.map(match => (
                    <div key={match.id} className="fixture-row">
                      <div className="fixture-row-discipline">
                        <span className="badge badge-outline">{match.discipline?.name}</span>
                        <span className="badge badge-ghost" style={{background:'var(--color-bg-section)',color:'var(--color-text-muted)'}}>
                          {match.discipline?.category}
                        </span>
                      </div>
                      <div className="fixture-row-teams">
                        <div className="fixture-team home">
                          <img src="/escudo.png" alt="CAOV" className="fixture-team-logo" />
                          <strong>C.A.O.V.</strong>
                        </div>
                        <div className="fixture-row-score upcoming">VS</div>
                        <div className="fixture-team away">
                          <div className="fixture-team-placeholder">{match.opponent_name.charAt(0)}</div>
                          <strong>{match.opponent_name}</strong>
                        </div>
                      </div>
                      <div className="fixture-row-info">
                        <div className="fixture-row-date">
                          <Calendar size={13} />
                          {formatMatchDate(match.match_date)}
                        </div>
                        <div className="fixture-row-venue">
                          <MapPin size={13} />
                          {match.venue_name || 'Por confirmar'}
                        </div>
                        <span className={`match-location-tag ${match.location}`}>
                          {match.location === 'local' ? '🏠 Local' : '✈️ Visitante'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📅</div>
                  <p className="empty-state-title">¡El fixture se sorteará pronto!</p>
                  <p className="empty-state-text">Seguí nuestras redes para estar al tanto.</p>
                </div>
              )}
            </div>

            {/* Results */}
            <div>
              <h2 className="fixture-section-title">
                <ChevronRight size={20} /> Resultados
              </h2>
              {results.length > 0 ? (
                <div className="fixture-table">
                  {results.map(match => {
                    const [gh, ga] = match.result.split('-').map(Number);
                    const res = gh > ga ? 'win' : gh < ga ? 'loss' : 'draw';
                    return (
                      <div key={match.id} className="fixture-row">
                        <div className="fixture-row-discipline">
                          <span className="badge badge-outline">{match.discipline?.name}</span>
                        </div>
                        <div className="fixture-row-teams">
                          <div className="fixture-team home">
                            <img src="/escudo.png" alt="CAOV" className="fixture-team-logo" />
                            <strong>C.A.O.V.</strong>
                          </div>
                          <div className={`fixture-row-score result-score result-${res}`}>
                            {match.result}
                          </div>
                          <div className="fixture-team away">
                            <div className="fixture-team-placeholder">{match.opponent_name.charAt(0)}</div>
                            <strong>{match.opponent_name}</strong>
                          </div>
                        </div>
                        <div className="fixture-row-info">
                          <div className="fixture-row-date">
                            <Calendar size={13} />
                            {formatMatchDate(match.match_date)}
                          </div>
                          {match.venue_name && (
                            <div className="fixture-row-venue">
                              <MapPin size={13} />
                              {match.venue_name}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">🏆</div>
                  <p className="empty-state-title">Aún no hay resultados disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { mockPalmares, mockDisciplines } from '../../data/mockData';
import { useState } from 'react';

export default function PalmaresPage() {
  const disciplines = ['Todos', ...Array.from(new Set(mockDisciplines.map(d => d.name)))];
  const [active, setActive] = useState('Todos');

  const filtered = active === 'Todos'
    ? mockPalmares
    : mockPalmares.filter(p => p.discipline?.name === active);

  return (
    <div>
      <div className="page-header-banner">
        <img src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1400&q=80" alt="Palmarés" className="page-header-bg" />
        <div className="page-header-overlay" />
        <div className="container page-header-content">
          <div className="section-label" style={{color:'rgba(255,255,255,0.6)'}}>
            <span style={{background:'rgba(255,255,255,0.4)'}} /> Historia
          </div>
          <h1 className="page-header-title">Palmarés</h1>
          <p className="page-header-subtitle">Los títulos y logros que escriben la historia del club</p>
        </div>
      </div>

      <div className="section bg-white">
        <div className="container">
          <div style={{marginBottom:'var(--space-10)'}}>
            <div className="tabs">
              {disciplines.map(d => (
                <button key={d} className={`tab ${active === d ? 'active' : ''}`} onClick={() => setActive(d)}>{d}</button>
              ))}
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'var(--space-5)'}}>
            {filtered.map(trophy => (
              <div key={trophy.id} className="trophy-card" style={{textDecoration:'none'}}>
                <div className="trophy-icon">🏆</div>
                <div style={{fontFamily:'var(--font-heading)',fontSize:'var(--text-3xl)',fontWeight:900,color:'var(--color-primary)'}}>{trophy.year}</div>
                <h4 style={{fontFamily:'var(--font-heading)',fontSize:'var(--text-base)',fontWeight:700,textAlign:'center',lineHeight:1.3}}>{trophy.title}</h4>
                <p style={{fontSize:'var(--text-sm)',color:'var(--color-text-muted)',textAlign:'center'}}>{trophy.competition}</p>
                {trophy.discipline && <span className="badge badge-outline">{trophy.discipline.name}</span>}
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🏆</div>
              <p className="empty-state-title">No hay títulos registrados para esta disciplina</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

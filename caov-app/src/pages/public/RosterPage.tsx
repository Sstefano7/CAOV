import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockPlayers, mockDisciplines, mockStaff } from '../../data/mockData';
import './RosterPage.css';

type Player = (typeof mockPlayers)[0];
type Staff = (typeof mockStaff)[0];

const POSITIONS: Record<string, string[]> = {
  'Fútbol': ['Arquero', 'Defensor', 'Mediocampista', 'Delantero'],
  'Básquet': ['Base', 'Escolta', 'Alero', 'Ala', 'Pívot'],
  'Vóley': ['Armadora', 'Central', 'Opuesta', 'Libero', 'Receptora'],
};

const ICONS: Record<string, string> = {
  'Fútbol': '⚽',
  'Básquet': '🏀',
  'Vóley': '🏐',
  'Handball': '🤾‍♂️',
  'Patín': '⛸️',
  'Hockey sobre césped': '🏑'
};

export default function RosterPage() {
  const [searchParams] = useSearchParams();
  const dParam = searchParams.get('d');

  const disciplineNames = useMemo(() => Array.from(new Set(mockDisciplines.map(d => d.name))), []);
  const [activeDiscipline, setActiveDiscipline] = useState(disciplineNames[0]);

  useEffect(() => {
    if (dParam) {
      const match = disciplineNames.find(n => 
        n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === dParam.toLowerCase()
      );
      if (match) {
        setActiveDiscipline(match);
      }
    }
  }, [dParam, disciplineNames]);

  const filtered = mockPlayers.filter(p => p.discipline?.name === activeDiscipline && !p.is_archived);
  const staffFiltered = mockStaff.filter(s => s.discipline?.name === activeDiscipline && !s.is_archived);
  const positions = POSITIONS[activeDiscipline] || [];

  const groupedByPosition: Record<string, Player[]> = {};
  for (const pos of positions) {
    groupedByPosition[pos] = filtered.filter(p => p.position === pos);
  }
  const ungrouped = filtered.filter(p => !positions.includes(p.position));

  return (
    <div>
      <div className="page-header-banner">
        <img src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=1400&q=80" alt="Plantel" className="page-header-bg" style={{objectPosition:'center 25%'}} />
        <div className="page-header-overlay" />
        <div className="container page-header-content">
          <div className="section-label" style={{color:'rgba(255,255,255,0.6)'}}>
            <span style={{background:'rgba(255,255,255,0.4)'}} /> Club
          </div>
          <h1 className="page-header-title">Plantel</h1>
          <p className="page-header-subtitle">Los jugadores que defienden los colores del C.A.O.V.</p>
        </div>
      </div>

      <div className="section bg-white">
        <div className="container">
          {/* Discipline Tabs */}
          <div style={{marginBottom:'var(--space-12)'}}>
            <div className="tabs">
              {disciplineNames.map(d => (
                <button
                  key={d}
                  className={`tab ${activeDiscipline === d ? 'active' : ''}`}
                  onClick={() => setActiveDiscipline(d)}
                >
                  {ICONS[d] || '🏅'} {d}
                </button>
              ))}
            </div>
          </div>

          {/* Players by Position */}
          {positions.map(pos => {
            const players = groupedByPosition[pos] || [];
            if (players.length === 0) return null;
            return (
              <div key={pos} className="roster-position-section">
                <h3 className="roster-position-title">{pos}s</h3>
                <div className="roster-grid">
                  {players.map(player => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                </div>
              </div>
            );
          })}

          {ungrouped.length > 0 && (
            <div className="roster-position-section">
              <h3 className="roster-position-title">Jugadores</h3>
              <div className="roster-grid">
                {ungrouped.map(player => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && staffFiltered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">👕</div>
              <p className="empty-state-title">No hay miembros registrados</p>
              <p className="empty-state-text">El plantel de esta disciplina se está conformando.</p>
            </div>
          )}

          {staffFiltered.length > 0 && (
            <div className="roster-position-section" style={{ marginTop: 'var(--space-12)' }}>
              <div className="section-label" style={{ marginBottom: 'var(--space-2)' }}>Staff</div>
              <h3 className="roster-position-title" style={{ fontSize: '1.75rem' }}>Cuerpo Técnico</h3>
              <div className="roster-grid">
                {staffFiltered.map(staff => (
                  <StaffCard key={staff.id} staff={staff} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="player-card">
      <div className="player-card-inner">
        <div className="player-card-img-wrap">
          {player.photo_url ? (
            <img src={player.photo_url} alt={player.full_name} className="player-card-img" />
          ) : (
            <div className="player-card-img-placeholder">
              {player.full_name.charAt(0)}
            </div>
          )}
          {player.shirt_number && (
            <div className="player-card-number">
              #{player.shirt_number}
            </div>
          )}
          <div className="player-card-overlay">
            <div className="player-card-overlay-content">
              <p className="player-overlay-position">{player.position}</p>
              <p className="player-overlay-discipline">{player.discipline?.name} — {player.discipline?.category}</p>
            </div>
          </div>
        </div>
        <div className="player-card-info">
          <h4 className="player-card-name">{player.full_name}</h4>
          <p className="player-card-position">{player.position}</p>
        </div>
      </div>
    </div>
  );
}

function StaffCard({ staff }: { staff: Staff }) {
  return (
    <div className="player-card">
      <div className="player-card-inner">
        <div className="player-card-img-wrap">
          {staff.photo_url ? (
            <img src={staff.photo_url} alt={staff.full_name} className="player-card-img" />
          ) : (
            <div className="player-card-img-placeholder">
              {staff.full_name.charAt(0)}
            </div>
          )}
          <div className="player-card-overlay">
            <div className="player-card-overlay-content">
              <p className="player-overlay-position">{staff.role}</p>
              <p className="player-overlay-discipline">{staff.discipline?.name} {staff.discipline?.category !== 'General' ? `— ${staff.discipline?.category}` : ''}</p>
            </div>
          </div>
        </div>
        <div className="player-card-info">
          <h4 className="player-card-name" style={{ color: 'var(--color-primary)' }}>{staff.full_name}</h4>
          <p className="player-card-position" style={{ fontWeight: 600 }}>{staff.role}</p>
        </div>
      </div>
    </div>
  );
}

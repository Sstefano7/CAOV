import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import './Admin.css';

interface Jugador {
  id: string;
  full_name: string;
  position: string;
  shirt_number?: number;
  birth_date?: string;
  nationality: string;
  photo_url?: string;
  bio?: string;
  is_captain: boolean;
  is_archived: boolean;
  disciplina_id: string;
  profile_id?: string;
  created_at: string;
  disciplinas?: { name: string; category: string };
}

interface Disciplina {
  id: string;
  name: string;
  category: string;
}

const EMPTY_FORM = {
  full_name: '', position: '', shirt_number: '', birth_date: '',
  nationality: 'Argentina', photo_url: '', bio: '', disciplina_id: '', is_captain: false, profile_id: '',
};

export default function JugadoresAdminPage() {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filtroDisciplina, setFiltroDisciplina] = useState('');
  const [profiles, setProfiles] = useState<{ id: string; full_name: string; email: string }[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: jugs }, { data: discs }, { data: profs }] = await Promise.all([
      supabase.from('jugadores').select('*, disciplinas(name, category)').eq('is_archived', false).order('full_name'),
      supabase.from('disciplinas').select('id, name, category').eq('is_active', true).order('sort_order'),
      supabase.from('profiles').select('id, full_name, email').eq('account_status', 'aprobado').order('full_name'),
    ]);
    if (jugs) setJugadores(jugs as unknown as Jugador[]);
    if (discs) setDisciplinas(discs as Disciplina[]);
    if (profs) setProfiles(profs);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (j: Jugador) => {
    setForm({
      full_name: j.full_name, position: j.position,
      shirt_number: j.shirt_number?.toString() ?? '', birth_date: j.birth_date ?? '',
      nationality: j.nationality ?? 'Argentina', photo_url: j.photo_url ?? '',
      bio: j.bio ?? '', disciplina_id: j.disciplina_id, is_captain: j.is_captain,
      profile_id: j.profile_id ?? '',
    });
    setEditing(j.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.disciplina_id) return alert('Nombre y disciplina son obligatorios.');
    setSaving(true);
    const payload = {
      full_name: form.full_name,
      position: form.position,
      shirt_number: form.shirt_number ? parseInt(form.shirt_number) : null,
      birth_date: form.birth_date || null,
      nationality: form.nationality,
      photo_url: form.photo_url || null,
      bio: form.bio || null,
      disciplina_id: form.disciplina_id,
      is_captain: form.is_captain,
      profile_id: form.profile_id || null,
    };
    if (editing) {
      await supabase.from('jugadores').update(payload).eq('id', editing);
    } else {
      await supabase.from('jugadores').insert(payload);
    }

    // Actualizar el rol del usuario a 'jugador' si se vinculó una cuenta
    if (form.profile_id) {
      await supabase.from('profiles').update({ role: 'jugador' }).eq('id', form.profile_id);
    }
    setShowForm(false);
    setEditing(null);
    setSaving(false);
    await fetchData();
  };

  const handleArchive = async (id: string) => {
    if (!confirm('¿Archivar este jugador?')) return;
    await supabase.from('jugadores').update({ is_archived: true }).eq('id', id);
    await fetchData();
  };

  const filtered = jugadores.filter(j =>
    !filtroDisciplina || j.disciplina_id === filtroDisciplina
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">⚽ Gestión de Jugadores</h1>
          <p className="admin-page-subtitle">Administrá los planteles de todas las disciplinas</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Agregar jugador</button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'var(--space-6)', overflowY: 'auto' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '640px', padding: 'var(--space-6)' }}>
            <h2 style={{ fontWeight: 800, marginBottom: 'var(--space-5)', fontSize: 'var(--text-xl)' }}>
              {editing ? '✏️ Editar jugador' : '➕ Nuevo jugador'}
            </h2>
            <div className="admin-form-row">
              <div>
                <label className="form-label">Usuario / Socio (Opcional) *</label>
                <select 
                  className="admin-select" 
                  value={form.profile_id} 
                  onChange={e => {
                    const sel = profiles.find(p => p.id === e.target.value);
                    setForm(f => ({ 
                      ...f, 
                      profile_id: e.target.value,
                      full_name: sel ? sel.full_name : f.full_name 
                    }));
                  }}
                >
                  <option value="">(Jugador sin cuenta / Escribir manual)</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Nombre para mostrar *</label>
                <input className="admin-input" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Ej: Lionel Messi" />
              </div>
            </div>
            <div className="admin-form-row">
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Disciplina *</label>
                <select className="admin-select" value={form.disciplina_id} onChange={e => setForm(f => ({ ...f, disciplina_id: e.target.value }))}>
                  <option value="">Seleccioná...</option>
                  {disciplinas.map(d => (
                    <option key={d.id} value={d.id}>{d.name} — {d.category}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="admin-form-row">
              <div>
                <label className="form-label">Posición</label>
                <input className="admin-input" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="Delantero, Defensor..." />
              </div>
              <div>
                <label className="form-label">Número de camiseta</label>
                <input className="admin-input" type="number" value={form.shirt_number} onChange={e => setForm(f => ({ ...f, shirt_number: e.target.value }))} min={1} max={99} />
              </div>
            </div>
            <div className="admin-form-row">
              <div>
                <label className="form-label">Fecha de nacimiento</label>
                <input className="admin-input" type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">URL de foto</label>
                <input className="admin-input" value={form.photo_url} onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_captain} onChange={e => setForm(f => ({ ...f, is_captain: e.target.checked }))} />
              <span style={{ fontWeight: 600 }}>🏆 Es capitán</span>
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : '💾 Guardar'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-filters">
          <select className="admin-select" style={{ width: 'auto' }} value={filtroDisciplina} onChange={e => setFiltroDisciplina(e.target.value)}>
            <option value="">Todas las disciplinas</option>
            {disciplinas.map(d => <option key={d.id} value={d.id}>{d.name} — {d.category}</option>)}
          </select>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {filtered.length} jugadores
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Jugador</th>
                  <th>Nº</th>
                  <th>Posición</th>
                  <th>Disciplina</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(j => (
                  <tr key={j.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        {j.photo_url
                          ? <img src={j.photo_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          : <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>👤</div>}
                        <div>
                          <div style={{ fontWeight: 700 }}>{j.full_name}</div>
                          {j.is_captain && <span style={{ fontSize: '11px', color: '#92400e' }}>🏆 Capitán</span>}
                        </div>
                      </div>
                    </td>
                    <td>{j.shirt_number ?? '—'}</td>
                    <td>{j.position || '—'}</td>
                    <td>
                      <span className="status-badge status-badge--aprobado">
                        {j.disciplinas?.name} — {j.disciplinas?.category}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-btns">
                        <button className="btn-edit" onClick={() => openEdit(j)}>✏️</button>
                        <button className="btn-delete" onClick={() => handleArchive(j.id)}>🗃️ Archivar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

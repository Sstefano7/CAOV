import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import './Admin.css';

interface Logro {
  id: string;
  title: string;
  competition: string;
  year: number;
  notes?: string;
  disciplina_id?: string;
  created_at: string;
  disciplinas?: { name: string };
}

interface Disciplina { id: string; name: string; category: string; }

const EMPTY = { title: '', competition: '', year: new Date().getFullYear(), notes: '', disciplina_id: '' };

export default function LogrosAdminPage() {
  const [logros, setLogros] = useState<Logro[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: l }, { data: d }] = await Promise.all([
      supabase.from('palmares').select('*, disciplinas(name)').order('year', { ascending: false }),
      supabase.from('disciplinas').select('id, name, category').order('sort_order'),
    ]);
    if (l) setLogros(l as unknown as Logro[]);
    if (d) setDisciplinas(d as Disciplina[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) return alert('El título es obligatorio.');
    setSaving(true);
    const payload = {
      title: form.title,
      competition: form.competition,
      year: form.year,
      notes: form.notes || null,
      disciplina_id: form.disciplina_id || null,
    };
    if (editing) {
      await supabase.from('palmares').update(payload).eq('id', editing);
    } else {
      await supabase.from('palmares').insert(payload);
    }
    setShowForm(false);
    setEditing(null);
    setSaving(false);
    setForm(EMPTY);
    await fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este logro?')) return;
    await supabase.from('palmares').delete().eq('id', id);
    await fetchData();
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🏆 Logros y Títulos</h1>
          <p className="admin-page-subtitle">Administrá los títulos y logros del club</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(true); }}>+ Agregar logro</button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '540px', padding: 'var(--space-6)' }}>
            <h2 style={{ fontWeight: 800, marginBottom: 'var(--space-5)' }}>{editing ? '✏️ Editar logro' : '🏆 Nuevo logro'}</h2>
            <div className="admin-form-row">
              <div>
                <label className="form-label">Título *</label>
                <input className="admin-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Campeón Provincial..." />
              </div>
              <div>
                <label className="form-label">Año</label>
                <input className="admin-input" type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} min={1900} max={2100} />
              </div>
            </div>
            <div className="admin-form-row">
              <div>
                <label className="form-label">Competencia</label>
                <input className="admin-input" value={form.competition} onChange={e => setForm(f => ({ ...f, competition: e.target.value }))} placeholder="Torneo Clausura, Copa ERF..." />
              </div>
              <div>
                <label className="form-label">Disciplina</label>
                <select className="admin-select" value={form.disciplina_id} onChange={e => setForm(f => ({ ...f, disciplina_id: e.target.value }))}>
                  <option value="">General / Club</option>
                  {disciplinas.map(d => <option key={d.id} value={d.id}>{d.name} — {d.category}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Notas</label>
              <input className="admin-input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Detalles adicionales..." />
            </div>
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Logro / Título</th>
                  <th>Año</th>
                  <th>Competencia</th>
                  <th>Disciplina</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {logros.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 700 }}>🏆 {l.title}</td>
                    <td style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{l.year}</td>
                    <td>{l.competition}</td>
                    <td>{l.disciplinas?.name ?? '—'}</td>
                    <td>
                      <div className="admin-action-btns">
                        <button className="btn-edit" onClick={() => {
                          setForm({ title: l.title, competition: l.competition, year: l.year, notes: l.notes ?? '', disciplina_id: l.disciplina_id ?? '' });
                          setEditing(l.id);
                          setShowForm(true);
                        }}>✏️</button>
                        <button className="btn-delete" onClick={() => handleDelete(l.id)}>🗑️</button>
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

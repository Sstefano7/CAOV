import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

interface Noticia {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image_url?: string;
  category: string;
  is_published: boolean;
  is_featured: boolean;
  published_at?: string;
  created_at: string;
}

const CATEGORIAS = ['Institucional', 'Deportiva', 'Fútbol', 'Básquet', 'Vóley', 'Handball', 'Patín', 'Hockey', 'Socio'];

const EMPTY: Partial<Noticia> = {
  title: '', slug: '', excerpt: '', content: '', image_url: '', category: 'Institucional',
  is_published: false, is_featured: false,
};

export default function NoticiasAdminPage() {
  const { profile } = useAuth();
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Noticia>>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchNoticias = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setNoticias(data as Noticia[]);
    setLoading(false);
  };

  useEffect(() => { fetchNoticias(); }, []);

  const openCreate = () => {
    setForm(EMPTY);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (n: Noticia) => {
    setForm(n);
    setEditing(n.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title?.trim()) return alert('El título es obligatorio.');
    setSaving(true);

    const slugGenerated = form.title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-6);

    const payload = {
      title: form.title,
      slug: form.slug || slugGenerated,
      excerpt: form.excerpt,
      content: form.content || '',
      image_url: form.image_url,
      category: form.category ?? 'Institucional',
      is_published: form.is_published ?? false,
      is_featured: form.is_featured ?? false,
      author_id: profile?.id,
      published_at: form.is_published ? new Date().toISOString() : null,
    };

    if (editing) {
      await supabase.from('noticias').update(payload).eq('id', editing);
    } else {
      await supabase.from('noticias').insert(payload);
    }

    setShowForm(false);
    setForm(EMPTY);
    setEditing(null);
    setSaving(false);
    await fetchNoticias();
  };

  const togglePublish = async (n: Noticia) => {
    await supabase.from('noticias').update({
      is_published: !n.is_published,
      published_at: !n.is_published ? new Date().toISOString() : null,
    }).eq('id', n.id);
    await fetchNoticias();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta noticia?')) return;
    await supabase.from('noticias').delete().eq('id', id);
    await fetchNoticias();
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">📰 Gestión de Noticias</h1>
          <p className="admin-page-subtitle">Creá, editá y publicá noticias del club</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nueva noticia</button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: 'var(--space-6)', overflowY: 'auto',
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '700px',
            padding: 'var(--space-6)', position: 'relative',
          }}>
            <h2 style={{ fontWeight: 800, marginBottom: 'var(--space-5)', fontSize: 'var(--text-xl)' }}>
              {editing ? '✏️ Editar noticia' : '➕ Nueva noticia'}
            </h2>

            <div className="admin-form-row">
              <div>
                <label className="form-label">Título *</label>
                <input className="admin-input" value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título de la noticia" />
              </div>
              <div>
                <label className="form-label">Categoría</label>
                <select className="admin-select" value={form.category ?? 'Institucional'} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Resumen / Excerpt</label>
              <input className="admin-input" value={form.excerpt ?? ''} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Breve descripción..." />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">URL de imagen</label>
              <input className="admin-input" value={form.image_url ?? ''} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Contenido</label>
              <textarea
                className="admin-input"
                style={{ minHeight: '200px', resize: 'vertical', fontFamily: 'monospace' }}
                value={form.content ?? ''}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Contenido completo de la noticia..."
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_published ?? false} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Publicar</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_featured ?? false} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Destacada</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : '💾 Guardar'}
              </button>
              <button className="btn btn-outline" onClick={() => { setShowForm(false); setEditing(null); }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          </div>
        ) : noticias.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">📰</div>
            <p className="admin-empty-text">No hay noticias todavía</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Noticia</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {noticias.map(n => (
                  <tr key={n.id}>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                        {n.image_url && (
                          <img src={n.image_url} alt="" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 700 }}>{n.title}</div>
                          {n.is_featured && <span className="status-badge status-badge--aprobado" style={{ fontSize: '10px' }}>⭐ Destacada</span>}
                        </div>
                      </div>
                    </td>
                    <td>{n.category}</td>
                    <td>
                      <span className={`status-badge ${n.is_published ? 'status-badge--aprobado' : 'status-badge--pendiente'}`}>
                        {n.is_published ? '✅ Publicada' : '⏳ Borrador'}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {new Date(n.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td>
                      <div className="admin-action-btns">
                        <button className="btn-edit" onClick={() => openEdit(n)}>✏️ Editar</button>
                        <button className={n.is_published ? 'btn-reject' : 'btn-approve'} onClick={() => togglePublish(n)}>
                          {n.is_published ? '⬇️ Despublicar' : '⬆️ Publicar'}
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(n.id)}>🗑️</button>
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

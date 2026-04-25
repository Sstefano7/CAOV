import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import './Admin.css';

interface GaleriaItem {
  id: string;
  image_url: string;
  title?: string;
  event_name?: string;
  is_featured: boolean;
  created_at: string;
}

export default function GaleriaAdminPage() {
  const [fotos, setFotos] = useState<GaleriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', event_name: '', image_url: '' });

  const fetchFotos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('galeria')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setFotos(data as GaleriaItem[]);
    setLoading(false);
  };

  useEffect(() => { fetchFotos(); }, []);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `galeria/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('galeria').upload(path, file, { upsert: true });
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from('galeria').getPublicUrl(path);
      setForm(f => ({ ...f, image_url: publicUrl }));
    }
    setUploading(false);
  };

  const handleAdd = async () => {
    if (!form.image_url) return alert('Subí una imagen o ingresá una URL.');
    await supabase.from('galeria').insert({
      image_url: form.image_url,
      title: form.title || null,
      event_name: form.event_name || null,
      is_featured: false,
    });
    setForm({ title: '', event_name: '', image_url: '' });
    await fetchFotos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    await supabase.from('galeria').delete().eq('id', id);
    await fetchFotos();
  };

  const toggleFeatured = async (foto: GaleriaItem) => {
    await supabase.from('galeria').update({ is_featured: !foto.is_featured }).eq('id', foto.id);
    await fetchFotos();
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">📸 Gestión de Galería</h1>
          <p className="admin-page-subtitle">Subí, editá y eliminá fotos del club</p>
        </div>
      </div>

      {/* Upload form */}
      <div className="admin-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">➕ Agregar foto</h2>
        </div>
        <div className="admin-card-body">
          <div className="admin-form-row">
            <div>
              <label className="form-label">Título (opcional)</label>
              <input className="admin-input" placeholder="Ej: Final del Torneo..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Evento (opcional)</label>
              <input className="admin-input" placeholder="Ej: Clausura 2025" value={form.event_name} onChange={e => setForm(f => ({ ...f, event_name: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Subir imagen</label>
              <input type="file" accept="image/*" onChange={handleUploadFile} style={{ fontSize: 'var(--text-sm)' }} />
              {uploading && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Subiendo...</span>}
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">O URL de imagen</label>
              <input className="admin-input" placeholder="https://..." value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
            </div>
          </div>

          {form.image_url && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <img src={form.image_url} alt="Preview" style={{ height: 100, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
            </div>
          )}

          <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={handleAdd}>
            📸 Agregar a galería
          </button>
        </div>
      </div>

      {/* Grid de fotos */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">🖼️ Fotos ({fotos.length})</h2>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          </div>
        ) : fotos.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">📸</div>
            <p className="admin-empty-text">No hay fotos en la galería</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 'var(--space-3)',
            padding: 'var(--space-4)',
          }}>
            {fotos.map(foto => (
              <div key={foto.id} style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: foto.is_featured ? '2px solid var(--color-primary)' : '1px solid #e2e8f0',
                background: '#f8fafc',
                position: 'relative',
              }}>
                <img src={foto.image_url} alt={foto.title ?? ''} style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: 'var(--space-2) var(--space-3)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text)' }}>
                    {foto.title ?? '—'}
                  </div>
                  {foto.event_name && (
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{foto.event_name}</div>
                  )}
                  <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
                    <button
                      onClick={() => toggleFeatured(foto)}
                      style={{ flex: 1, fontSize: '11px', padding: '4px', border: 'none', borderRadius: 4, cursor: 'pointer',
                        background: foto.is_featured ? '#fef3c7' : '#f1f5f9', color: foto.is_featured ? '#92400e' : '#475569' }}
                    >
                      {foto.is_featured ? '⭐ Destacada' : '☆ Destacar'}
                    </button>
                    <button
                      onClick={() => handleDelete(foto.id)}
                      style={{ fontSize: '11px', padding: '4px 8px', border: 'none', borderRadius: 4, cursor: 'pointer', background: '#fee2e2', color: '#7f1d1d' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

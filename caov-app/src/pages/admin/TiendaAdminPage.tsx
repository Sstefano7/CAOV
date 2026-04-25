import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import './Admin.css';

interface Producto {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  is_available: boolean;
  whatsapp_link?: string;
  sort_order: number;
  created_at: string;
}

const CATEGORIAS = ['camisetas', 'shorts', 'accesorios'];
const EMPTY = { name: '', description: '', price: '', image_url: '', category: 'camisetas', is_available: true, whatsapp_link: '', sort_order: '0' };

export default function TiendaAdminPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProductos = async () => {
    setLoading(true);
    const { data } = await supabase.from('productos').select('*').order('sort_order').order('name');
    if (data) setProductos(data as Producto[]);
    setLoading(false);
  };

  useEffect(() => { fetchProductos(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return alert('El nombre es obligatorio.');
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      image_url: form.image_url || null,
      category: form.category,
      is_available: form.is_available,
      whatsapp_link: form.whatsapp_link || null,
      sort_order: Number(form.sort_order) || 0,
    };
    if (editing) {
      await supabase.from('productos').update(payload).eq('id', editing);
    } else {
      await supabase.from('productos').insert(payload);
    }
    setShowForm(false);
    setEditing(null);
    setSaving(false);
    setForm(EMPTY);
    await fetchProductos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await supabase.from('productos').delete().eq('id', id);
    await fetchProductos();
  };

  const toggleAvailable = async (p: Producto) => {
    await supabase.from('productos').update({ is_available: !p.is_available }).eq('id', p.id);
    await fetchProductos();
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🛍️ Gestión de Tienda</h1>
          <p className="admin-page-subtitle">Administrá los productos del club</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(true); }}>+ Agregar producto</button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'var(--space-6)', overflowY: 'auto' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '560px', padding: 'var(--space-6)' }}>
            <h2 style={{ fontWeight: 800, marginBottom: 'var(--space-5)' }}>{editing ? '✏️ Editar producto' : '➕ Nuevo producto'}</h2>
            <div className="admin-form-row">
              <div>
                <label className="form-label">Nombre *</label>
                <input className="admin-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Categoría</label>
                <select className="admin-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="admin-form-row">
              <div>
                <label className="form-label">Precio ($)</label>
                <input className="admin-input" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} min={0} />
              </div>
              <div>
                <label className="form-label">Orden</label>
                <input className="admin-input" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} min={0} />
              </div>
            </div>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Descripción</label>
              <input className="admin-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">URL de imagen</label>
              <input className="admin-input" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Link de WhatsApp</label>
              <input className="admin-input" value={form.whatsapp_link} onChange={e => setForm(f => ({ ...f, whatsapp_link: e.target.value }))} placeholder="https://wa.me/..." />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_available} onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))} />
              <span style={{ fontWeight: 600 }}>Disponible para la venta</span>
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        {p.image_url && <img src={p.image_url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />}
                        <div>
                          <div style={{ fontWeight: 700 }}>{p.name}</div>
                          {p.description && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{p.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td style={{ fontWeight: 700 }}>${p.price.toLocaleString('es-AR')}</td>
                    <td>
                      <span className={`status-badge ${p.is_available ? 'status-badge--aprobado' : 'status-badge--rechazado'}`}>
                        {p.is_available ? '✅ Disponible' : '❌ No disponible'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-btns">
                        <button className="btn-edit" onClick={() => {
                          setForm({ name: p.name, description: p.description ?? '', price: p.price.toString(), image_url: p.image_url ?? '', category: p.category, is_available: p.is_available, whatsapp_link: p.whatsapp_link ?? '', sort_order: p.sort_order.toString() });
                          setEditing(p.id);
                          setShowForm(true);
                        }}>✏️</button>
                        <button onClick={() => toggleAvailable(p)} style={{ fontSize: '12px', padding: '4px 8px', border: 'none', borderRadius: 4, cursor: 'pointer', background: p.is_available ? '#fee2e2' : '#dcfce7', color: p.is_available ? '#7f1d1d' : '#14532d', fontWeight: 700 }}>
                          {p.is_available ? '⬇️ Pausar' : '⬆️ Activar'}
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(p.id)}>🗑️</button>
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

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import './Admin.css';

interface CuotaConfig {
  id: string;
  tipo: string;
  monto: number;
  descripcion: string;
}

const TIPO_INFO: Record<string, { label: string; icon: string; color: string }> = {
  cadete: { label: 'Cadete', icon: '🧒', color: '#3b82f6' },
  activo: { label: 'Activo', icon: '👤', color: '#16a34a' },
  grupo_familiar: { label: 'Grupo Familiar', icon: '👨‍👩‍👧‍👦', color: '#9333ea' },
  deportiva: { label: 'Cuota Deportiva', icon: '⚽', color: '#ea580c' },
};

export default function CuotasConfigPage() {
  const [configs, setConfigs] = useState<CuotaConfig[]>([]);
  const [disciplinas, setDisciplinas] = useState<{ id: string, name: string, category: string, monto_mensual: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [valores, setValores] = useState<Record<string, number>>({});
  
  // Nuevo estado para crear disciplina
  const [showNewDisc, setShowNewDisc] = useState(false);
  const [newDiscForm, setNewDiscForm] = useState({ name: '', category: '', monto_mensual: 15000 });

  const fetchConfig = async () => {
      const [{ data: cuotasData }, { data: discData }] = await Promise.all([
        supabase.from('cuotas_config').select('*').neq('tipo', 'deportiva').order('tipo'),
        supabase.from('disciplinas').select('id, name, category, monto_mensual').eq('is_active', true).order('name')
      ]);
      
      const vals: Record<string, number> = {};
      if (cuotasData) {
        setConfigs(cuotasData as CuotaConfig[]);
        cuotasData.forEach((c: CuotaConfig) => { vals[c.tipo] = c.monto; });
      }
      if (discData) {
        setDisciplinas(discData);
        discData.forEach(d => { vals[`disc_${d.id}`] = d.monto_mensual; });
      }
      setValores(vals);
      setLoading(false);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (tipo: string) => {
    setSaving(tipo);
    if (tipo.startsWith('disc_')) {
      const id = tipo.replace('disc_', '');
      await supabase.from('disciplinas')
        .update({ monto_mensual: valores[tipo] })
        .eq('id', id);
    } else {
      await supabase.from('cuotas_config')
        .update({ monto: valores[tipo], updated_at: new Date().toISOString() })
        .eq('tipo', tipo);
    }
    setSaved(tipo);
    setTimeout(() => setSaved(null), 2000);
    setSaving(null);
  };

  const handleCreateDisciplina = async () => {
    if (!newDiscForm.name) return;
    setSaving('new_disc');
    await supabase.from('disciplinas').insert([{
      name: newDiscForm.name,
      category: newDiscForm.category,
      monto_mensual: newDiscForm.monto_mensual,
      is_active: true
    }]);
    await fetchConfig();
    setShowNewDisc(false);
    setNewDiscForm({ name: '', category: '', monto_mensual: 15000 });
    setSaving(null);
  };

  const handleToggleDisciplina = async (id: string, currentStatus: boolean) => {
    setSaving(`toggle_${id}`);
    await supabase.from('disciplinas')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    await fetchConfig();
    setSaving(null);
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
      <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
    </div>
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">⚙️ Configuración de Cuotas</h1>
          <p className="admin-page-subtitle">Actualizá los valores de las cuotas societarias y deportivas</p>
        </div>
      </div>

      <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>🏛️ Cuotas Societarias (Base)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
        {configs.map(config => {
          const info = TIPO_INFO[config.tipo] ?? { label: config.tipo, icon: '💰', color: '#64748b' };
          const isSaving = saving === config.tipo;
          const isSaved = saved === config.tipo;

          return (
            <div key={config.id} className="admin-card">
              <div className="admin-card-header" style={{ borderLeft: `4px solid ${info.color}` }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: '1.5rem' }}>{info.icon}</span>
                    <span className="admin-card-title">{info.label}</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                    {config.descripcion}
                  </p>
                </div>
              </div>
              <div className="admin-card-body">
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  Monto mensual ($)
                </label>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{
                      position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)', fontWeight: 700, fontSize: 'var(--text-lg)',
                    }}>$</span>
                    <input
                      type="number"
                      className="admin-input"
                      style={{ paddingLeft: '28px', fontSize: 'var(--text-xl)', fontWeight: 700 }}
                      value={valores[config.tipo] ?? config.monto}
                      onChange={e => setValores(v => ({ ...v, [config.tipo]: Number(e.target.value) }))}
                      min={0}
                      step={500}
                    />
                  </div>
                  <button
                    className={`btn btn-sm ${isSaved ? '' : 'btn-primary'}`}
                    style={isSaved ? { background: '#16a34a', color: 'white' } : {}}
                    onClick={() => handleSave(config.tipo)}
                    disabled={isSaving}
                  >
                    {isSaving ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> :
                     isSaved ? '✅ Guardado' : '💾 Guardar'}
                  </button>
                </div>

                <div style={{
                  marginTop: 'var(--space-4)',
                  padding: 'var(--space-3)',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                }}>
                  Valor actual:{' '}
                  <strong style={{ color: info.color }}>
                    ${(valores[config.tipo] ?? config.monto).toLocaleString('es-AR')}
                  </strong>
                  {' '}/mes
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>⚽ Cuotas Deportivas (Por Disciplina)</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowNewDisc(true)}>
          + Nueva Disciplina
        </button>
      </div>

      {showNewDisc && (
        <div className="admin-card" style={{ marginBottom: 'var(--space-5)', border: '2px solid var(--color-primary)' }}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Crear Nueva Disciplina</h3>
          </div>
          <div className="admin-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 'var(--space-3)', alignItems: 'end' }}>
            <div>
              <label className="form-label">Nombre (Ej: Vóley)</label>
              <input className="admin-input" value={newDiscForm.name} onChange={e => setNewDiscForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Categoría (Opcional)</label>
              <input className="admin-input" placeholder="Ej: Primera Femenino" value={newDiscForm.category} onChange={e => setNewDiscForm(f => ({ ...f, category: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Cuota Mensual ($)</label>
              <input type="number" className="admin-input" value={newDiscForm.monto_mensual} onChange={e => setNewDiscForm(f => ({ ...f, monto_mensual: Number(e.target.value) }))} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button className="btn btn-primary" onClick={handleCreateDisciplina} disabled={saving === 'new_disc'}>Guardar</button>
              <button className="btn btn-outline" onClick={() => setShowNewDisc(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
        {disciplinas.map(disc => {
          const key = `disc_${disc.id}`;
          const isSaving = saving === key;
          const isSaved = saved === key;

          return (
            <div key={disc.id} className="admin-card">
              <div className="admin-card-header" style={{ borderLeft: `4px solid #ea580c`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span className="admin-card-title">{disc.name}</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                    Categoría: {disc.category || 'General'}
                  </p>
                </div>
                <button 
                  className="btn btn-outline btn-sm" 
                  style={{ color: '#ef4444', borderColor: '#fee2e2' }}
                  onClick={() => { if(window.confirm(`¿Desactivar ${disc.name}?`)) handleToggleDisciplina(disc.id, true) }}
                  disabled={saving === `toggle_${disc.id}`}
                >
                  Desactivar
                </button>
              </div>
              <div className="admin-card-body">
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  Monto mensual ($)
                </label>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{
                      position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)', fontWeight: 700, fontSize: 'var(--text-lg)',
                    }}>$</span>
                    <input
                      type="number"
                      className="admin-input"
                      style={{ paddingLeft: '28px', fontSize: 'var(--text-xl)', fontWeight: 700 }}
                      value={valores[key] ?? disc.monto_mensual}
                      onChange={e => setValores(v => ({ ...v, [key]: Number(e.target.value) }))}
                      min={0}
                      step={500}
                    />
                  </div>
                  <button
                    className={`btn btn-sm ${isSaved ? '' : 'btn-primary'}`}
                    style={isSaved ? { background: '#16a34a', color: 'white' } : {}}
                    onClick={() => handleSave(key)}
                    disabled={isSaving}
                  >
                    {isSaving ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> :
                     isSaved ? '✅ Guardado' : '💾 Guardar'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla resumen */}
      <div className="admin-card" style={{ marginTop: 'var(--space-6)' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">📊 Resumen de cuotas actuales</h2>
        </div>
        <div className="admin-card-body">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Monto mensual</th>
                <th>Monto anual</th>
              </tr>
            </thead>
            <tbody>
              {configs.map(c => (
                <tr key={c.id}>
                  <td>
                    <span style={{ fontWeight: 700 }}>
                      {TIPO_INFO[c.tipo]?.icon} {TIPO_INFO[c.tipo]?.label ?? c.tipo}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                    {c.descripcion}
                  </td>
                  <td style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>
                    ${(valores[c.tipo] ?? c.monto).toLocaleString('es-AR')}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    ${((valores[c.tipo] ?? c.monto) * 12).toLocaleString('es-AR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-4)',
            background: '#f0fdf4',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #86efac',
          }}>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: '#14532d' }}>
              <strong>💡 Ejemplo:</strong> Si un socio Activo se anota en la primera de Básquet, su cuota será la suma de la cuota Activa base + la cuota de Básquet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import './Admin.css';

interface Pago {
  id: string;
  periodo_mes: number;
  periodo_anio: number;
  monto: number;
  estado: string;
  metodo?: string;
  fecha_pago?: string;
  created_at: string;
  socios: {
    numero_socio: string;
    profiles: { full_name: string; email: string };
  };
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function CuotasAdminPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());
  const [filtroMes, setFiltroMes] = useState(0); // 0 = todos
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  // Estados para nuevo pago manual
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [socios, setSocios] = useState<{ id: string; numero_socio: string; profile_id: string; profiles: { id: string; full_name: string; role: string, tipo_socio: string } }[]>([]);
  const [baseConfigs, setBaseConfigs] = useState<Record<string, number>>({});
  const [form, setForm] = useState({
    socio_id: '',
    periodo_mes: new Date().getMonth() + 1,
    periodo_anio: new Date().getFullYear(),
    monto: '',
    estado: 'pendiente'
  });

  const fetchPagos = async () => {
    setLoading(true);
    let query = supabase
      .from('pagos')
      .select(`
        id, periodo_mes, periodo_anio, monto, estado, metodo, fecha_pago, created_at,
        socios (numero_socio, profiles (full_name, email))
      `)
      .eq('periodo_anio', filtroAnio)
      .order('created_at', { ascending: false });

    if (filtroEstado !== 'todos') query = query.eq('estado', filtroEstado);
    if (filtroMes > 0) query = query.eq('periodo_mes', filtroMes);

    const [{ data }, { data: sociosData }, { data: configData }] = await Promise.all([
      query,
      supabase.from('socios').select('id, numero_socio, profile_id, profiles(id, full_name, role, tipo_socio)').eq('estado', 'activo').order('numero_socio'),
      supabase.from('cuotas_config').select('tipo, monto')
    ]);
    
    if (data) setPagos(data as unknown as Pago[]);
    if (sociosData) setSocios(sociosData as any[]);
    if (configData) {
      const b: Record<string, number> = {};
      configData.forEach(c => { b[c.tipo] = c.monto; });
      setBaseConfigs(b);
    }
    setLoading(false);
  };

  const handleSocioChange = async (socio_id: string) => {
    setForm(f => ({ ...f, socio_id }));
    if (!socio_id) return;
    
    const socio = socios.find(s => s.id === socio_id);
    if (!socio || !socio.profile_id) return;

    const baseFee = baseConfigs[socio.profiles.tipo_socio] || 0;
    
    let depoFee = 0;
    if (socio.profiles.role === 'jugador') {
      const { data } = await supabase
        .from('jugadores')
        .select('disciplinas(monto_mensual)')
        .eq('profile_id', socio.profile_id)
        .eq('is_archived', false);
      if (data) {
        depoFee = data.reduce((acc, curr: any) => acc + (curr.disciplinas?.monto_mensual || 0), 0);
      }
    }
    
    setForm(f => ({ ...f, monto: String(baseFee + depoFee) }));
  };

  useEffect(() => { fetchPagos(); }, [filtroEstado, filtroAnio, filtroMes]);

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    setProcessing(id);
    const update: Record<string, unknown> = { estado: nuevoEstado };
    if (nuevoEstado === 'aprobado') update.fecha_pago = new Date().toISOString();
    await supabase.from('pagos').update(update).eq('id', id);
    await fetchPagos();
    setProcessing(null);
  };

  const handleSavePago = async () => {
    if (!form.socio_id || !form.monto) return alert('Completa todos los campos obligatorios');
    setSaving(true);
    await supabase.from('pagos').insert({
      socio_id: form.socio_id,
      periodo_mes: form.periodo_mes,
      periodo_anio: form.periodo_anio,
      monto: parseFloat(form.monto),
      estado: form.estado,
      tipo_pago: 'mensual',
      fecha_pago: form.estado === 'aprobado' ? new Date().toISOString() : null
    });
    setSaving(false);
    setShowForm(false);
    setForm({ ...form, monto: '', socio_id: '' });
    await fetchPagos();
  };

  const estadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      pendiente: 'status-badge--pendiente',
      aprobado: 'status-badge--aprobado',
      rechazado: 'status-badge--rechazado',
      reembolsado: 'status-badge--pendiente',
    };
    return map[estado] ?? '';
  };

  const filteredPagos = pagos.filter(p => {
    const nombre = (p.socios?.profiles?.full_name ?? '').toLowerCase();
    const email = (p.socios?.profiles?.email ?? '').toLowerCase();
    const q = search.toLowerCase();
    return !search || nombre.includes(q) || email.includes(q);
  });

  // Totales
  const totalAprobado = filteredPagos.filter(p => p.estado === 'aprobado').reduce((s, p) => s + p.monto, 0);
  const totalPendiente = filteredPagos.filter(p => p.estado === 'pendiente').reduce((s, p) => s + p.monto, 0);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">💰 Gestión de Cuotas</h1>
          <p className="admin-page-subtitle">Control de pagos societarios y deportivos</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ Cargar Cuota
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '500px', padding: 'var(--space-6)' }}>
            <h2 style={{ fontWeight: 800, marginBottom: 'var(--space-5)', fontSize: 'var(--text-xl)' }}>
              Cargar Pago Manual
            </h2>
            <div className="admin-form-row">
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Socio *</label>
                <select className="admin-select" value={form.socio_id} onChange={e => handleSocioChange(e.target.value)}>
                  <option value="">Seleccioná un socio...</option>
                  {socios.map(s => (
                    <option key={s.id} value={s.id}>
                      Nº {s.numero_socio} — {s.profiles?.full_name} {s.profiles?.role === 'jugador' ? '(Jugador)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="admin-form-row">
              <div>
                <label className="form-label">Mes</label>
                <select className="admin-select" value={form.periodo_mes} onChange={e => setForm(f => ({ ...f, periodo_mes: Number(e.target.value) }))}>
                  {MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Año</label>
                <input className="admin-input" type="number" value={form.periodo_anio} onChange={e => setForm(f => ({ ...f, periodo_anio: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="admin-form-row">
              <div>
                <label className="form-label">Monto ($) *</label>
                <input className="admin-input" type="number" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} placeholder="Ej: 15000" />
              </div>
              <div>
                <label className="form-label">Estado</label>
                <select className="admin-select" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                  <option value="pendiente">⏳ Pendiente</option>
                  <option value="aprobado">✅ Aprobado (Pagó)</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
              <button className="btn btn-primary" onClick={handleSavePago} disabled={saving}>
                {saving ? 'Guardando...' : '💾 Generar Cuota'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats rápidas */}
      <div className="admin-stats" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="admin-stat" style={{ borderLeft: '4px solid #16a34a' }}>
          <div className="admin-stat-icon">✅</div>
          <div className="admin-stat-value" style={{ color: '#14532d' }}>
            ${totalAprobado.toLocaleString('es-AR')}
          </div>
          <div className="admin-stat-label">Recaudado {filtroAnio}</div>
        </div>
        <div className="admin-stat" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="admin-stat-icon">⏳</div>
          <div className="admin-stat-value" style={{ color: '#92400e' }}>
            ${totalPendiente.toLocaleString('es-AR')}
          </div>
          <div className="admin-stat-label">Pendiente de cobro</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-icon">📋</div>
          <div className="admin-stat-value">{filteredPagos.length}</div>
          <div className="admin-stat-label">Registros</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-filters">
          <select className="admin-select" style={{ width: 'auto' }} value={filtroAnio} onChange={e => setFiltroAnio(Number(e.target.value))}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="admin-select" style={{ width: 'auto' }} value={filtroMes} onChange={e => setFiltroMes(Number(e.target.value))}>
            <option value={0}>Todos los meses</option>
            {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <select className="admin-select" style={{ width: 'auto' }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
          </select>
          <input
            className="admin-input"
            placeholder="Buscar socio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          </div>
        ) : filteredPagos.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">💰</div>
            <p className="admin-empty-text">No hay pagos registrados con estos filtros</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Socio</th>
                  <th>Período</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha Pago</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPagos.map(pago => (
                  <tr key={pago.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{pago.socios?.profiles?.full_name ?? '—'}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        Nº {pago.socios?.numero_socio}
                      </div>
                    </td>
                    <td>
                      {MESES[(pago.periodo_mes ?? 1) - 1]} {pago.periodo_anio}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      ${(pago.monto ?? 0).toLocaleString('es-AR')}
                    </td>
                    <td>
                      <span className={`status-badge ${estadoBadge(pago.estado)}`}>
                        {pago.estado}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-AR') : '—'}
                    </td>
                    <td>
                      {pago.estado !== 'aprobado' ? (
                        <div className="admin-action-btns">
                          <button
                            className="btn-approve"
                            onClick={() => cambiarEstado(pago.id, 'aprobado')}
                            disabled={processing === pago.id}
                          >
                            ✅ Aprobar
                          </button>
                          {pago.estado !== 'rechazado' && (
                            <button
                              className="btn-reject"
                              onClick={() => cambiarEstado(pago.id, 'rechazado')}
                              disabled={processing === pago.id}
                            >
                              ❌ Rechazar
                            </button>
                          )}
                          {pago.estado !== 'pendiente' && (
                            <button
                              className="btn-edit"
                              onClick={() => cambiarEstado(pago.id, 'pendiente')}
                              disabled={processing === pago.id}
                            >
                              ↩️ Pendiente
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          🔒 Sin cambios
                        </span>
                      )}
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

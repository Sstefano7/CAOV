import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { LogIn, User } from '../../icons';
import './AuthPages.css';
import './DashboardPage.css';

interface PagoProfesor {
  id: string;
  periodo_mes: number;
  periodo_anio: number;
  monto: number;
  estado: 'pendiente' | 'pagado' | 'retenido';
  concepto?: string;
  fecha_pago?: string;
}

const MESES_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MESES_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function ProfesorDashboardPage() {
  const { profile, signOut } = useAuth();
  const [pagos, setPagos] = useState<PagoProfesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [anio, setAnio] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!profile) return;
    const fetchPagos = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('pagos_profesores')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('periodo_anio', anio)
        .order('periodo_mes', { ascending: true });
      if (data) setPagos(data as PagoProfesor[]);
      setLoading(false);
    };
    fetchPagos();
  }, [profile, anio]);

  const totalPagado = pagos.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.monto, 0);
  const totalPendiente = pagos.filter(p => p.estado === 'pendiente').reduce((s, p) => s + p.monto, 0);

  const getPagoMes = (mes: number) => pagos.find(p => p.periodo_mes === mes);

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-hero">
        <div className="container">
          <div className="dashboard-hero-inner">
            <div className="dashboard-user-info">
              <div className="dashboard-avatar">
                <User size={36} />
              </div>
              <div>
                <p className="dashboard-welcome">Panel del Profesor</p>
                <h1 className="dashboard-name">{profile?.full_name}</h1>
                <p className="dashboard-email">{profile?.email}</p>
              </div>
            </div>
            <button onClick={signOut} className="btn btn-outline btn-sm">
              <LogIn size={15} /> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="container dashboard-body">

        {/* Resumen anual */}
        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">💰 Mis Pagos y Haberes</h2>
            <select
              value={anio}
              onChange={e => setAnio(Number(e.target.value))}
              style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-sm)' }}
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Totales */}
          <div className="cuotas-resumen">
            <div className="cuota-item cuota-item--deportiva">
              <span className="cuota-item-label">Total cobrado</span>
              <span className="cuota-item-monto">${totalPagado.toLocaleString('es-AR')}</span>
              <span className="cuota-item-tipo">{anio}</span>
            </div>
            <div className="cuota-item">
              <span className="cuota-item-label">Pendiente de pago</span>
              <span className="cuota-item-monto" style={{ color: '#f59e0b' }}>${totalPendiente.toLocaleString('es-AR')}</span>
              <span className="cuota-item-tipo">{anio}</span>
            </div>
            <div className="cuota-item cuota-item--total">
              <span className="cuota-item-label">Total {anio}</span>
              <span className="cuota-item-monto cuota-item-monto--total">
                ${(totalPagado + totalPendiente).toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          {/* Grid mensual */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            </div>
          ) : (
            <div className="cuotas-grid">
              {MESES_SHORT.map((mes, idx) => {
                const pago = getPagoMes(idx + 1);
                const mesActual = new Date().getMonth();
                const esPasado = idx < mesActual;
                const esActual = idx === mesActual;

                return (
                  <div key={mes} className={`cuota-mes ${esActual ? 'cuota-mes--actual' : ''}`}>
                    <div className="cuota-mes-nombre">{mes}</div>
                    <div className={`cuota-mes-estado ${
                      pago?.estado === 'pagado' ? 'ok' :
                      pago?.estado === 'retenido' ? 'moroso' :
                      esPasado && !pago ? 'moroso' : 'pendiente'
                    }`}>
                      {pago?.estado === 'pagado' ? '✅' :
                       pago?.estado === 'retenido' ? '🔴' :
                       esPasado && !pago ? '❌' : '⏳'}
                    </div>
                    <div className="cuota-mes-label">
                      {pago?.estado === 'pagado' ? 'Cobrado' :
                       pago?.estado === 'retenido' ? 'Retenido' :
                       esPasado && !pago ? 'Sin datos' :
                       esActual ? 'Actual' : '—'}
                    </div>
                    {pago?.monto && (
                      <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        ${pago.monto.toLocaleString('es-AR')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Detalle de pagos */}
        {pagos.length > 0 && (
          <section className="dashboard-section">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">📋 Historial de pagos {anio}</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    <th style={{ textAlign: 'left', padding: 'var(--space-3)', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Período</th>
                    <th style={{ textAlign: 'left', padding: 'var(--space-3)', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Concepto</th>
                    <th style={{ textAlign: 'right', padding: 'var(--space-3)', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Monto</th>
                    <th style={{ textAlign: 'left', padding: 'var(--space-3)', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Estado</th>
                    <th style={{ textAlign: 'left', padding: 'var(--space-3)', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 'var(--space-3)', fontWeight: 600 }}>
                        {MESES_FULL[(p.periodo_mes ?? 1) - 1]} {p.periodo_anio}
                      </td>
                      <td style={{ padding: 'var(--space-3)', color: 'var(--color-text-light)' }}>
                        {p.concepto ?? 'Honorario mensual'}
                      </td>
                      <td style={{ padding: 'var(--space-3)', fontWeight: 700, textAlign: 'right', color: 'var(--color-primary-dark)' }}>
                        ${p.monto.toLocaleString('es-AR')}
                      </td>
                      <td style={{ padding: 'var(--space-3)' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                          background: p.estado === 'pagado' ? '#dcfce7' : p.estado === 'retenido' ? '#fee2e2' : '#fef3c7',
                          color: p.estado === 'pagado' ? '#14532d' : p.estado === 'retenido' ? '#7f1d1d' : '#92400e',
                        }}>
                          {p.estado === 'pagado' ? '✅ Cobrado' : p.estado === 'retenido' ? '🔴 Retenido' : '⏳ Pendiente'}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString('es-AR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {pagos.length === 0 && !loading && (
          <section className="dashboard-section">
            <div className="pending-carnet">
              <div style={{ fontSize: '3rem' }}>📋</div>
              <h3>Sin registros de pagos</h3>
              <p>Aún no hay pagos registrados para {anio}. La administración del club cargará tus haberes aquí.</p>
            </div>
          </section>
        )}

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">👤 Mis Datos</h2>
          </div>
          <div className="datos-grid">
            <div className="dato-item">
              <span className="dato-label">Nombre</span>
              <span className="dato-value">{profile?.full_name}</span>
            </div>
            <div className="dato-item">
              <span className="dato-label">Email</span>
              <span className="dato-value">{profile?.email}</span>
            </div>
            <div className="dato-item">
              <span className="dato-label">Teléfono</span>
              <span className="dato-value">{profile?.phone ?? '—'}</span>
            </div>
            <div className="dato-item">
              <span className="dato-label">Rol</span>
              <span className="dato-value">Profesor / Instructor</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

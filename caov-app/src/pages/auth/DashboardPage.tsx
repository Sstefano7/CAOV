import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { User } from '../../icons';
import { ReciboDigital } from '../../components/ReciboDigital';
import './AuthPages.css';
import './DashboardPage.css';

interface PagoMes {
  id: string;
  periodo_mes: number;
  periodo_anio: number;
  monto: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'reembolsado';
  metodo: string;
  fecha_pago: string;
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const TIPO_SOCIO_LABEL: Record<string, string> = {
  cadete: 'Cadete',
  activo: 'Activo',
  grupo_familiar: 'Grupo Familiar',
};

export default function DashboardPage() {
  const { profile, socio, signOut, isJugador, cuotasConfig } = useAuth();
  const [pagos, setPagos] = useState<PagoMes[]>([]);
  const [loadingPagos, setLoadingPagos] = useState(true);
  const [misDisciplinas, setMisDisciplinas] = useState<{ name: string; monto: number }[]>([]);
  const [selectedPago, setSelectedPago] = useState<PagoMes | null>(null);
  const [downloadingRecibo, setDownloadingRecibo] = useState(false);
  const carnetRef = useRef<HTMLDivElement>(null);
  const reciboRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();

  const carnetFileName = `carnet-caov-${profile?.full_name
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase() || 'socio'
    }.png`;

  useEffect(() => {
    if (!socio) { setLoadingPagos(false); return; }
    const fetchPagos = async () => {
      const { data } = await supabase
        .from('pagos')
        .select('id, periodo_mes, periodo_anio, monto, estado, metodo, fecha_pago')
        .eq('socio_id', socio.id)
        .eq('periodo_anio', currentYear)
        .order('periodo_mes', { ascending: true });

      if (data) setPagos(data as unknown as PagoMes[]);
      setLoadingPagos(false);
    };
    fetchPagos();
  }, [socio]);

  useEffect(() => {
    if (!profile || !isJugador) return;
    const fetchDisciplinas = async () => {
      const { data } = await supabase
        .from('jugadores')
        .select('disciplinas(name, monto_mensual)')
        .eq('profile_id', profile.id)
        .eq('is_archived', false);

      if (data) {
        const mapped = data.map((d: any) => ({
          name: d.disciplinas?.name,
          monto: d.disciplinas?.monto_mensual ?? 0
        }));
        setMisDisciplinas(mapped);
      }
    };
    fetchDisciplinas();
  }, [profile, isJugador]);

  // Descarga imperativa super robusta
  const downloadFile = (blob: Blob, fileName: string) => {
    // Creamos un File object que fuerza al SO a reconocer el nombre
    const file = new File([blob], fileName, { type: 'image/png' });
    const url = URL.createObjectURL(file);
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName; // Doble seguridad
    
    document.body.appendChild(a);
    a.click();
    
    // Limpieza diferida
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const downloadCarnet = async () => {
    if (!carnetRef.current) return;
    try {
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(carnetRef.current, { 
        pixelRatio: 2, 
        cacheBust: true,
        filter: (node: any) => {
          if (node.style && node.style.filter) node.style.filter = 'none';
          return true;
        }
      });
      if (blob) downloadFile(blob, carnetFileName);
    } catch (err) {
      console.error('Error al generar carnet:', err);
      alert('Hubo un error al descargar el carnet.');
    }
  };

  const downloadRecibo = async (pago: PagoMes) => {
    setSelectedPago(pago);
    setDownloadingRecibo(true);

    setTimeout(async () => {
      try {
        if (!reciboRef.current) throw new Error('Elemento no encontrado');
        const { toBlob } = await import('html-to-image');
        const blob = await toBlob(reciboRef.current, {
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: '#ffffff',
        });
        if (blob) {
          const fileName = `recibo-caov-${MESES[(pago.periodo_mes || 1) - 1].toLowerCase()}-${pago.periodo_anio}.png`;
          downloadFile(blob, fileName);
        }
      } catch (err) {
        console.error('Error al generar recibo:', err);
        alert('Error al descargar el recibo.');
      } finally {
        setDownloadingRecibo(false);
        setSelectedPago(null);
      }
    }, 800); // 800ms para asegurar renderizado completo
  };

  const getMontoCuota = () => {
    if (!cuotasConfig || !profile?.tipo_socio) return null;
    const societaria = cuotasConfig[profile.tipo_socio] ?? 0;
    const deportiva = misDisciplinas.reduce((acc, curr) => acc + curr.monto, 0);
    return { societaria, deportiva, total: societaria + deportiva };
  };

  const getPagoMes = (mes: number) =>
    pagos.find(p => p.periodo_mes === mes);

  const montos = getMontoCuota();

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-hero">
        <div className="container">
          <div className="dashboard-hero-inner">
            <div className="dashboard-user-info">
              <div className="dashboard-avatar">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt={profile.full_name} crossOrigin="anonymous" />
                  : <User size={36} />}
              </div>
              <div>
                <p className="dashboard-welcome">Bienvenido/a</p>
                <h1 className="dashboard-name">{profile?.full_name}</h1>
                <p className="dashboard-email">{profile?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container dashboard-body">

        {/* === CARNET DIGITAL === */}
        {socio ? (
          <section className="dashboard-section">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">🪪 Carnet Digital</h2>

              <button className="btn btn-outline btn-sm" onClick={downloadCarnet}>
                ⬇️ Descargar
              </button>
            </div>

            <div className="carnet-wrapper">
              <div className="carnet" ref={carnetRef}>
                <div className="carnet-bg" />
                <div className="carnet-inner">
                  <div className="carnet-header">
                    <img src="/escudo.png" alt="CAOV" className="carnet-logo" />
                    <div>
                      <div className="carnet-club-name">C.A.O.V.</div>
                      <div className="carnet-club-sub">Club Atlético Oro Verde</div>
                    </div>
                  </div>

                  <div className="carnet-body">
                    <div className="carnet-photo">
                      {profile?.avatar_url
                        ? <img src={profile.avatar_url} alt={profile.full_name} crossOrigin="anonymous" />
                        : <div className="carnet-photo-placeholder"><User size={40} /></div>}
                    </div>

                    <div className="carnet-data">
                      <div className="carnet-socio-label">
                        Socio {TIPO_SOCIO_LABEL[profile?.tipo_socio ?? 'activo'] ?? 'Activo'}
                        {isJugador && <span className="carnet-badge-jugador">⚽ Jugador</span>}
                      </div>
                      <div className="carnet-numero">Nº {socio.numero_socio}</div>
                      <div className="carnet-nombre">{profile?.full_name}</div>
                      {profile?.dni && <div className="carnet-dni">DNI: {profile.dni}</div>}
                      <div className="carnet-fecha">Alta: {new Date(socio.fecha_alta).toLocaleDateString('es-AR')}</div>

                      <div className={`carnet-estado ${socio.estado === 'activo' ? 'carnet-estado--ok' : 'carnet-estado--warn'}`}>
                        {socio.estado === 'activo' ? '✅ Al día' : `⚠️ ${socio.estado.charAt(0).toUpperCase() + socio.estado.slice(1)}`}
                      </div>
                    </div>

                    <div className="carnet-qr">
                      <QRCodeSVG
                        value={`CAOV-SOCIO-${socio.numero_socio}`}
                        size={90}
                        level="H"
                        fgColor="#ffffff"
                        bgColor="transparent"
                      />
                      <div className="carnet-qr-label">SOCIO</div>
                    </div>
                  </div>

                  <div className="carnet-footer">
                    <span>Oro Verde, Entre Ríos — Argentina</span>
                    <span>caov.com.ar</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="dashboard-section">
            <div className="pending-carnet">
              <div style={{ fontSize: '3rem' }}>⏳</div>
              <h3>Tu carnet está en proceso</h3>
              <p>La administración del club aún está procesando tu alta. Cuando sea aprobada, tu carnet digital aparecerá aquí.</p>
            </div>
          </section>
        )}

        {/* === CUOTAS === */}
        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">💰 Estado de Cuotas {currentYear}</h2>
          </div>

          {montos && (
            <div className="cuotas-resumen">
              <div className="cuota-item">
                <span className="cuota-item-label">Cuota Societaria</span>
                <span className="cuota-item-monto">
                  ${montos.societaria.toLocaleString('es-AR')}
                </span>
                <span className="cuota-item-tipo">
                  {TIPO_SOCIO_LABEL[profile?.tipo_socio ?? ''] ?? ''}
                </span>
              </div>
              {misDisciplinas.map((disc, i) => (
                <div key={i} className="cuota-item cuota-item--deportiva">
                  <span className="cuota-item-label">Cuota Deportiva ({disc.name})</span>
                  <span className="cuota-item-monto">
                    ${disc.monto.toLocaleString('es-AR')}
                  </span>
                  <span className="cuota-item-tipo">Jugador activo</span>
                </div>
              ))}
              <div className="cuota-item cuota-item--total">
                <span className="cuota-item-label">Total mensual</span>
                <span className="cuota-item-monto cuota-item-monto--total">
                  ${montos.total.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          )}

          {loadingPagos ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            </div>
          ) : (
            <div className="cuotas-grid">
              {MESES.map((mes, idx) => {
                const pago = getPagoMes(idx + 1);
                const mesActual = new Date().getMonth();
                const esPasado = idx < mesActual;
                const esActual = idx === mesActual;

                return (
                  <div
                    key={mes}
                    className={`cuota-mes ${esActual ? 'cuota-mes--actual' : ''}`}
                  >
                    <div className="cuota-mes-nombre">{mes}</div>
                    <div className={`cuota-mes-estado ${pago?.estado === 'aprobado' ? 'ok' :
                      esPasado && !pago ? 'moroso' : 'pendiente'
                      }`}>
                      {pago?.estado === 'aprobado' ? '✅' :
                        esPasado && !pago ? '❌' : '⏳'}
                    </div>
                    <div className="cuota-mes-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span>
                        {pago?.estado === 'aprobado' ? 'Pagada' :
                          esPasado && !pago ? 'Moroso' :
                            esActual ? 'Vence' : '—'}
                      </span>

                      {pago?.estado === 'aprobado' && (
                        <button
                          onClick={() => downloadRecibo(pago)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '2px 8px', fontSize: '10px', marginTop: '2px' }}
                          disabled={downloadingRecibo}
                        >
                          {downloadingRecibo && selectedPago?.id === pago.id ? '⏳' : '📄 Recibo'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* === DATOS PERSONALES === */}
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
              <span className="dato-label">DNI</span>
              <span className="dato-value">{profile?.dni ?? '—'}</span>
            </div>
            <div className="dato-item">
              <span className="dato-label">Email</span>
              <span className="dato-value">{profile?.email}</span>
            </div>
            <div className="dato-item">
              <span className="dato-label">Teléfono</span>
              <span className="dato-value">{profile?.phone ?? '—'}</span>
            </div>
            {socio && (
              <>
                <div className="dato-item">
                  <span className="dato-label">Nº de Socio</span>
                  <span className="dato-value">{socio.numero_socio}</span>
                </div>
                <div className="dato-item">
                  <span className="dato-label">Fecha de alta</span>
                  <span className="dato-value">{new Date(socio.fecha_alta).toLocaleDateString('es-AR')}</span>
                </div>
              </>
            )}
          </div>
        </section>

      </div>

      {/* Recibo oculto para exportación */}
      {selectedPago && socio && profile && (
        <ReciboDigital
          ref={reciboRef}
          pago={selectedPago}
          socio={socio}
          profile={{ ...profile, tipo_socio: profile.tipo_socio || '' }}
          disciplinas={misDisciplinas}
        />
      )}
    </div>
  );
}
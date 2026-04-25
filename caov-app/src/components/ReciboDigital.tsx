import React, { forwardRef } from 'react';

// Utilidad simple para convertir números a palabras (hasta 999.999)
function numeroALetras(num: number): string {
  const unidades = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const decenas = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const decenasMultiplos = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  if (num === 0) return unidades[0];
  if (num < 10) return unidades[num];
  if (num < 20) return decenas[num - 10];
  if (num < 100) return num % 10 === 0 ? decenasMultiplos[Math.floor(num / 10)] : (Math.floor(num / 10) === 2 ? 'veinti' + unidades[num % 10] : decenasMultiplos[Math.floor(num / 10)] + ' y ' + unidades[num % 10]);
  if (num === 100) return 'cien';
  if (num < 1000) return centenas[Math.floor(num / 100)] + (num % 100 === 0 ? '' : ' ' + numeroALetras(num % 100));
  if (num === 1000) return 'mil';
  if (num < 2000) return 'mil ' + numeroALetras(num % 1000);
  if (num < 1000000) return numeroALetras(Math.floor(num / 1000)) + ' mil' + (num % 1000 === 0 ? '' : ' ' + numeroALetras(num % 1000));
  return num.toString();
}

interface ReciboDigitalProps {
  pago: {
    id: string;
    periodo_mes: number;
    periodo_anio: number;
    monto: number;
    estado: string;
    metodo: string;
    fecha_pago: string;
  };
  socio: {
    numero_socio: string;
  };
  profile: {
    full_name: string;
    tipo_socio: string;
  };
  disciplinas: { name: string }[];
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const ReciboDigital = forwardRef<HTMLDivElement, ReciboDigitalProps>(({ pago, socio, profile, disciplinas }, ref) => {
  const montoLetras = numeroALetras(pago.monto).toUpperCase() + ' PESOS';
  const divisionText = `${(profile.tipo_socio || '').toUpperCase()} (SOC. N° ${socio.numero_socio} - ${profile.full_name?.toUpperCase()}) ${disciplinas.length > 0 ? '- ' + disciplinas.map(d => d.name.toUpperCase()).join(', ') : ''}`;
  const reciboId = pago.id.split('-')[0].toUpperCase();
  const fechaPagoStr = pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-AR') : new Date().toLocaleDateString('es-AR');

  return (
    <div id="recibo-download-container" style={{ position: 'fixed', left: 0, top: 0, opacity: 0.01, pointerEvents: 'none', zIndex: -1 }}>
      <div 
        ref={ref} 
        style={{
          width: '600px',
          background: 'white',
          padding: '40px',
          fontFamily: 'monospace',
          color: 'black',
          border: '1px solid #ddd',
        }}
      >
        <div style={{ display: 'flex', borderBottom: '2px solid black', paddingBottom: '16px', marginBottom: '24px' }}>
          <div style={{ width: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/escudo.png" alt="CAOV" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1, paddingLeft: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Club Atlético Oro Verde</h1>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>Los Jacarandaes 54 - Oro Verde - Entre Ríos</p>
            <p style={{ margin: '0', fontSize: '14px' }}>C.U.I.T.: 33-69047264-9 - I.V.A. EXENTO</p>
          </div>
          <div style={{ width: '160px', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', borderBottom: '1px solid black', display: 'inline-block' }}>
              RECIBO<br/>Internos
            </h2>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>N° {reciboId}</div>
          </div>
        </div>

        <div style={{ marginBottom: '24px', textAlign: 'right', fontSize: '16px' }}>
          Fecha: <span style={{ fontWeight: 'bold' }}>{fechaPagoStr}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '16px' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '120px' }}>Recibí:</div>
            <div style={{ flex: 1, borderBottom: '1px dashed black', fontWeight: 'bold' }}>
              ${pago.monto.toLocaleString('es-AR')} (Por {pago.metodo || 'Pago'})
            </div>
          </div>
          
          <div style={{ display: 'flex' }}>
            <div style={{ width: '120px' }}>División:</div>
            <div style={{ flex: 1, borderBottom: '1px dashed black', fontWeight: 'bold' }}>
              {divisionText}
            </div>
          </div>

          <div style={{ display: 'flex' }}>
            <div style={{ width: '180px' }}>La cantidad de pesos:</div>
            <div style={{ flex: 1, borderBottom: '1px dashed black', fontWeight: 'bold' }}>
              {montoLetras}
            </div>
          </div>

          <div style={{ display: 'flex' }}>
            <div style={{ width: '140px' }}>Cuota del mes:</div>
            <div style={{ flex: 1, borderBottom: '1px dashed black', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {MESES[(pago.periodo_mes || 1) - 1]} DE {pago.periodo_anio}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '150px', background: '#f0f0f0', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '20px', border: '1px solid #ccc' }}>
            Son $ {pago.monto.toLocaleString('es-AR')}
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ display: 'inline-block', border: '2px solid #16a34a', color: '#16a34a', padding: '8px 16px', borderRadius: '8px', transform: 'rotate(-5deg)', fontWeight: 'bold', fontSize: '24px', opacity: 0.8 }}>
              PAGADO CAOV
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666', borderTop: '1px solid #eee', paddingTop: '8px' }}>
          Original: Blanco - Duplicado: Blanco duplicado | Recibo generado digitalmente
        </div>
      </div>
    </div>
  );
});

import { useState } from 'react';
import { X } from '../../icons';
import { mockGallery } from '../../data/mockData';
import type { GalleryImage } from '../../types';

export default function GalleryPage() {
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const events = ['Todos', ...Array.from(new Set(mockGallery.map(g => g.event_name).filter(Boolean)))];
  const [activeEvent, setActiveEvent] = useState('Todos');

  const filtered = activeEvent === 'Todos'
    ? mockGallery
    : mockGallery.filter(g => g.event_name === activeEvent);

  return (
    <div>
      <div className="page-header-banner">
        <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&q=80" alt="Galería" className="page-header-bg" />
        <div className="page-header-overlay" />
        <div className="container page-header-content">
          <div className="section-label" style={{color:'rgba(255,255,255,0.6)'}}>
            <span style={{background:'rgba(255,255,255,0.4)'}} /> Fotos
          </div>
          <h1 className="page-header-title">Galería</h1>
          <p className="page-header-subtitle">Los mejores momentos de la familia verde y blanca</p>
        </div>
      </div>

      <div className="section bg-white">
        <div className="container">
          <div style={{marginBottom:'var(--space-8)'}}>
            <div className="tabs">
              {(events as string[]).map(e => (
                <button key={e} className={`tab ${activeEvent === e ? 'active' : ''}`} onClick={() => setActiveEvent(e)}>{e}</button>
              ))}
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'var(--space-4)'}}>
            {filtered.map(img => (
              <button
                key={img.id}
                onClick={() => setSelected(img)}
                style={{padding:0,border:'none',background:'none',cursor:'pointer',borderRadius:'var(--radius-xl)',overflow:'hidden',display:'block',aspectRatio:'1',position:'relative'}}
                className="card"
              >
                <img src={img.image_url} alt={img.title || ''} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.4s ease'}} />
                {img.title && (
                  <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'var(--space-3)',background:'linear-gradient(to top,rgba(0,0,0,0.7),transparent)',opacity:0,transition:'opacity 0.25s ease'}}>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div style={{maxWidth:'900px',width:'100%',position:'relative'}} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelected(null)}
              style={{position:'absolute',top:'-48px',right:0,background:'rgba(255,255,255,0.15)',border:'none',color:'white',borderRadius:'50%',width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}
            >
              <X size={18} />
            </button>
            <img src={selected.image_url} alt={selected.title || ''} style={{width:'100%',borderRadius:'var(--radius-2xl)',maxHeight:'80vh',objectFit:'contain'}} />
            {selected.title && (
              <div style={{textAlign:'center',marginTop:'var(--space-4)',color:'white',fontFamily:'var(--font-heading)',fontSize:'var(--text-lg)',fontWeight:600}}>
                {selected.title}
                {selected.event_name && <div style={{fontSize:'var(--text-sm)',opacity:0.6,fontWeight:400,marginTop:'var(--space-1)'}}>{selected.event_name}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Tag } from '../../icons';
import { mockNews } from '../../data/mockData';
import { formatDate } from '../../utils/dateUtils';

export default function NewsDetailPage() {
  const { slug } = useParams();
  const article = mockNews.find(n => n.slug === slug);

  if (!article) {
    return (
      <div className="page">
        <div className="section container">
          <div className="empty-state">
            <div className="empty-state-icon">📰</div>
            <p className="empty-state-title">Noticia no encontrada</p>
            <Link to="/noticias" className="btn btn-primary" style={{marginTop:'var(--space-4)'}}>
              Volver a Noticias
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const related = mockNews.filter(n => n.id !== article.id && n.category === article.category).slice(0, 3);

  return (
    <div>
      {/* Hero Banner */}
      <div className="page-header-banner" style={{height:'480px'}}>
        <img src={article.image_url} alt={article.title} className="page-header-bg" />
        <div className="page-header-overlay" />
        <div className="container page-header-content">
          <Link to="/noticias" className="breadcrumb" style={{color:'rgba(255,255,255,0.6)', marginBottom:'var(--space-4)'}}>
            <ArrowLeft size={14} /> Volver a Noticias
          </Link>
          <span className="badge badge-primary" style={{marginBottom:'var(--space-3)'}}>{article.category}</span>
          <h1 style={{fontFamily:'var(--font-heading)',fontSize:'clamp(1.5rem,4vw,2.5rem)',fontWeight:900,color:'white',lineHeight:1.2,maxWidth:'800px'}}>
            {article.title}
          </h1>
          <div style={{display:'flex',alignItems:'center',gap:'var(--space-4)',marginTop:'var(--space-4)'}}>
            <span style={{display:'flex',alignItems:'center',gap:'var(--space-2)',fontSize:'var(--text-sm)',color:'rgba(255,255,255,0.6)'}}>
              <Calendar size={14} /> {formatDate(article.published_at || '')}
            </span>
          </div>
        </div>
      </div>

      <div className="section bg-white">
        <div className="container container-md">
          {/* Article Content */}
          <div style={{background:'var(--color-surface)',borderRadius:'var(--radius-2xl)',padding:'var(--space-10)',border:'1px solid var(--color-border)',marginBottom:'var(--space-10)'}}>
            <div
              style={{fontFamily:'var(--font-body)',fontSize:'var(--text-lg)',lineHeight:1.8,color:'var(--color-text-primary)'}}
              dangerouslySetInnerHTML={{ __html: article.content + '<p>El partido fue intenso desde el primer minuto. El equipo local salió decidido a imponer condiciones y el trabajo de toda la semana se vio reflejado en el rendimiento colectivo. Los jugadores demostraron una vez más el espíritu verde y blanco que caracteriza al club desde sus orígenes.</p><p>La hinchada acompañó de principio a fin, llenando las gradas con banderas y colores. Este resultado consolida al equipo en la cima de la tabla de posiciones y aumenta las esperanzas de cara a la recta final del campeonato.</p><blockquote style="border-left:4px solid var(--color-primary);padding-left:1.5rem;margin:2rem 0;font-style:italic;color:var(--color-text-secondary);">"Estamos muy contentos con el trabajo del equipo. Fue un partido difícil pero los chicos lo resolvieron con inteligencia." — <strong>Cuerpo técnico</strong></blockquote><p>El próximo compromiso del equipo será el sábado 20 de abril en el estadio Municipal, donde recibirán a Atlético Crespo en un partido que promete ser igual de emocionante.</p>' }}
            />
          </div>

          {/* Related News */}
          {related.length > 0 && (
            <div>
              <h3 style={{fontFamily:'var(--font-heading)',fontWeight:700,marginBottom:'var(--space-6)',fontSize:'var(--text-xl)'}}>
                También te puede interesar
              </h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'var(--space-5)'}}>
                {related.map(r => (
                  <Link key={r.id} to={`/noticias/${r.slug}`} style={{textDecoration:'none',borderRadius:'var(--radius-xl)',overflow:'hidden',border:'1px solid var(--color-border)',transition:'all var(--transition-base)',display:'block'}}
                    className="card">
                    <img src={r.image_url} alt={r.title} className="card-image" />
                    <div className="card-body-sm">
                      <span className="badge badge-outline" style={{marginBottom:'var(--space-2)'}}>{r.category}</span>
                      <p style={{fontFamily:'var(--font-heading)',fontWeight:700,fontSize:'var(--text-sm)',lineHeight:1.35,color:'var(--color-text-primary)'}}>{r.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

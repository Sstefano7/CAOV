import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Calendar, ArrowLeft, Tag } from '../../icons';
import { formatDate } from '../../utils/dateUtils';

export default function NewsDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('noticias')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      
      if (data) {
        setArticle(data);
        const { data: relatedData } = await supabase
          .from('noticias')
          .select('*')
          .eq('category', data.category)
          .eq('is_published', true)
          .neq('id', data.id)
          .limit(3);
        if (relatedData) setRelated(relatedData);
      }
      setLoading(false);
    };
    if (slug) fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      </div>
    );
  }

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
              dangerouslySetInnerHTML={{ __html: article.content }}
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

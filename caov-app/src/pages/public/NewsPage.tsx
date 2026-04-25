import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Search, ArrowRight, Calendar } from '../../icons';
import { formatRelativeDate } from '../../utils/dateUtils';
import './NewsPage.css';

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todas']);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const { data } = await supabase
        .from('noticias')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (data) {
        setNews(data);
        const cats = Array.from(new Set(data.map(n => n.category).filter(Boolean))) as string[];
        setCategories(['Todas', ...cats]);
      }
      setLoading(false);
    };
    fetchNews();
  }, []);

  const filtered = news.filter(article => {
    const matchCat = activeCategory === 'Todas' || article.category === activeCategory;
    const matchSearch = article.title.toLowerCase().includes(search.toLowerCase()) ||
      (article.excerpt || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="news-page">
      {/* Page Header */}
      <div className="page-header-banner">
        <div className="page-header-overlay" />
        <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=80" alt="Noticias" className="page-header-bg" />
        <div className="container page-header-content">
          <div className="section-label" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <span style={{ background: 'rgba(255,255,255,0.4)' }} /> C.A.O.V.
          </div>
          <h1 className="page-header-title">Noticias</h1>
          <p className="page-header-subtitle">Toda la actualidad del Club Atlético Oro Verde</p>
        </div>
      </div>

      <div className="section bg-white">
        <div className="container">
          {/* Filters */}
          <div className="news-filters">
            <div className="tabs">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`tab ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="news-search">
              <Search size={16} />
              <input
                type="search"
                placeholder="Buscar noticias..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="news-search-input"
              />
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
              <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
            </div>
          ) : filtered.length > 0 ? (
            <div className="news-full-grid stagger">
              {filtered.map((article, i) => (
                <Link key={article.id} to={`/noticias/${article.slug}`} className="news-full-card animate-fade-in-up">
                  <div className="news-full-card-img">
                    <img src={article.image_url} alt={article.title} />
                    <span className="badge badge-primary news-cat-badge">{article.category}</span>
                  </div>
                  <div className="news-full-card-body">
                    <div className="news-full-card-date">
                      <Calendar size={12} />
                      {formatRelativeDate(article.published_at || article.created_at)}
                    </div>
                    <h3 className="news-full-card-title">{article.title}</h3>
                    <p className="news-full-card-excerpt">{article.excerpt}</p>
                    <span className="news-read-more">
                      Leer más <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📰</div>
              <p className="empty-state-title">No se encontraron noticias</p>
              <p className="empty-state-text">Intentá con otra categoría o término de búsqueda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ShoppingBag, MessageCircle, Star } from '../../icons';
import { mockProducts } from '../../data/mockData';
import type { ProductCategory } from '../../types';
import './ShopPage.css';

const CATEGORIES: { value: ProductCategory | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todo' },
  { value: 'camisetas', label: '👕 Camisetas' },
  { value: 'shorts', label: '🩳 Shorts' },
  { value: 'accesorios', label: '🎩 Accesorios' },
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'todos'>('todos');

  const filtered = activeCategory === 'todos'
    ? mockProducts
    : mockProducts.filter(p => p.category === activeCategory);

  return (
    <div>
      <div className="page-header-banner">
        <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1400&q=80" alt="Tienda" className="page-header-bg" />
        <div className="page-header-overlay" />
        <div className="container page-header-content">
          <div className="section-label" style={{color:'rgba(255,255,255,0.6)'}}>
            <span style={{background:'rgba(255,255,255,0.4)'}} /> Shop Oficial
          </div>
          <h1 className="page-header-title">Tienda C.A.O.V.</h1>
          <p className="page-header-subtitle">Indumentaria y merchandising oficial del club</p>
        </div>
      </div>

      <div className="section" style={{background:'var(--color-bg-section)'}}>
        <div className="container">
          {/* Category Filter */}
          <div style={{marginBottom:'var(--space-10)'}}>
            <div className="tabs">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  className={`tab ${activeCategory === cat.value ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="shop-grid stagger">
            {filtered.map(product => (
              <div key={product.id} className="shop-card animate-fade-in-up">
                <div className="shop-card-img-wrap">
                  <img src={product.image_url} alt={product.name} className="shop-card-img" />
                  {!product.is_available && (
                    <div className="shop-sold-out-overlay">
                      <span>Sin Stock</span>
                    </div>
                  )}
                  <div className="shop-card-badge-cat">{product.category}</div>
                </div>
                <div className="shop-card-body">
                  <h3 className="shop-card-name">{product.name}</h3>
                  <p className="shop-card-desc">{product.description}</p>
                  <div className="shop-card-footer">
                    <div className="shop-card-price">
                      ${product.price.toLocaleString('es-AR')}
                    </div>
                    {product.is_available ? (
                      <a
                        href={product.whatsapp_link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        <MessageCircle size={14} />
                        Comprar por WhatsApp
                      </a>
                    ) : (
                      <span className="badge badge-danger">Sin Stock</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp CTA Banner */}
          <div className="shop-whatsapp-banner">
            <div className="shop-whatsapp-banner-icon">💬</div>
            <div>
              <h3 className="shop-whatsapp-title">¿No encontrás lo que buscás?</h3>
              <p className="shop-whatsapp-text">Contactanos directamente y te ayudamos a conseguirlo.</p>
            </div>
            <a
              href="https://wa.me/5493000000000?text=Hola!+Quiero+consultar+sobre+indumentaria+del+CAOV"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <MessageCircle size={16} /> Consultar al club
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

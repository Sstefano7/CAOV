import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PublicLayout from './components/layout/PublicLayout';
import HomePage from './pages/public/HomePage';
import NewsPage from './pages/public/NewsPage';
import NewsDetailPage from './pages/public/NewsDetailPage';
import FixturePage from './pages/public/FixturePage';
import RosterPage from './pages/public/RosterPage';
import ShopPage from './pages/public/ShopPage';
import PalmaresPage from './pages/public/PalmaresPage';
import GalleryPage from './pages/public/GalleryPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/auth/DashboardPage';
import './styles/index.css';
import './styles/layout.css';
import './styles/components.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Placeholder pages for auth (Fase 2)
function ComingSoonPage({ title }: { title: string }) {
  return (
    <div style={{ minHeight: '100vh', paddingTop: 'var(--header-total)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state">
        <div className="empty-state-icon">🚧</div>
        <h1 className="empty-state-title">{title}</h1>
        <p className="empty-state-text">Esta sección estará disponible próximamente. Estamos trabajando para vos.</p>
        <a href="/" className="btn btn-primary" style={{ marginTop: 'var(--space-6)' }}>Volver al Inicio</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/noticias" element={<NewsPage />} />
            <Route path="/noticias/:slug" element={<NewsDetailPage />} />
            <Route path="/fixture" element={<FixturePage />} />
            <Route path="/plantel" element={<RosterPage />} />
            <Route path="/tienda" element={<ShopPage />} />
            <Route path="/palmares" element={<PalmaresPage />} />
            <Route path="/galeria" element={<GalleryPage />} />
            <Route path="/sponsors" element={<ComingSoonPage title="Sponsors" />} />
            <Route path="/historia" element={<ComingSoonPage title="Historia del Club" />} />

            {/* Auth routes - Fase 2 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/mi-cuenta" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute requireAdmin><ComingSoonPage title="Panel de Administración" /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<ComingSoonPage title="Página no encontrada (404)" />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

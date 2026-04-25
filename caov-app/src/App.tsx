import './styles/index.css';
import './styles/layout.css';
import './styles/components.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layout público
import PublicLayout from './components/layout/PublicLayout';

// Páginas públicas
import HomePage from './pages/public/HomePage';
import NewsPage from './pages/public/NewsPage';
import NewsDetailPage from './pages/public/NewsDetailPage';
import FixturePage from './pages/public/FixturePage';
import RosterPage from './pages/public/RosterPage';
import ShopPage from './pages/public/ShopPage';
import PalmaresPage from './pages/public/PalmaresPage'; // Ahora es "Logros y Títulos"
import GalleryPage from './pages/public/GalleryPage';

// Auth
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/auth/DashboardPage';
import PendingPage from './pages/auth/PendingPage';
import RejectedPage from './pages/auth/RejectedPage';
import ProfesorDashboardPage from './pages/auth/ProfesorDashboardPage';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardHome from './pages/admin/AdminDashboardHome';
import UsersPage from './pages/admin/UsersPage';
import CuotasAdminPage from './pages/admin/CuotasAdminPage';
import CuotasConfigPage from './pages/admin/CuotasConfigPage';
import NoticiasAdminPage from './pages/admin/NoticiasAdminPage';
import GaleriaAdminPage from './pages/admin/GaleriaAdminPage';
import JugadoresAdminPage from './pages/admin/JugadoresAdminPage';
import LogrosAdminPage from './pages/admin/LogrosAdminPage';
import TiendaAdminPage from './pages/admin/TiendaAdminPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

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

            {/* ─── Rutas públicas ─── */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/noticias" element={<NewsPage />} />
              <Route path="/noticias/:slug" element={<NewsDetailPage />} />
              <Route path="/fixture" element={<FixturePage />} />
              <Route path="/plantel" element={<RosterPage />} />
              <Route path="/tienda" element={<ShopPage />} />

              {/* Logros y Títulos (antes Palmarés) */}
              <Route path="/logros" element={<PalmaresPage />} />
              {/* Redirect de la ruta vieja */}
              <Route path="/palmares" element={<Navigate to="/logros" replace />} />

              <Route path="/galeria" element={<GalleryPage />} />
              <Route path="/sponsors" element={<ComingSoonPage title="Sponsors" />} />
              <Route path="/historia" element={<ComingSoonPage title="Historia del Club" />} />

              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />

              {/* Páginas de estado de cuenta (accesibles sin aprobación) */}
              <Route path="/cuenta-pendiente" element={
                <ProtectedRoute>
                  <PendingPage />
                </ProtectedRoute>
              } />
              <Route path="/cuenta-rechazada" element={<RejectedPage />} />

              {/* Panel del socio/jugador */}
              <Route path="/mi-cuenta" element={
                <ProtectedRoute requireApproved>
                  <DashboardPage />
                </ProtectedRoute>
              } />

              {/* Panel del profesor */}
              <Route path="/mi-cuenta/profesor" element={
                <ProtectedRoute requireApproved>
                  <ProfesorDashboardPage />
                </ProtectedRoute>
              } />

              {/* 404 */}
              <Route path="*" element={<ComingSoonPage title="Página no encontrada (404)" />} />
            </Route>

            {/* ─── Panel de Administración ─── */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboardHome />} />
              <Route path="usuarios" element={<UsersPage />} />
              <Route path="cuotas" element={<CuotasAdminPage />} />
              <Route path="cuotas-config" element={<CuotasConfigPage />} />
              <Route path="noticias" element={<NoticiasAdminPage />} />
              <Route path="galeria" element={<GaleriaAdminPage />} />
              <Route path="jugadores" element={<JugadoresAdminPage />} />
              <Route path="logros" element={<LogrosAdminPage />} />
              <Route path="tienda" element={<TiendaAdminPage />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

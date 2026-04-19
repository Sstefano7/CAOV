import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }} />
      </div>
    );
  }

  if (!user) {
    // Si no está logueado, lo mandamos al login y guardamos adonde quería ir
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Si quiere ir a un área admin pero no tiene permisos, lo mandamos al panel normal
    return <Navigate to="/mi-cuenta" replace />;
  }

  return <>{children}</>;
}

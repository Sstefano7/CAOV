import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireApproved?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireApproved = false,
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, accountStatus } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Usuario con cuenta rechazada
  if (accountStatus === 'rechazado') {
    return <Navigate to="/cuenta-rechazada" replace />;
  }

  // Usuario con cuenta pendiente → solo puede ver la página de espera
  if (accountStatus === 'pendiente' && location.pathname !== '/cuenta-pendiente') {
    return <Navigate to="/cuenta-pendiente" replace />;
  }

  // Requiere admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/mi-cuenta" replace />;
  }

  // Requiere aprobado
  if (requireApproved && accountStatus !== 'aprobado') {
    return <Navigate to="/cuenta-pendiente" replace />;
  }

  return <>{children}</>;
}

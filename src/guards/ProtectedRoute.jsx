import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardPath } from '@/constants/roles';
import { Box, CircularProgress } from '@mui/material';

export function ProtectedRoute({ children, roles }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to={getDashboardPath(profile.role)} replace />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    const from = location.state?.from?.pathname || getDashboardPath(profile?.role);
    return <Navigate to={from} replace />;
  }

  return children;
}

export function SuperAdminRoute({ children }) {
  return <ProtectedRoute roles={['SUPER_ADMIN']}>{children}</ProtectedRoute>;
}

export function AdminRoute({ children }) {
  return <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>{children}</ProtectedRoute>;
}

export function TenantRoute({ children }) {
  return <ProtectedRoute roles={['TENANT']}>{children}</ProtectedRoute>;
}

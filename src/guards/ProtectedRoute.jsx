import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardPath } from '@/constants/roles';
import { Box, Button, CircularProgress, Typography } from '@mui/material';

function ProfileLoadError({ onRetry }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2, p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>Could not load your profile</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        We couldn&apos;t fetch your account details. Please try again.
      </Typography>
      <Button variant="contained" onClick={onRetry}>Retry</Button>
    </Box>
  );
}

export function ProtectedRoute({ children, roles }) {
  const { user, profile, loading, initializing, refreshProfile } = useAuth();
  const location = useLocation();

  if (loading || initializing) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile) {
    return <ProfileLoadError onRetry={refreshProfile} />;
  }

  if (roles && !roles.includes(profile.role)) {
    return <Navigate to={getDashboardPath(profile.role)} replace />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { user, profile, loading, initializing, refreshProfile } = useAuth();
  const location = useLocation();

  if (loading || initializing) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user && !profile) {
    return <ProfileLoadError onRetry={refreshProfile} />;
  }

  if (user && profile) {
    const from = location.state?.from?.pathname || getDashboardPath(profile.role);
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

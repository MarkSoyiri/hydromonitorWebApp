import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardPath } from '@/constants/roles';
import { Box, Typography } from '@mui/material';

export function RoleGuard({ children, allowedRoles, fallback }) {
  const { profile } = useAuth();

  if (!profile) return null;

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    if (fallback) return fallback;
    return <Navigate to={getDashboardPath(profile.role)} replace />;
  }

  return children;
}

export function TenantGuard({ children, fallback }) {
  return (
    <RoleGuard allowedRoles={['TENANT']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function AdminGuard({ children, fallback }) {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function SuperAdminGuard({ children, fallback }) {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

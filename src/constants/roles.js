export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  TENANT: 'TENANT',
  DEVICE: 'DEVICE',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.TENANT]: 'Tenant',
};

export const ROLE_COLORS = {
  [ROLES.SUPER_ADMIN]: 'error',
  [ROLES.ADMIN]: 'primary',
  [ROLES.TENANT]: 'success',
};

export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 3,
  [ROLES.ADMIN]: 2,
  [ROLES.TENANT]: 1,
};

export const ROLE_DASHBOARDS = {
  [ROLES.SUPER_ADMIN]: '/super-admin/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.TENANT]: '/app/dashboard',
};

export const getDashboardPath = (role) => ROLE_DASHBOARDS[role] || '/app/dashboard';

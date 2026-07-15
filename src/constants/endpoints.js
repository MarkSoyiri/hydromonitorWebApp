export const API_PREFIX = '/api';

export const ENDPOINTS = {
  HEALTH: `${API_PREFIX}/health`,
  AUTH: {
    LOGIN: `${API_PREFIX}/auth/login`,
    ME: `${API_PREFIX}/auth/me`,
    DEVICE_TOKEN: `${API_PREFIX}/auth/device-token`,
  },
  DASHBOARD: `${API_PREFIX}/dashboard`,
  BUILDINGS: `${API_PREFIX}/buildings`,
  ROOMS: `${API_PREFIX}/rooms`,
  DEVICES: `${API_PREFIX}/devices`,
  DEVICE_AUTH: `${API_PREFIX}/devices/auth`,
  TENANTS: `${API_PREFIX}/tenants`,
  ALERTS: `${API_PREFIX}/alerts`,
  BILLING: {
    CURRENT: `${API_PREFIX}/billing/current`,
    HISTORY: `${API_PREFIX}/billing/history`,
  },
  RATES: `${API_PREFIX}/rates`,
  ANALYTICS: {
    SYSTEM: `${API_PREFIX}/analytics/system`,
    BUILDINGS: `${API_PREFIX}/analytics/buildings`,
    DEVICES: `${API_PREFIX}/analytics/devices`,
    TENANTS: `${API_PREFIX}/analytics/tenants`,
  },
  TELEMETRY: `${API_PREFIX}/telemetry`,
  USAGE: `${API_PREFIX}/usage`,
  USERS: `${API_PREFIX}/users`,
};

export const buildPath = (base, ...parts) => {
  const segments = [base, ...parts].filter(Boolean);
  return segments.join('/');
};

export const deviceOpenValvePath = (deviceId) =>
  `${ENDPOINTS.DEVICES}/${deviceId}/open`;

export const deviceCloseValvePath = (deviceId) =>
  `${ENDPOINTS.DEVICES}/${deviceId}/close`;

export const deviceResetAlertPath = (deviceId) =>
  `${ENDPOINTS.DEVICES}/${deviceId}/reset`;

export const deviceStartSimPath = (deviceId) =>
  `${ENDPOINTS.DEVICES}/${deviceId}/start`;

export const deviceStopSimPath = (deviceId) =>
  `${ENDPOINTS.DEVICES}/${deviceId}/stop`;

export const deviceCommandsPath = (deviceId) =>
  `${ENDPOINTS.DEVICES}/${deviceId}/commands`;

export const deviceCommandAckPath = (deviceId) =>
  `${ENDPOINTS.DEVICES}/${deviceId}/commands/ack`;

export const deviceTokenPath = (deviceId) =>
  `${ENDPOINTS.DEVICES}/${deviceId}/token`;

export const deviceReadingsPath = (deviceId) =>
  `${ENDPOINTS.DEVICES}/${deviceId}/readings`;

export const roomPath = (roomId) => `${ENDPOINTS.ROOMS}/${roomId}`;
export const buildingPath = (buildingId) => `${ENDPOINTS.BUILDINGS}/${buildingId}`;
export const tenantPath = (tenantId) => `${ENDPOINTS.TENANTS}/${tenantId}`;
export const devicePath = (deviceId) => `${ENDPOINTS.DEVICES}/${deviceId}`;

export const analyticsBuildingPath = (buildingId) =>
  `${ENDPOINTS.ANALYTICS.BUILDINGS}/${buildingId}`;

export const analyticsDevicePath = (deviceId) =>
  `${ENDPOINTS.ANALYTICS.DEVICES}/${deviceId}`;

export const analyticsTenantPath = (tenantId) =>
  `${ENDPOINTS.ANALYTICS.TENANTS}/${tenantId}`;

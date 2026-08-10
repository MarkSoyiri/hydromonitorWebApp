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
  TENANTS: `${API_PREFIX}/tenants`,
  ALERTS: `${API_PREFIX}/alerts`,
  BILLING: {
    CURRENT: `${API_PREFIX}/billing/current`,
    HISTORY: `${API_PREFIX}/billing/history`,
    INVOICE: `${API_PREFIX}/billing/invoice`,
    PAYMENT_INVOICE: (paymentId) => `${API_PREFIX}/billing/invoice/${paymentId}`,
  },
  PAYMENTS: {
    SETUP: `${API_PREFIX}/payments/setup`,
    INITIALIZE: `${API_PREFIX}/payments/initialize`,
    VERIFY: (reference) => `${API_PREFIX}/payments/${reference}/verify`,
    GET: (reference) => `${API_PREFIX}/payments/${reference}`,
  },
  RATES: `${API_PREFIX}/rates`,
  ANALYTICS: {
    SYSTEM: `${API_PREFIX}/analytics/system`,
    BUILDINGS: `${API_PREFIX}/analytics/buildings`,
    DEVICES: `${API_PREFIX}/analytics/devices`,
    TENANTS: `${API_PREFIX}/analytics/tenants`,
  },
  TELEMETRY: `${API_PREFIX}/telemetry`,
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

export const deviceProvisionPath = () =>
  `${ENDPOINTS.DEVICES}/provision`;

export const deviceAssignBuildingPath = (deviceId) =>
  `${ENDPOINTS.DEVICES}/${deviceId}/assign-building`;

export const deviceAssignRoomPath = (deviceId) =>
  `${ENDPOINTS.DEVICES}/${deviceId}/assign`;

export const deviceUnassignPath = (deviceId) =>
  `${ENDPOINTS.DEVICES}/${deviceId}/unassign`;

export const deviceMaintenancePath = (deviceId) =>
  `${ENDPOINTS.DEVICES}/${deviceId}/maintenance`;

export const deviceTransferPath = (deviceId) =>
  `${ENDPOINTS.DEVICES}/${deviceId}/transfer`;

export const deviceRetirePath = (deviceId) =>
  `${ENDPOINTS.DEVICES}/${deviceId}/retire`;

export const deviceReadingsPath = (deviceId) =>
  `${ENDPOINTS.TELEMETRY}/${deviceId}/readings`;

export const deviceTelemetryPath = (deviceId) =>
  `${API_PREFIX}/deviceTelemetry/${deviceId}`;

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

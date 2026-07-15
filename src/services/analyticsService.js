import { apiGet } from './api';
import { ENDPOINTS, analyticsBuildingPath, analyticsDevicePath, analyticsTenantPath } from '@/constants';

export const analyticsService = {
  getSystem: () =>
    apiGet(ENDPOINTS.ANALYTICS.SYSTEM),

  getBuildingAnalytics: (buildingId) =>
    apiGet(analyticsBuildingPath(buildingId)),

  getDeviceAnalytics: (deviceId) =>
    apiGet(analyticsDevicePath(deviceId)),

  getTenantAnalytics: (tenantId) =>
    apiGet(analyticsTenantPath(tenantId)),
};

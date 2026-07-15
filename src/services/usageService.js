import { apiGet, apiPost } from './api';
import { ENDPOINTS, deviceReadingsPath } from '@/constants';

export const usageService = {
  getDeviceReadings: (deviceId, params) =>
    apiGet(deviceReadingsPath(deviceId), params),

  recordUsage: (data) =>
    apiPost(ENDPOINTS.USAGE, data),
};

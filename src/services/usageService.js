import { apiGet } from './api';
import { deviceReadingsPath } from '@/constants';

export const usageService = {
  getDeviceReadings: (deviceId, params) =>
    apiGet(deviceReadingsPath(deviceId), params),
};

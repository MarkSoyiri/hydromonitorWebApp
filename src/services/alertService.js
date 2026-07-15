import { apiGet, apiPost } from './api';
import { ENDPOINTS } from '@/constants';

export const alertService = {
  getAll: (params) =>
    apiGet(ENDPOINTS.ALERTS, params),

  getById: (alertId) =>
    apiGet(`${ENDPOINTS.ALERTS}/${alertId}`),

  resolve: (alertId) =>
    apiPost(`${ENDPOINTS.ALERTS}/${alertId}/resolve`),
};

import { apiGet } from './api';
import { ENDPOINTS } from '@/constants';

export const dashboardService = {
  getStats: () =>
    apiGet(ENDPOINTS.DASHBOARD),
};

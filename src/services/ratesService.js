import { apiGet, apiPut } from './api';
import { ENDPOINTS } from '@/constants';

export const ratesService = {
  getCurrent: () =>
    apiGet(ENDPOINTS.RATES),

  update: (data) =>
    apiPut(ENDPOINTS.RATES, data),
};

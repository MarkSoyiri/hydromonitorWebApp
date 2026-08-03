import { apiGet } from './api';
import { ENDPOINTS } from '@/constants';

export const billingService = {
  getCurrentBill: () =>
    apiGet(ENDPOINTS.BILLING.CURRENT),

  getHistory: () =>
    apiGet(ENDPOINTS.BILLING.HISTORY),
};

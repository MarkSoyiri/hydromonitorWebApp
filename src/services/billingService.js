import { apiGet, apiPost } from './api';
import { ENDPOINTS } from '@/constants';

export const billingService = {
  getCurrentBill: () =>
    apiGet(ENDPOINTS.BILLING.CURRENT),

  getHistory: () =>
    apiGet(ENDPOINTS.BILLING.HISTORY),

  recordPayment: (tenantId, data) =>
    apiPost(`${ENDPOINTS.BILLING.HISTORY.replace('/history', '')}/${tenantId}/pay`, data),
};

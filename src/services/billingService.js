import { apiGet, apiGetBlob } from './api';
import { ENDPOINTS } from '@/constants';

export const billingService = {
  getCurrentBill: () =>
    apiGet(ENDPOINTS.BILLING.CURRENT),

  getHistory: () =>
    apiGet(ENDPOINTS.BILLING.HISTORY),

  downloadInvoice: () =>
    apiGetBlob(ENDPOINTS.BILLING.INVOICE),

  downloadPaymentInvoice: (paymentId) =>
    apiGetBlob(ENDPOINTS.BILLING.PAYMENT_INVOICE(paymentId)),
};

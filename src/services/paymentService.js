import { apiPost, apiGet } from './api';
import { ENDPOINTS } from '@/constants';

/**
 * Talks to /api/payments on the backend. The backend holds PAYSTACK_SECRET_KEY;
 * this client only receives the access code / authorization URL and never sees
 * the secret. The hosted authorization URL is opened in a new tab (redirect
 * flow); after the tenant finishes, the pending transaction is verified.
 */
export const paymentService = {
  getSetup: () =>
    apiGet(ENDPOINTS.PAYMENTS.SETUP),

  initialize: () =>
    apiPost(ENDPOINTS.PAYMENTS.INITIALIZE, {
      callbackUrl: window.location.origin + window.location.pathname,
    }),

  verify: (reference) =>
    apiPost(ENDPOINTS.PAYMENTS.VERIFY(reference), {}),

  get: (reference) =>
    apiGet(ENDPOINTS.PAYMENTS.GET(reference)),
};
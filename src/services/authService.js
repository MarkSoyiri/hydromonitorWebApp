import { apiGet, apiPost, apiPut } from './api';
import { ENDPOINTS } from '@/constants';

export const authService = {
  login: (idToken) =>
    apiPost(ENDPOINTS.AUTH.LOGIN, {}, {
      headers: { Authorization: `Bearer ${idToken}` },
    }),

  getProfile: () =>
    apiGet(ENDPOINTS.AUTH.ME),

  updateProfile: (data) =>
    apiPut(ENDPOINTS.AUTH.ME, data),
};

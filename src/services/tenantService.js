import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { ENDPOINTS } from '@/constants';

export const tenantService = {
  getAll: () =>
    apiGet(ENDPOINTS.TENANTS),

  getById: (tenantId) =>
    apiGet(`${ENDPOINTS.TENANTS}/${tenantId}`),

  create: (data) =>
    apiPost(ENDPOINTS.TENANTS, data),

  update: (tenantId, data) =>
    apiPut(`${ENDPOINTS.TENANTS}/${tenantId}`, data),

  delete: (tenantId) =>
    apiDelete(`${ENDPOINTS.TENANTS}/${tenantId}`),
};

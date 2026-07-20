import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { ENDPOINTS } from '@/constants';

export const buildingService = {
  getAll: () =>
    apiGet(ENDPOINTS.BUILDINGS),

  getById: (buildingId) =>
    apiGet(`${ENDPOINTS.BUILDINGS}/${buildingId}`),

  create: (data) =>
    apiPost(ENDPOINTS.BUILDINGS, data),

  update: (buildingId, data) =>
    apiPut(`${ENDPOINTS.BUILDINGS}/${buildingId}`, data),

  delete: (buildingId) =>
    apiDelete(`${ENDPOINTS.BUILDINGS}/${buildingId}`),

  getAdmins: (buildingId) =>
    apiGet(`${ENDPOINTS.BUILDINGS}/${buildingId}/admins`),

  assignAdmin: (buildingId, adminId) =>
    apiPost(`${ENDPOINTS.BUILDINGS}/${buildingId}/admins`, { adminId }),

  unassignAdmin: (buildingId, adminId) =>
    apiDelete(`${ENDPOINTS.BUILDINGS}/${buildingId}/admins/${adminId}`),
};

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
};

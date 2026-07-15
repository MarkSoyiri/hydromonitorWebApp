import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { ENDPOINTS } from '@/constants';

export const roomService = {
  getAll: (buildingId) =>
    apiGet(ENDPOINTS.ROOMS, buildingId ? { buildingId } : undefined),

  getById: (roomId) =>
    apiGet(`${ENDPOINTS.ROOMS}/${roomId}`),

  create: (data) =>
    apiPost(ENDPOINTS.ROOMS, data),

  update: (roomId, data) =>
    apiPut(`${ENDPOINTS.ROOMS}/${roomId}`, data),

  delete: (roomId) =>
    apiDelete(`${ENDPOINTS.ROOMS}/${roomId}`),
};

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

  unassignTenant: async (roomId, tenantId) => {
    if (!tenantId) {
      return apiPut(`${ENDPOINTS.ROOMS}/${roomId}`, { tenantId: '', status: 'VACANT' });
    }

    const { data: tRes } = await apiGet(`${ENDPOINTS.TENANTS}/${tenantId}`);
    const tenantData = tRes?.data || tRes;
    const id = tenantData?.tenantId || tenantData?.uid || tenantData?.id || tenantId;

    await apiPut(`${ENDPOINTS.TENANTS}/${id}`, { roomId: '' });
    return apiPut(`${ENDPOINTS.ROOMS}/${roomId}`, { tenantId: '', status: 'VACANT' });
  },
};

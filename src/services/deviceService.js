import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { ENDPOINTS, devicePath, deviceOpenValvePath, deviceCloseValvePath, deviceResetAlertPath, deviceStartSimPath, deviceStopSimPath, deviceCommandsPath, deviceCommandAckPath, deviceTokenPath } from '@/constants';

export const deviceService = {
  getAll: () =>
    apiGet(ENDPOINTS.DEVICES),

  getById: (deviceId) =>
    apiGet(devicePath(deviceId)),

  create: (data) =>
    apiPost(ENDPOINTS.DEVICES, data),

  update: (deviceId, data) =>
    apiPut(devicePath(deviceId), data),

  delete: (deviceId) =>
    apiDelete(devicePath(deviceId)),

  openValve: (deviceId) =>
    apiPost(deviceOpenValvePath(deviceId)),

  closeValve: (deviceId) =>
    apiPost(deviceCloseValvePath(deviceId)),

  resetAlert: (deviceId) =>
    apiPost(deviceResetAlertPath(deviceId)),

  startSimulation: (deviceId) =>
    apiPost(deviceStartSimPath(deviceId)),

  stopSimulation: (deviceId) =>
    apiPost(deviceStopSimPath(deviceId)),

  getPendingCommand: (deviceId) =>
    apiGet(deviceCommandsPath(deviceId)),

  acknowledgeCommand: (deviceId, data) =>
    apiPost(deviceCommandAckPath(deviceId), data),

  generateToken: (deviceId) =>
    apiPost(deviceTokenPath(deviceId)),

  getByRoom: (roomId) =>
    apiGet(ENDPOINTS.DEVICES, { roomId }),
};

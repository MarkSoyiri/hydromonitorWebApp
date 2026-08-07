import { apiGet, apiPost, apiPut, apiDelete } from './api';
import {
  ENDPOINTS, devicePath, deviceOpenValvePath, deviceCloseValvePath,
  deviceResetAlertPath, deviceStartSimPath, deviceStopSimPath,
  deviceCommandsPath, deviceCommandAckPath, deviceTokenPath, deviceTelemetryPath,
  deviceProvisionPath, deviceAssignBuildingPath, deviceAssignRoomPath,
  deviceUnassignPath, deviceMaintenancePath, deviceTransferPath, deviceRetirePath,
} from '@/constants';

export const deviceService = {
  getAll: () =>
    apiGet(ENDPOINTS.DEVICES),

  getById: (deviceId) =>
    apiGet(devicePath(deviceId)),

  getLiveTelemetry: (deviceId) =>
    apiGet(deviceTelemetryPath(deviceId)),

  create: (data) =>
    apiPost(ENDPOINTS.DEVICES, data),

  update: (deviceId, data) =>
    apiPut(devicePath(deviceId), data),

  delete: (deviceId) =>
    apiDelete(devicePath(deviceId)),

  // First-boot claim performed by the firmware; exposed for provisioning tooling.
  provision: (data) =>
    apiPost(deviceProvisionPath(), data),

  // Lifecycle — assign to building (PROVISIONING -> AVAILABLE, Super Admin).
  assignToBuilding: (deviceId, buildingId) =>
    apiPost(deviceAssignBuildingPath(deviceId), { buildingId }),

  // Assign to room (AVAILABLE -> ACTIVE, Admin within the device building).
  assignToRoom: (deviceId, roomId) =>
    apiPost(deviceAssignRoomPath(deviceId), { roomId }),

  unassignFromRoom: (deviceId) =>
    apiPost(deviceUnassignPath(deviceId)),

  setMaintenance: (deviceId, maintenance) =>
    apiPost(deviceMaintenancePath(deviceId), { maintenance }),

  transferToBuilding: (deviceId, buildingId) =>
    apiPost(deviceTransferPath(deviceId), { buildingId }),

  retire: (deviceId) =>
    apiPost(deviceRetirePath(deviceId)),

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

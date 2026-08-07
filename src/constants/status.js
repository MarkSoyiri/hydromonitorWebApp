export const STATUS = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
  VACANT: 'VACANT',
  OCCUPIED: 'OCCUPIED',
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
};

// Device lifecycle states (managed through the provisioning/assignment
// endpoints). OFFLINE remains a runtime telemetry flag, not a lifecycle state.
export const DEVICE_LIFECYCLE = {
  PROVISIONING: 'PROVISIONING',
  AVAILABLE: 'AVAILABLE',
  ACTIVE: 'ACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  RETIRED: 'RETIRED',
};

export const STATUS_COLORS = {
  ACTIVE: 'success',
  DISABLED: 'error',
  VACANT: 'warning',
  OCCUPIED: 'success',
  ONLINE: 'success',
  OFFLINE: 'error',
  PENDING: 'warning',
  RESOLVED: 'success',
  OPEN: 'success',
  CLOSED: 'error',
  PROVISIONING: 'warning',
  AVAILABLE: 'info',
  MAINTENANCE: 'warning',
  RETIRED: 'error',
};

import { useEffect, useMemo, useState } from 'react';
import {
  getDatabase,
  ref as dbRef,
  onValue,
  off,
  connectDatabaseEmulator,
} from 'firebase/database';
import app from './firebase';

const db = getDatabase(app);

if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectDatabaseEmulator(db, 'localhost', 9000);
}

export const NODES = {
  devices: 'devices',
  deviceTelemetry: 'deviceTelemetry',
  deviceCommands: 'deviceCommands',
  deviceCommandResults: 'deviceCommandResults',
  alerts: 'alerts',
  buildings: 'buildings',
  rooms: 'rooms',
  users: 'users',
  readings: 'readings',
  rates: 'rates',
  billingHistory: 'billingHistory',
};

const toMap = (snapshot) => (snapshot.exists() ? snapshot.val() : {});
const toList = (snapshot) =>
  snapshot.exists() ? Object.values(snapshot.val()) : [];

const makeErrorHandler = (path) => (error) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(`[realtime] listener error on "${path}"`, error);
  }
};

// Replicates the backend's DeviceTelemetryService.toTelemetryView shape so the
// live `deviceTelemetry` node maps to the same `telemetry` object the REST API
// already returns.
export function telemetryView(node) {
  if (!node) return null;

  return {
    status: node.status ?? 'OFFLINE',
    valveStatus: node.valveStatus ?? 'CLOSED',
    currentFlowRate: node.currentFlowRate ?? 0,
    totalUsage: node.totalUsage ?? 0,
    batteryLevel: node.batteryLevel ?? null,
    signalStrength: node.signalStrength ?? node.wifiStrength ?? null,
    wifiStrength: node.wifiStrength ?? null,
    leakDetected: node.leakDetected ?? false,
    leakSeverity: node.leakSeverity ?? null,
    lastSeen: node.lastSeen ?? 0,
    heartbeatAt: node.heartbeatAt ?? 0,
    online: node.online ?? false,
    firmwareVersion: node.firmwareVersion ?? null,
    uptime: node.uptime ?? null,
    lastTelemetry: node.lastTelemetry ?? null,
  };
}

// Mirrors the backend attachTelemetryToDevices join.
export function attachTelemetryToDevices(deviceList, telemetryMap) {
  if (!Array.isArray(deviceList)) return deviceList;

  return deviceList.map((device) => {
    if (!device || !device.deviceId) return device;

    const node = telemetryMap[device.deviceId];

    return {
      ...device,
      online: node?.online ?? device.online ?? false,
      lastSeen: node?.lastSeen ?? device.lastSeen ?? 0,
      telemetry: node ? telemetryView(node) : device.telemetry ?? null,
    };
  });
}

export function useRealtimeMap(path) {
  const [state, setState] = useState({ data: {}, loaded: false });

  useEffect(() => {
    if (!path) {
      setState({ data: {}, loaded: false });
      return undefined;
    }
    const reference = dbRef(db, path);
    const handler = (snapshot) =>
      setState({ data: toMap(snapshot), loaded: true });
    onValue(reference, handler, makeErrorHandler(path));
    return () => off(reference, 'value', handler);
  }, [path]);

  return state;
}

export function useRealtimeList(path) {
  const [state, setState] = useState({ data: [], loaded: false });

  useEffect(() => {
    if (!path) {
      setState({ data: [], loaded: false });
      return undefined;
    }
    const reference = dbRef(db, path);
    const handler = (snapshot) =>
      setState({ data: toList(snapshot), loaded: true });
    onValue(reference, handler, makeErrorHandler(path));
    return () => off(reference, 'value', handler);
  }, [path]);

  return state;
}

export function useRealtimeValue(path) {
  const [state, setState] = useState({ value: undefined, loaded: false });

  useEffect(() => {
    if (!path) {
      setState({ value: undefined, loaded: false });
      return undefined;
    }
    const reference = dbRef(db, path);
    const handler = (snapshot) =>
      setState({
        value: snapshot.exists() ? snapshot.val() : undefined,
        loaded: true,
      });
    onValue(reference, handler, makeErrorHandler(path));
    return () => off(reference, 'value', handler);
  }, [path]);

  return state;
}

// Subscribes `devices` + `deviceTelemetry` and returns REST-shaped device rows
// with live telemetry joined on.
export function useLiveDevices() {
  const devicesState = useRealtimeMap(NODES.devices);
  const telemetryState = useRealtimeMap(NODES.deviceTelemetry);

  const devices = useMemo(
    () =>
      attachTelemetryToDevices(
        Object.values(devicesState.data || {}),
        telemetryState.data || {}
      ),
    [devicesState.data, telemetryState.data]
  );

  return { devices, loaded: devicesState.loaded && telemetryState.loaded };
}

// Live device row for the detail page (metadata + telemetry merged).
export function useLiveDevice(deviceId) {
  const metadataState = useRealtimeValue(
    deviceId ? `${NODES.devices}/${deviceId}` : null
  );
  const telemetryState = useRealtimeValue(
    deviceId ? `${NODES.deviceTelemetry}/${deviceId}` : null
  );

  const device = useMemo(() => {
    const raw = metadataState.value;
    const node = telemetryState.value;

    if (!raw) return null;

    return {
      ...raw,
      online: node?.online ?? raw.online ?? false,
      lastSeen: node?.lastSeen ?? raw.lastSeen ?? 0,
      telemetry: node ? telemetryView(node) : raw.telemetry ?? null,
    };
  }, [metadataState.value, telemetryState.value]);

  return { device, loaded: metadataState.loaded && telemetryState.loaded };
}

export function useLiveTelemetry(deviceId) {
  const telemetryState = useRealtimeValue(
    deviceId ? `${NODES.deviceTelemetry}/${deviceId}` : null
  );

  const telemetry = useMemo(
    () => (telemetryState.value ? telemetryView(telemetryState.value) : null),
    [telemetryState.value]
  );

  return { telemetry, loaded: telemetryState.loaded };
}

export function useLiveAlerts() {
  const alertsState = useRealtimeMap(NODES.alerts);

  const alerts = useMemo(
    () =>
      Object.values(alertsState.data || {})
        .map((alert) => ({
          ...alert,
          // The REST shape never carried a status field; derive it from the
          // model's resolved flag so tab filters behave correctly.
          status: alert.resolved ? 'RESOLVED' : alert.status || 'PENDING',
        }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    [alertsState.data]
  );

  return { alerts, loaded: alertsState.loaded };
}

export function useLiveTenants() {
  const usersState = useRealtimeMap(NODES.users);

  const tenants = useMemo(
    () =>
      Object.values(usersState.data || {}).filter(
        (user) => user.role === 'TENANT'
      ),
    [usersState.data]
  );

  return { tenants, loaded: usersState.loaded };
}

// Increments whenever any child under the given paths changes. Used to
// trigger debounced REST refetches for server-computed analytics/reports.
export function useLiveTick(paths) {
  const [tick, setTick] = useState(0);
  const key = (paths || []).join('|');

  useEffect(() => {
    if (!paths || paths.length === 0) return undefined;

    const references = paths.map((path) => dbRef(db, path));
    const handler = () => setTick((t) => t + 1);

    references.forEach((reference) =>
      onValue(reference, handler, makeErrorHandler(paths.join(', ')))
    );
    return () =>
      references.forEach((reference) => off(reference, 'value', handler));
    // re-subscribe only when the path set changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return tick;
}

export { db, dbRef, onValue, off };
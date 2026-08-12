import { useEffect, useMemo, useState } from 'react';
import {
  getDatabase,
  ref as dbRef,
  onValue,
  off,
  query,
  orderByChild,
  equalTo,
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

// Mirrors the backend's OfflineDetectionService.OFFLINE_TIMEOUT. The ESP32
// heartbeats every 60s, so a device with no heartbeat for 2 minutes is offline.
const STALE_MS = 2 * 60 * 1000;

// Offline is decided by heartbeat freshness so the UI flips without waiting
// for the server-side offline check (Vercel cron is capped at 1/day on
// Hobby; a GitHub Actions cron keeps the server flag/alerts in sync too).
export function isOnline(node, device, now = Date.now()) {
  if (!node) return device?.online ?? false;
  if (node.online === false) return false;
  const heartbeatAt = node.heartbeatAt || 0;
  return heartbeatAt > 0 && now - heartbeatAt < STALE_MS;
}

// Re-renders on a fixed cadence so staleness flips offline chips even when no
// RTDB event arrives (e.g. a device that simply stopped heartbeating).
function useNow(intervalMs) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

// Mirrors the backend attachTelemetryToDevices join.
export function attachTelemetryToDevices(deviceList, telemetryMap, now = Date.now()) {
  if (!Array.isArray(deviceList)) return deviceList;

  return deviceList.map((device) => {
    if (!device || !device.deviceId) return device;

    const node = telemetryMap[device.deviceId];

    return {
      ...device,
      online: isOnline(node, device, now),
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
  const now = useNow(15000);

  const devices = useMemo(
    () => {
      const raw = Object.entries(devicesState.data || {});
      const rows = raw.map(([key, device]) => ({
        ...device,
        // RTDB keys are the canonical deviceId; fall back to the node key for
        // records whose identity fields were lost by legacy writes.
        deviceId: device?.deviceId || key,
      }));
      return attachTelemetryToDevices(rows, telemetryState.data || {}, now);
    },
    [devicesState.data, telemetryState.data, now]
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
  const now = useNow(15000);

  const device = useMemo(() => {
    const raw = metadataState.value;
    const node = telemetryState.value;

    if (!raw) return null;

    return {
      ...raw,
      online: isOnline(node, raw, now),
      lastSeen: node?.lastSeen ?? raw.lastSeen ?? 0,
      telemetry: node ? telemetryView(node) : raw.telemetry ?? null,
    };
  }, [metadataState.value, telemetryState.value, now]);

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

// Query-scoped alerts for tenant screens: only alerts in the tenant's own
// building are fetched, so the RTDB rule `query.equalTo === buildingId`
// matches (the whole-node useLiveAlerts read is admin-only under the rules).
export function useLiveAlertsByBuilding(buildingId) {
  const [state, setState] = useState({ alerts: [], loaded: false });

  useEffect(() => {
    if (!buildingId) {
      setState({ alerts: [], loaded: false });
      return undefined;
    }
    const reference = query(
      dbRef(db, NODES.alerts),
      orderByChild('buildingId'),
      equalTo(buildingId)
    );
    const handler = (snapshot) =>
      setState({ alerts: toList(snapshot), loaded: true });
    onValue(reference, handler, makeErrorHandler(`alerts?buildingId=${buildingId}`));
    return () => off(reference, 'value', handler);
  }, [buildingId]);

  return state;
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
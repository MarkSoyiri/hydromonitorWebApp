import { useState, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Chip, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Stack, Typography,
} from '@mui/material';
import {
  Warning, Error as ErrorIcon, Info, OfflineBolt, Construction,
  CheckCircle, Business, Person, Schedule, DevicesOther,
} from '@mui/icons-material';
import { PageHeader, StatCard, DataTable, StatusChip, IdBadge } from '@/components/common';
import {
  useLiveAlerts, useLiveDevices, useRealtimeList, useRealtimeMap, NODES,
} from '@/services/realtime';
import { useAuth } from '@/contexts/AuthContext';
import { alertService } from '@/services';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';

dayjs.extend(relativeTime);

const alertColor = (r) => {
  const type = r?.type || 'INFO';
  const severity = r?.severity || 'NONE';
  if ((type === 'LEAK' || type === 'CRITICAL') && (severity === 'CRITICAL' || severity === 'HIGH')) return 'error';
  if (type === 'LEAK' || type === 'CRITICAL') return 'warning';
  if (type === 'VALVE_FAULT' || type === 'OFFLINE') return 'warning';
  if (type === 'SYSTEM') return 'secondary';
  return 'info';
};

const alertIcon = (r) => {
  const type = r?.type || '';
  if (type === 'LEAK' || type === 'CRITICAL') return <Warning />;
  if (type === 'OFFLINE') return <OfflineBolt />;
  if (type === 'VALVE_FAULT') return <Construction />;
  if (type === 'SYSTEM') return <Info />;
  return <Info />;
};

const alertTime = (r) => {
  const ts = r?.createdAt || r?.timestamp;
  return ts ? dayjs(ts).format('MMM D, YYYY HH:mm') : '—';
};

const alertRelative = (r) => {
  const ts = r?.createdAt || r?.timestamp;
  return ts ? dayjs(ts).fromNow() : '';
};

function DetailRow({ icon, label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 0.75 }}>
      <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', pt: 0.25 }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
          {value || '—'}
        </Typography>
      </Box>
    </Box>
  );
}

export function AlertsPage() {
  const { user, isSuperAdmin } = useAuth();
  const { alerts, loaded } = useLiveAlerts();
  const { devices } = useLiveDevices();
  const roomsState = useRealtimeList(NODES.rooms);
  const buildingsState = useRealtimeMap(NODES.buildings);
  const usersState = useRealtimeMap(NODES.users);

  const [tab, setTab] = useState(0);
  const [detailAlert, setDetailAlert] = useState(null);
  const [resolving, setResolving] = useState(false);

  // Lookups for human-readable names (device/brand/room/tenant).
  const devicesById = useMemo(
    () => new Map(devices.map((d) => [d.deviceId, d])),
    [devices]
  );
  const roomsById = useMemo(
    () => new Map(
      roomsState.data
        .map((r) => [r.roomId ?? r.id ?? r.key, r])
        .filter(([k]) => k != null)
    ),
    [roomsState.data]
  );
  const buildingsById = useMemo(
    () => new Map(
      Object.values(buildingsState.data || {})
        .map((b) => [b.buildingId, b])
        .filter(([k]) => k != null)
    ),
    [buildingsState.data]
  );
  const usersById = useMemo(
    () => new Map(
      Object.entries(usersState.data || {})
        .map(([key, u]) => [u?.uid ?? key, u])
    ),
    [usersState.data]
  );

  // Admins only see alerts from their assigned buildings (building.admins /
  // owner); the super admin sees everything. Mirrors the backend ownership check.
  const uid = user?.uid;
  const allBuildings = Object.values(buildingsState.data || {});
  const allowedBuildings = isSuperAdmin
    ? allBuildings
    : allBuildings.filter((b) => (b.admins && b.admins[uid]) || b.ownerAdminId === uid);
  const allowedBuildingIds = useMemo(
    () => new Set(allowedBuildings.map((b) => b.buildingId)),
    [allowedBuildings]
  );
  const scopedAlerts = isSuperAdmin
    ? alerts
    : alerts.filter((a) => allowedBuildingIds.has(a.buildingId));

  const enrichedAlerts = useMemo(
    () => scopedAlerts.map((a) => {
      const device = a.deviceId ? devicesById.get(a.deviceId) : null;
      const room = a.roomId ? roomsById.get(a.roomId) : null;
      const building = a.buildingId ? buildingsById.get(a.buildingId) : null;
      const tenant = a.tenantId ? usersById.get(a.tenantId) : null;
      return {
        ...a,
        deviceName: device?.deviceName || device?.name || '',
        serialNumber: device?.serialNumber || '',
        buildingName: building?.name || '',
        roomNumber: room?.roomNumber || '',
        tenantName: tenant?.fullName || tenant?.name || '',
      };
    }),
    [scopedAlerts, devicesById, roomsById, buildingsById, usersById]
  );

  const activeAlerts = enrichedAlerts.filter((a) => a.status !== 'RESOLVED');
  const resolvedAlerts = enrichedAlerts.filter((a) => a.status === 'RESOLVED');
  const leakAlerts = enrichedAlerts.filter((a) => a.type === 'LEAK');
  const criticalAlerts = enrichedAlerts.filter((a) => a.type === 'CRITICAL');

  const displayAlerts = tab === 0 ? enrichedAlerts
    : tab === 1 ? activeAlerts
      : tab === 2 ? resolvedAlerts
        : tab === 3 ? leakAlerts
          : criticalAlerts;

  const handleResolve = async () => {
    setResolving(true);
    try {
      await alertService.resolve(detailAlert.alertId);
      toast.success('Alert resolved');
      setDetailAlert(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to resolve alert');
    } finally {
      setResolving(false);
    }
  };

  const columns = [
    {
      field: 'type', label: 'Type', width: 120,
      render: (r) => (
        <Chip
          icon={alertIcon(r)}
          label={r.type || 'INFO'}
          color={alertColor(r)}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'deviceId', label: 'Device', width: 190,
      render: (r) => (
        r.deviceName
          ? (
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{r.deviceName}</Typography>
              {r.serialNumber && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                  {r.serialNumber}
                </Typography>
              )}
            </Box>
          )
          : <IdBadge id={r.deviceId} entity="device" />
      ),
    },
    {
      field: 'buildingId', label: 'Location', width: 200,
      render: (r) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, overflowWrap: 'anywhere' }}>
            {r.buildingName || (r.buildingId ? <IdBadge id={r.buildingId} entity="building" /> : '—')}
          </Typography>
          {r.roomNumber && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
              Room {r.roomNumber}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'severity', label: 'Severity', width: 90,
      render: (r) => (
        r.severity
          ? <Chip label={r.severity} size="small" color={r.severity === 'CRITICAL' ? 'error' : r.severity === 'HIGH' ? 'warning' : 'default'} sx={{ fontWeight: 600 }} />
          : '—'
      ),
    },
    { field: 'message', label: 'Message', width: 260 },
    { field: 'status', label: 'Status', width: 110, render: (r) => <StatusChip status={r.status || 'PENDING'} /> },
    {
      field: 'createdAt', label: 'Time', width: 190,
      render: (r) => (
        <Box>
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            {alertRelative(r) || '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block' }}>
            {alertTime(r)}
          </Typography>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <PageHeader title="Alerts" subtitle="Real-time alerts and notifications" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          <Grid item xs={6} sm={3}>
            <StatCard title="Total" value={enrichedAlerts.length} icon={<Warning />} color="primary" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Active" value={activeAlerts.length} icon={<ErrorIcon />} color="error" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Leaks" value={leakAlerts.length} icon={<Warning />} color="warning" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Critical" value={criticalAlerts.length} icon={<ErrorIcon />} color="error" />
          </Grid>
        </Grid>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, '& .MuiTab-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' }, minWidth: { xs: 'auto', sm: 90 }, px: { xs: 1.5, sm: 2 } } }}>
              <Tab label="All" />
              <Tab label="Active" />
              <Tab label="Resolved" />
              <Tab label="Leaks" />
              <Tab label="Critical" />
            </Tabs>
            <DataTable
              columns={columns}
              rows={displayAlerts}
              loading={!loaded}
              onRowClick={(row) => setDetailAlert(row)}
            />
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={!!detailAlert} onClose={() => setDetailAlert(null)} maxWidth="sm" fullWidth>
        {detailAlert && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip icon={alertIcon(detailAlert)} label={detailAlert.type || 'INFO'} color={alertColor(detailAlert)} size="small" sx={{ fontWeight: 600 }} />
                {detailAlert.severity && <Chip label={detailAlert.severity} size="small" color={detailAlert.severity === 'CRITICAL' ? 'error' : detailAlert.severity === 'HIGH' ? 'warning' : 'default'} sx={{ fontWeight: 600 }} />}
                <Chip label={detailAlert.status || 'PENDING'} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={1} sx={{ mt: 0.5 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
                    {detailAlert.message || 'No additional description.'}
                  </Typography>
                </Box>
                <DetailRow icon={<Schedule sx={{ fontSize: 18 }} />} label="Triggered" value={`${alertTime(detailAlert)} (${alertRelative(detailAlert)})`} />
                <DetailRow
                  icon={<Business sx={{ fontSize: 18 }} />}
                  label="Location"
                  value={`${detailAlert.buildingName || detailAlert.buildingId || '—'}${detailAlert.roomNumber ? ` · Room ${detailAlert.roomNumber}` : ''}`}
                />
                <DetailRow
                  icon={<DevicesOther sx={{ fontSize: 18 }} />}
                  label="Device"
                  value={detailAlert.deviceName
                    ? `${detailAlert.deviceName}${detailAlert.serialNumber ? ` · ${detailAlert.serialNumber}` : ''}`
                    : detailAlert.deviceId || '—'}
                />
                <DetailRow icon={<Person sx={{ fontSize: 18 }} />} label="Tenant" value={detailAlert.tenantName || '—'} />
                {detailAlert.resolvedAt && detailAlert.resolvedBy && (
                  <DetailRow
                    icon={<CheckCircle sx={{ fontSize: 18 }} />}
                    label="Resolved"
                    value={`${detailAlert.resolvedBy} · ${dayjs(detailAlert.resolvedAt).format('MMM D, YYYY HH:mm')}`}
                  />
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
              <Button onClick={() => setDetailAlert(null)} fullWidth>Close</Button>
              {detailAlert.status !== 'RESOLVED' && (
                <Button onClick={handleResolve} variant="contained" color="success" disabled={resolving} fullWidth>
                  {resolving ? 'Resolving…' : 'Resolve Alert'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
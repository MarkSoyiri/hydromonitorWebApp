import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, IconButton, Button, Stack, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import {
  ArrowBack, Wifi, SignalCellularAlt, Warning,
  PlayArrow, Stop, Refresh, History, HourglassEmpty, CheckCircle,
  MeetingRoom, Business, SwapHoriz, Construction, Block,
} from '@mui/icons-material';
import { StatCard, StatusChip, PageHeader, LoadingScreen, BuildingSelector } from '@/components/common';
import { deviceService, roomService } from '@/services';
import { useLiveDevice, useRealtimeValue, NODES } from '@/services/realtime';
import { extractList } from '@/utils/response';
import { DEVICE_LIFECYCLE } from '@/constants';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useBackNavigation } from '@/hooks/useBackNavigation';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

const fallbackTelemetryHistory = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  flow: 0,
}));

export function DeviceDetailPage() {
  const { deviceId } = useParams();
  const { isSuperAdmin, assignedBuildings } = useAuth();
  const basePath = isSuperAdmin ? '/super-admin' : '/admin';
  const goBack = useBackNavigation(`${basePath}/devices`);
  const { device, loaded } = useLiveDevice(deviceId);
  const { value: pendingCommand } = useRealtimeValue(
    deviceId ? `${NODES.deviceCommands}/${deviceId}/pendingCommand` : null
  );
  const { value: commandResults } = useRealtimeValue(
    deviceId ? `${NODES.deviceCommandResults}/${deviceId}` : null
  );
  const [commandLoading, setCommandLoading] = useState(false);
  const [readings, setReadings] = useState([]);

  // Lifecycle dialogs.
  const [buildingDialog, setBuildingDialog] = useState(false);
  const [buildingForm, setBuildingForm] = useState({ buildingId: '' });
  const [buildingSaving, setBuildingSaving] = useState(false);
  const [roomDialog, setRoomDialog] = useState(false);
  const [roomForm, setRoomForm] = useState({ roomId: '' });
  const [roomSaving, setRoomSaving] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const canManageDevice = isSuperAdmin ||
    (device?.buildingId && assignedBuildings.some((b) => (b.buildingId || b.id) === device.buildingId));
  const lifecycle = device?.status || DEVICE_LIFECYCLE.PROVISIONING;

  const loadRooms = useCallback(async () => {
    const buildingId = device?.buildingId;
    if (!buildingId) return;
    try {
      const { data } = await roomService.getAll(buildingId);
      if (data?.success) {
        const allRooms = extractList(data.data);
        const roomIds = new Set(
          device ? [device.roomId].filter(Boolean) : []
        );
        setRooms(allRooms.filter((r) => !roomIds.has(r.roomId)));
      }
    } catch {
      setRooms([]);
    }
  }, [device]);

  const openBuildingDialog = () => {
    setBuildingForm({ buildingId: '' });
    setBuildingDialog(true);
  };

  const openRoomDialog = () => {
    setRoomForm({ roomId: '' });
    setRooms([]);
    setRoomDialog(true);
    loadRooms();
  };

  const handleAssignBuilding = async () => {
    if (!buildingForm.buildingId) { toast.error('Select a building'); return; }
    setBuildingSaving(true);
    try {
      await deviceService.assignToBuilding(deviceId, buildingForm.buildingId);
      toast.success('Device assigned to building');
      setBuildingDialog(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to assign building');
    } finally {
      setBuildingSaving(false);
    }
  };

  const handleAssignRoom = async () => {
    if (!roomForm.roomId) { toast.error('Select a room'); return; }
    setRoomSaving(true);
    try {
      await deviceService.assignToRoom(deviceId, roomForm.roomId);
      toast.success('Device assigned to room');
      setRoomDialog(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to assign room');
    } finally {
      setRoomSaving(false);
    }
  };

  const runLifecycle = async (fn, successMsg) => {
    setActionLoading(true);
    try {
      await fn();
      toast.success(successMsg);
    } catch (err) {
      toast.error(err?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnassign = () =>
    runLifecycle(() => deviceService.unassignFromRoom(deviceId), 'Device unassigned from room');

  const handleMaintenance = () => {
    const enable = lifecycle !== DEVICE_LIFECYCLE.MAINTENANCE;
    return runLifecycle(
      () => deviceService.setMaintenance(deviceId, enable),
      enable ? 'Device moved to maintenance' : 'Maintenance ended'
    );
  };

  const handleTransfer = async () => {
    if (!buildingForm.buildingId) { toast.error('Select a target building'); return; }
    setBuildingSaving(true);
    try {
      await deviceService.transferToBuilding(deviceId, buildingForm.buildingId);
      toast.success('Device transferred');
      setBuildingDialog(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to transfer device');
    } finally {
      setBuildingSaving(false);
    }
  };

  const handleRetire = () =>
    runLifecycle(() => deviceService.retire(deviceId), 'Device retired');

  const fetchReadings = useCallback(async () => {
    try {
      const readingsRes = await usageService.getDeviceReadings(deviceId);
      if (readingsRes.data?.success) {
        const list = extractList(readingsRes.data.data);
        setReadings(list.map((r) => ({
          time: r.timestamp ? dayjs(r.timestamp).format('HH:mm') : '',
          flow: r.flowRate || r.flow || 0,
        })));
      }
    } catch {
      // chart stays on fallback data
    }
  }, [deviceId]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  // Append live telemetry to the chart so it advances without polling.
  const liveTelemetry = device?.telemetry;
  useEffect(() => {
    const lastTelemetry = liveTelemetry?.lastTelemetry;
    if (!lastTelemetry?.timestamp) return;
    setReadings((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.time === dayjs(lastTelemetry.timestamp).format('HH:mm')) {
        return prev;
      }
      const next = [
        ...prev,
        {
          time: dayjs(lastTelemetry.timestamp).format('HH:mm'),
          flow: lastTelemetry.flowRate || 0,
        },
      ];
      return next.slice(-50);
    });
  }, [liveTelemetry?.lastTelemetry]);

  const lastCommand = useMemo(
    () => commandResults?.lastCommand || null,
    [commandResults]
  );

  const sendCommand = async (action) => {
    setCommandLoading(true);
    try {
      const commandMap = {
        OPEN: () => deviceService.openValve(deviceId),
        CLOSE: () => deviceService.closeValve(deviceId),
        RESET_ALERT: () => deviceService.resetAlert(deviceId),
        START_SIMULATION: () => deviceService.startSimulation(deviceId),
        STOP_SIMULATION: () => deviceService.stopSimulation(deviceId),
      };
      const fn = commandMap[action];
      if (!fn) {
        toast.error(`Unknown command: ${action}`);
        return;
      }
      const { data } = await fn();
      if (data?.success) {
        toast.success(`Command "${action}" sent`);
      } else {
        toast.error(data?.message || 'Command failed');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to send command');
    } finally {
      setCommandLoading(false);
    }
  };

  if (!loaded) return <LoadingScreen />;
  if (!device) return <PageHeader title="Device not found" />;

  const telemetry = device.telemetry || {};

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <IconButton onClick={goBack} size="small" sx={{ minWidth: { xs: 44, sm: 'auto' }, minHeight: { xs: 44, sm: 'auto' } }}><ArrowBack /></IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>{device.deviceName}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {device.serialNumber} · {device.buildingId || 'No building'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <StatusChip status={lifecycle} />
            <StatusChip status={telemetry.status || 'OFFLINE'} />
            <StatusChip status={telemetry.valveStatus === 'OPEN' ? 'OPEN' : 'CLOSED'} />

            {telemetry.leakDetected && <Chip icon={<Warning />} label="LEAK" color="error" size="small" />}
          </Box>
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          <Grid item xs={6} sm={3}>
            <StatCard title="Flow Rate" value={`${telemetry.currentFlowRate || 0} L/min`} icon={<Wifi />} color="primary" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Total Usage" value={`${(telemetry.totalUsage || 0).toLocaleString()} L`} icon={<Wifi />} color="info" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Signal" value={telemetry.signalStrength ?? '—'} icon={<SignalCellularAlt />} color="warning" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Last Seen" value={telemetry.lastSeen ? dayjs(telemetry.lastSeen).format('HH:mm') : '—'} icon={<History />} color="text.secondary" />
          </Grid>
        </Grid>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.12 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Lifecycle</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {isSuperAdmin && lifecycle === DEVICE_LIFECYCLE.PROVISIONING && (
                <Button fullWidth size="small" variant="contained" startIcon={<Business />}
                  onClick={openBuildingDialog} disabled={actionLoading}>
                  Assign to Building
                </Button>
              )}
              {isSuperAdmin && lifecycle !== DEVICE_LIFECYCLE.PROVISIONING && lifecycle !== DEVICE_LIFECYCLE.RETIRED && (
                <Button fullWidth size="small" variant="outlined" color="info" startIcon={<SwapHoriz />}
                  onClick={openBuildingDialog} disabled={actionLoading}>
                  Transfer
                </Button>
              )}
              {canManageDevice && lifecycle === DEVICE_LIFECYCLE.AVAILABLE && (
                <Button fullWidth size="small" variant="contained" startIcon={<MeetingRoom />}
                  onClick={openRoomDialog} disabled={actionLoading}>
                  Assign to Room
                </Button>
              )}
              {canManageDevice && lifecycle === DEVICE_LIFECYCLE.ACTIVE && (
                <Button fullWidth size="small" variant="outlined" color="warning" startIcon={<SwapHoriz />}
                  onClick={handleUnassign} disabled={actionLoading}>
                  Unassign
                </Button>
              )}
              {!isSuperAdmin && canManageDevice && lifecycle !== DEVICE_LIFECYCLE.PROVISIONING && lifecycle !== DEVICE_LIFECYCLE.RETIRED && (
                <Button fullWidth size="small" variant="outlined" startIcon={<Construction />}
                  onClick={handleMaintenance} disabled={actionLoading}>
                  {lifecycle === DEVICE_LIFECYCLE.MAINTENANCE ? 'End Maintenance' : 'Maintenance'}
                </Button>
              )}
              {isSuperAdmin && lifecycle !== DEVICE_LIFECYCLE.RETIRED && (
                <Button fullWidth size="small" variant="outlined" color="secondary" startIcon={<Block />}
                  onClick={handleRetire} disabled={actionLoading}>
                  Retire
                </Button>
              )}
              {lifecycle === DEVICE_LIFECYCLE.RETIRED && (
                <Typography variant="body2" color="text.secondary">This device is retired.</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Controls</Typography>
            {pendingCommand && (
              <Chip
                icon={<HourglassEmpty />}
                label={`${pendingCommand.action} command pending…`}
                color="warning"
                size="small"
                sx={{ mb: 2 }}
              />
            )}
            {!pendingCommand && lastCommand && (
              <Chip
                icon={<CheckCircle />}
                label={`Last: ${lastCommand.action} · ${lastCommand.status}${lastCommand.message ? ` (${lastCommand.message})` : ''}`}
                color={lastCommand.status === 'SUCCESS' ? 'success' : 'default'}
                size="small"
                sx={{ mb: 2 }}
              />
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap>
              <Button variant="contained" color="success" startIcon={<PlayArrow />}
                fullWidth
                size="small"
                onClick={() => sendCommand('OPEN')} disabled={commandLoading || telemetry.valveStatus === 'OPEN'}>
                Open Valve
              </Button>
              <Button variant="contained" color="error" startIcon={<Stop />}
                fullWidth
                size="small"
                onClick={() => sendCommand('CLOSE')} disabled={commandLoading || telemetry.valveStatus === 'CLOSED'}>
                Close Valve
              </Button>
              <Button variant="outlined" color="warning" startIcon={<Refresh />}
                fullWidth
                size="small"
                onClick={() => sendCommand('RESET_ALERT')} disabled={commandLoading}>
                Reset Alert
              </Button>
              <Button variant="outlined" startIcon={<PlayArrow />}
                fullWidth
                size="small"
                onClick={() => sendCommand('START_SIMULATION')} disabled={commandLoading}>
                Start Simulator
              </Button>
              <Button variant="outlined" color="error" startIcon={<Stop />}
                fullWidth
                size="small"
                onClick={() => sendCommand('STOP_SIMULATION')} disabled={commandLoading}>
                Stop Simulator
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Flow Rate History</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={readings.length > 0 ? readings : fallbackTelemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                <Tooltip />
                <Line type="monotone" dataKey="flow" stroke="#2F80ED" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {isSuperAdmin && lifecycle !== DEVICE_LIFECYCLE.RETIRED && (
        <Dialog open={buildingDialog} onClose={() => setBuildingDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{lifecycle === DEVICE_LIFECYCLE.PROVISIONING ? 'Assign Device to Building' : 'Transfer Device to Building'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {lifecycle === DEVICE_LIFECYCLE.PROVISIONING
                  ? 'The device becomes AVAILABLE in the selected building. An admin can assign it to a room next.'
                  : 'The device leaves its current building and becomes AVAILABLE in the target building.'}
              </Typography>
              <BuildingSelector
                value={buildingForm.buildingId}
                onChange={(buildingId) => setBuildingForm({ ...buildingForm, buildingId })}
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
            <Button onClick={() => setBuildingDialog(false)} fullWidth>Cancel</Button>
            <Button
              onClick={lifecycle === DEVICE_LIFECYCLE.PROVISIONING ? handleAssignBuilding : handleTransfer}
              variant="contained"
              disabled={buildingSaving || !buildingForm.buildingId}
              fullWidth
            >
              {buildingSaving ? 'Saving...' : lifecycle === DEVICE_LIFECYCLE.PROVISIONING ? 'Assign' : 'Transfer'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {canManageDevice && lifecycle === DEVICE_LIFECYCLE.AVAILABLE && (
        <Dialog open={roomDialog} onClose={() => setRoomDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Assign Device to Room</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Room</InputLabel>
                <Select
                  label="Room"
                  value={roomForm.roomId}
                  onChange={(e) => setRoomForm({ ...roomForm, roomId: e.target.value })}
                >
                  {rooms.map((room) => (
                    <MenuItem key={room.roomId} value={room.roomId}>
                      {room.roomNumber || room.roomId}{room.floor != null ? ` — Floor ${room.floor}` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {rooms.length === 0 && (
                <Typography variant="caption" color="text.secondary">No available rooms in this building.</Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
            <Button onClick={() => setRoomDialog(false)} fullWidth>Cancel</Button>
            <Button onClick={handleAssignRoom} variant="contained" disabled={roomSaving || !roomForm.roomId} fullWidth>
              {roomSaving ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

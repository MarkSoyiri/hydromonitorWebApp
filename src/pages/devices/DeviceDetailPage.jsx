import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, IconButton, Button, Stack, Chip, Divider,
} from '@mui/material';
import {
  ArrowBack, Wifi, SignalCellularAlt, Warning,
  PlayArrow, Stop, Refresh, History,
} from '@mui/icons-material';
import { StatCard, StatusChip, PageHeader, LoadingScreen } from '@/components/common';
import { deviceService, usageService } from '@/services';
import { extractList } from '@/utils/response';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeRealtime, unsubscribeRealtime } from '@/services/firebaseRealtime';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

const fallbackTelemetryHistory = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  flow: 0,
}));

export function DeviceDetailPage() {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const basePath = isSuperAdmin ? '/super-admin' : '/admin';
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commandLoading, setCommandLoading] = useState(false);
  const [readings, setReadings] = useState([]);

  const fetchDevice = useCallback(async () => {
    try {
      const [deviceRes, readingsRes] = await Promise.allSettled([
        deviceService.getById(deviceId),
        usageService.getDeviceReadings(deviceId),
      ]);
      if (deviceRes.status === 'fulfilled' && deviceRes.value.data?.success) {
        setDevice({ ...deviceRes.value.data.data, deviceId });
      }
      if (readingsRes.status === 'fulfilled' && readingsRes.value.data?.success) {
        const list = extractList(readingsRes.value.data.data);
        setReadings(list.map((r) => ({
          time: r.timestamp ? dayjs(r.timestamp).format('HH:mm') : '',
          flow: r.flowRate || r.flow || 0,
        })));
      }
    } catch {
      toast.error('Failed to load device');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchDevice();
    const unsubscribe = subscribeRealtime(`devices/${deviceId}`, (data) => {
      if (data) setDevice((prev) => ({ ...prev, ...data }));
    });
    return () => {
      unsubscribeRealtime(`devices/${deviceId}`);
    };
  }, [deviceId, fetchDevice]);

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
        fetchDevice();
      } else {
        toast.error(data?.message || 'Command failed');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to send command');
    } finally {
      setCommandLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!device) return <PageHeader title="Device not found" />;

  const telemetry = device.telemetry || {};

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <IconButton onClick={() => navigate(`${basePath}/devices`)}><ArrowBack /></IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{device.deviceName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {device.serialNumber} · {device.buildingId || 'No building'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <StatusChip status={telemetry.status || 'OFFLINE'} />
            <StatusChip status={telemetry.valveStatus === 'OPEN' ? 'OPEN' : 'CLOSED'} />
            {telemetry.leakDetected && <Chip icon={<Warning />} label="LEAK" color="error" />}
          </Stack>
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
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

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Controls</Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button variant="contained" color="success" startIcon={<PlayArrow />}
                onClick={() => sendCommand('OPEN')} disabled={commandLoading || telemetry.valveStatus === 'OPEN'}>
                Open Valve
              </Button>
              <Button variant="contained" color="error" startIcon={<Stop />}
                onClick={() => sendCommand('CLOSE')} disabled={commandLoading || telemetry.valveStatus === 'CLOSED'}>
                Close Valve
              </Button>
              <Button variant="outlined" color="warning" startIcon={<Refresh />}
                onClick={() => sendCommand('RESET_ALERT')} disabled={commandLoading}>
                Reset Alert
              </Button>
              <Button variant="outlined" startIcon={<PlayArrow />}
                onClick={() => sendCommand('START_SIMULATION')} disabled={commandLoading}>
                Start Simulator
              </Button>
              <Button variant="outlined" color="error" startIcon={<Stop />}
                onClick={() => sendCommand('STOP_SIMULATION')} disabled={commandLoading}>
                Stop Simulator
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        <Card>
          <CardContent>
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
    </Box>
  );
}

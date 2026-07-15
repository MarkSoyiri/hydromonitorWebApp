import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, IconButton, Button, Stack, Chip, Divider,
} from '@mui/material';
import {
  ArrowBack, PowerSettingsNew, Wifi, SignalCellularAlt, Warning,
  CheckCircle, PlayArrow, Stop, Refresh, History,
} from '@mui/icons-material';
import { StatCard, StatusChip, PageHeader } from '@/components/common';
import { apiGet, apiPost } from '@/services/api';
import { devicePath, deviceOpenValvePath, deviceCloseValvePath, deviceResetAlertPath, deviceStartSimPath, deviceStopSimPath, deviceReadingsPath, ENDPOINTS } from '@/constants';
import { extractList } from '@/utils/response';
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
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commandLoading, setCommandLoading] = useState(false);
  const [readings, setReadings] = useState([]);

  const fetchDevice = useCallback(async () => {
    try {
      const [deviceRes, readingsRes] = await Promise.all([
        apiGet(devicePath(deviceId)),
        apiGet(deviceReadingsPath(deviceId)),
      ]);
      if (deviceRes.data?.success) {
        setDevice({ ...deviceRes.data.data, deviceId });
      }
      if (readingsRes.data?.success) {
        const list = extractList(readingsRes.data.data);
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
      if (unsubscribe) unsubscribe();
    };
  }, [deviceId, fetchDevice]);

  const sendCommand = async (action) => {
    setCommandLoading(true);
    try {
      const commandPaths = {
        OPEN: deviceOpenValvePath(deviceId),
        CLOSE: deviceCloseValvePath(deviceId),
        RESET_ALERT: deviceResetAlertPath(deviceId),
        START_SIMULATION: deviceStartSimPath(deviceId),
        STOP_SIMULATION: deviceStopSimPath(deviceId),
      };
      const url = commandPaths[action];
      if (!url) {
        toast.error(`Unknown command: ${action}`);
        return;
      }
      const { data } = await apiPost(url);
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

  if (loading) return <PageHeader title="Loading device..." />;
  if (!device) return <PageHeader title="Device not found" />;

  const telemetry = device.telemetry || {};

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/devices')}><ArrowBack /></IconButton>
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
    </Box>
  );
}

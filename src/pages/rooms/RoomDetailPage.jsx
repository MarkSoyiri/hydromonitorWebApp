import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, IconButton, Chip, Button, Stack,
} from '@mui/material';
import { ArrowBack, WaterDrop, MeetingRoom, DevicesOther, Warning } from '@mui/icons-material';
import { StatCard, StatusChip } from '@/components/common';
import { apiGet } from '@/services/api';
import { ENDPOINTS, roomPath } from '@/constants';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const usageHistory = [
  { time: '00:00', flow: 0 }, { time: '04:00', flow: 0 }, { time: '08:00', flow: 0 },
  { time: '12:00', flow: 0 }, { time: '16:00', flow: 0 }, { time: '20:00', flow: 0 },
];

export function RoomDetailPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRoom = useCallback(async () => {
    try {
      const { data } = await apiGet(roomPath(roomId));
      if (data?.success) {
        setRoom({ ...data.data, roomId });
      }
    } catch {
      toast.error('Failed to load room');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => { fetchRoom(); }, [fetchRoom]);

  if (loading) return <Typography>Loading...</Typography>;
  if (!room) return <Typography>Room not found</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/rooms')}><ArrowBack /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Room {room.roomNumber}</Typography>
          <Typography variant="body2" color="text.secondary">
            Floor {room.floor} · {room.buildingId || 'Unknown Building'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <StatusChip status={room.status} />
          {room.device && <StatusChip status={room.device.telemetry?.valveStatus === 'OPEN' ? 'OPEN' : 'CLOSED'} />}
        </Stack>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard title="Current Flow" value={`${room.usage?.currentFlowRate || 0} L/min`} icon={<WaterDrop />} color="primary" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Today's Usage" value={`${(room.usage?.totalUsageToday || 0).toLocaleString()} L`} icon={<WaterDrop />} color="info" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Device" value={room.device?.deviceName || 'Not assigned'} icon={<DevicesOther />} color="warning" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Leak Status" value={room.device?.telemetry?.leakDetected ? 'Leak Detected' : 'Normal'} icon={<Warning />}
            color={room.device?.telemetry?.leakDetected ? 'error' : 'success'} />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Flow Rate (Today)</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={usageHistory}>
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

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, IconButton, Chip, Button, Stack,
} from '@mui/material';
import { ArrowBack, WaterDrop, MeetingRoom, DevicesOther, Warning } from '@mui/icons-material';
import { StatCard, StatusChip, LoadingScreen } from '@/components/common';
import { roomService, usageService } from '@/services';
import { extractList } from '@/utils/response';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

export function RoomDetailPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const basePath = isSuperAdmin ? '/super-admin' : '/admin';
  const [room, setRoom] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoom = useCallback(async () => {
    try {
      const { data } = await roomService.getById(roomId);
      if (data?.success) {
        const roomData = { ...data.data, roomId };
        setRoom(roomData);

        const deviceId = roomData.device?.deviceId;
        if (deviceId) {
          try {
            const { data: readingsData } = await usageService.getDeviceReadings(deviceId);
            if (readingsData?.success) {
              const list = extractList(readingsData.data);
              setReadings(list.map((r) => ({
                time: r.timestamp ? dayjs(r.timestamp).format('HH:mm') : '',
                flow: r.flowRate || r.flow || r.usage || 0,
              })));
            }
          } catch {
            // readings fetch failed silently
          }
        }
      }
    } catch {
      toast.error('Failed to load room');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => { fetchRoom(); }, [fetchRoom]);

  if (loading) return <LoadingScreen />;
  if (!room) return <Typography>Room not found</Typography>;

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <IconButton onClick={() => navigate(`${basePath}/rooms`)}><ArrowBack /></IconButton>
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
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
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
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Flow Rate (Today)</Typography>
            {readings.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={readings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                  <Tooltip />
                  <Line type="monotone" dataKey="flow" stroke="#2F80ED" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250 }}>
                <Typography color="text.secondary">
                  {room.device ? 'No readings data available for this device' : 'No device assigned to this room'}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

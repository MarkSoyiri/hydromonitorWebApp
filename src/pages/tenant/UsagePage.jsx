import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { WaterDrop, TrendingUp, Speed } from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Paper } from '@mui/material';
import { usageService } from '@/services';
import { extractList } from '@/utils/response';
import dayjs from 'dayjs';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1.5, boxShadow: 4, borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="subtitle2" sx={{ color: p.color, fontWeight: 600 }}>
            {p.name || 'Usage'}: {p.value.toLocaleString()} L
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

export function UsagePage() {
  const { profile, device } = useAuth();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchReadings = async () => {
      const deviceId = device?.deviceId || profile?.deviceId;
      if (!deviceId) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const { data } = await usageService.getDeviceReadings(deviceId);
        if (!cancelled && data?.success) {
          setReadings(extractList(data.data));
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchReadings();
    return () => { cancelled = true; };
  }, [device, profile]);

  const now = dayjs();
  const todayStr = now.format('YYYY-MM-DD');

  const todayReadings = readings.filter((r) => {
    if (!r.timestamp) return false;
    return dayjs(r.timestamp).format('YYYY-MM-DD') === todayStr;
  });

  const hourlyData = Array.from({ length: 24 }, (_, h) => {
    const hourStr = `${String(h).padStart(2, '0')}:00`;
    const hourReadings = todayReadings.filter((r) => dayjs(r.timestamp).hour() === h);
    const usage = hourReadings.reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || 0), 0);
    return { hour: hourStr, usage };
  });

  const weeklyData = Array.from({ length: 7 }, (_, d) => {
    const dayDate = now.subtract(6 - d, 'day');
    const dayStr = dayDate.format('YYYY-MM-DD');
    const dayReadings = readings.filter((r) => r.timestamp && dayjs(r.timestamp).format('YYYY-MM-DD') === dayStr);
    const usage = dayReadings.reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || 0), 0);
    return { day: dayDate.format('ddd'), usage };
  });

  const monthlyData = Array.from({ length: 6 }, (_, m) => {
    const monthDate = now.subtract(5 - m, 'month');
    const monthReadings = readings.filter((r) => {
      if (!r.timestamp) return false;
      const rd = dayjs(r.timestamp);
      return rd.month() === monthDate.month() && rd.year() === monthDate.year();
    });
    const usage = monthReadings.reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || 0), 0);
    return { month: monthDate.format('MMM'), usage };
  });

  const currentUsage = profile?.usage?.totalUsageMonth ?? readings.reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || 0), 0);
  const todayUsage = profile?.usage?.totalUsageToday ?? todayReadings.reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || 0), 0);
  const dailyAvg = currentUsage / (now.date() || 1);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={36} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={300} height={20} sx={{ mb: 3 }} />
        <Grid container spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Card sx={{ borderRadius: 3 }}><CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Skeleton variant="circular" width={32} height={32} sx={{ mx: 'auto', mb: 1 }} />
                <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                <Skeleton variant="text" width="40%" sx={{ mx: 'auto' }} />
              </CardContent></Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Water Usage</Typography>
          <Typography variant="body2" color="text.secondary">Detailed breakdown of your water consumption</Typography>
        </Box>
      </motion.div>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
              <WaterDrop sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{todayUsage.toLocaleString()} L</Typography>
              <Typography variant="body2" color="text.secondary">Today's Usage</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{currentUsage.toLocaleString()} L</Typography>
              <Typography variant="body2" color="text.secondary">This Month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
              <Speed sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{dailyAvg.toFixed(0)} L</Typography>
              <Typography variant="body2" color="text.secondary">Daily Average</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Hourly Usage Today</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={hourlyData}>
                  <defs><linearGradient id="hourlyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2F80ED" stopOpacity={0.3} /><stop offset="95%" stopColor="#2F80ED" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="usage" stroke="#2F80ED" fill="url(#hourlyGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Usage Summary</Typography>
              {readings.length === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                  <Typography color="text.secondary">No readings data available</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Today', value: todayUsage },
                        { name: 'This Month', value: Math.max(0, currentUsage - todayUsage) },
                      ]}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value"
                    >
                      <Cell fill="#2F80ED" />
                      <Cell fill="#00B4D8" />
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Weekly Usage</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="usage" fill="#2F80ED" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Monthly Trend</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="usage" stroke="#2F80ED" strokeWidth={3} dot={{ fill: '#2F80ED', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

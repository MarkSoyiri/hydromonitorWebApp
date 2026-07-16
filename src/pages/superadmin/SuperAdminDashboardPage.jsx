import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Skeleton, Chip, LinearProgress, Paper } from '@mui/material';
import {
  Business, MeetingRoom, DevicesOther, People, AdminPanelSettings,
  TrendingUp, AttachMoney, Storage, Cloud, Memory, CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService, buildingService, deviceService, tenantService, roomService, analyticsService } from '@/services';
import { extractList } from '@/utils/response';

const fallbackMonthlyRevenue = [
  { month: 'Jan', revenue: 0 }, { month: 'Feb', revenue: 0 }, { month: 'Mar', revenue: 0 },
  { month: 'Apr', revenue: 0 }, { month: 'May', revenue: 0 }, { month: 'Jun', revenue: 0 },
];

const defaultHealth = [
  { label: 'API Server', status: 'healthy', value: 99.8, icon: <Cloud /> },
  { label: 'Database', status: 'healthy', value: 99.9, icon: <Storage /> },
  { label: 'Memory', status: 'warning', value: 72, icon: <Memory /> },
  { label: 'Firebase Sync', status: 'healthy', value: 100, icon: <CheckCircle /> },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1.5, boxShadow: 4, borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="subtitle2" sx={{ color: p.color, fontWeight: 600 }}>
            {p.name}: GHS {p.value.toLocaleString()}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

export function SuperAdminDashboardPage() {
  const { profile } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [buildingsRes, roomsRes, devicesRes, tenantsRes, statsRes, analyticsRes] = await Promise.allSettled([
          buildingService.getAll(),
          roomService.getAll(),
          deviceService.getAll(),
          tenantService.getAll(),
          dashboardService.getStats(),
          analyticsService.getSystem(),
        ]);
        if (cancelled) return;
        if (buildingsRes.value?.data?.success) setBuildings(extractList(buildingsRes.value.data.data));
        if (roomsRes.value?.data?.success) setRooms(extractList(roomsRes.value.data.data));
        if (devicesRes.value?.data?.success) setDevices(extractList(devicesRes.value.data.data));
        if (tenantsRes.value?.data?.success) setTenants(extractList(tenantsRes.value.data.data));
        if (statsRes.value?.data?.success) setStats(statsRes.value.data.data);
        if (analyticsRes.value?.data?.success) setAnalytics(analyticsRes.value.data.data);
      } catch {
        // Use defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const totalBuildings = stats?.totalBuildings ?? buildings.length ?? 0;
  const totalRooms = stats?.occupiedRooms ?? rooms.length ?? 0;
  const totalDevices = devices.length ?? 0;
  const totalTenants = stats?.activeTenants ?? tenants.filter((t) => t?.status === 'ACTIVE').length ?? 0;
  const totalAdmins = tenants.filter((t) => t?.role === 'ADMIN').length ?? tenants.filter((t) => t?.role === 'ADMIN').length ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const activeAlerts = stats?.recentAlerts ?? 0;

  const buildingData = buildings.slice(0, 3).map((b) => ({
    name: b.name || 'Building',
    usage: b.usage?.totalUsageToday ?? 0,
    tenants: b.occupancy?.totalTenants ?? 0,
    devices: b.occupancy?.totalDevices ?? 0,
  }));

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={200} height={24} sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid item xs={12} sm={6} md={2.4} key={i}>
              <Card sx={{ borderRadius: 2 }}><CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto', mb: 0.5 }} />
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
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Welcome{profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}
          </Typography>
          <Typography variant="body2" color="text.secondary">Complete system at a glance</Typography>
        </Box>
      </motion.div>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { icon: <Business />, label: 'Buildings', value: totalBuildings, color: 'primary.main' },
          { icon: <MeetingRoom />, label: 'Rooms', value: totalRooms, color: 'info.main' },
          { icon: <DevicesOther />, label: 'Devices', value: totalDevices, color: 'success.main' },
          { icon: <People />, label: 'Tenants', value: totalTenants, color: 'warning.main' },
          { icon: <AttachMoney />, label: 'Revenue (GHS)', value: totalRevenue.toLocaleString(), color: 'error.main' },
        ].map((item, idx) => (
          <Grid item xs={12} sm={6} md={2.4} key={idx}>
            <Card sx={{ borderRadius: 2 }}><CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ color: item.color, fontSize: 28, mb: 0.5 }}>{item.icon}</Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{item.value}</Typography>
              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Monthly Revenue (GHS)</Typography>
                <ResponsiveContainer width="100%" height={300}>
                   <AreaChart data={analytics?.monthlyTrend || fallbackMonthlyRevenue}>
                    <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2F80ED" stopOpacity={0.3} /><stop offset="95%" stopColor="#2F80ED" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#2F80ED" fill="url(#revGrad)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>System Health</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {defaultHealth.map((item) => (
                    <Box key={item.label}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ color: item.status === 'healthy' ? 'success.main' : 'warning.main', fontSize: 20 }}>
                            {item.icon}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.label}</Typography>
                        </Box>
                        <Chip label={`${item.value}%`} size="small" color={item.status === 'healthy' ? 'success' : 'warning'} sx={{ height: 20, fontSize: '0.6rem' }} />
                      </Box>
                      <LinearProgress variant="determinate" value={item.value} color={item.status === 'healthy' ? 'success' : 'warning'} sx={{ height: 4, borderRadius: 2 }} />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {buildingData.length > 0 && (
          <Grid item xs={12}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Buildings Overview</Typography>
                  <Grid container spacing={2}>
                    {buildingData.map((b, i) => (
                      <Grid item xs={12} md={4} key={i}>
                        <Paper sx={{ p: 2, borderRadius: 2 }} elevation={0}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>{b.name}</Typography>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box><Typography variant="caption" color="text.secondary">Usage</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{(b.usage).toLocaleString()} L</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Tenants</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{b.tenants}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Devices</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{b.devices}</Typography></Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

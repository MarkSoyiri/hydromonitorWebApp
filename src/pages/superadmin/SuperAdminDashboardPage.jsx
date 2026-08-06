import { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Skeleton, Chip, LinearProgress, Paper, Divider } from '@mui/material';
import {
  Business, MeetingRoom, DevicesOther, People,
  AttachMoney, Storage, Cloud, Memory, CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import {
  useLiveDevices,
  useLiveAlerts,
  useLiveTenants,
  useRealtimeList,
  useRealtimeMap,
  useLiveTick,
  NODES,
} from '@/services/realtime';
import { analyticsService } from '@/services';

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

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const SectionHeader = ({ title, subtitle }) => (
  <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' } }}>{title}</Typography>
    {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
  </Box>
);

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

  const { devices, loaded: devicesLoaded } = useLiveDevices();
  const { alerts: _alerts, loaded: alertsLoaded } = useLiveAlerts();
  const { tenants, loaded: tenantsLoaded } = useLiveTenants();
  const roomsState = useRealtimeList(NODES.rooms);
  const buildingsState = useRealtimeMap(NODES.buildings);

  const rooms = roomsState.data;
  const buildings = useMemo(
    () => Object.values(buildingsState.data || {}),
    [buildingsState.data]
  );
  const loading = !(
    devicesLoaded &&
    alertsLoaded &&
    tenantsLoaded &&
    roomsState.loaded &&
    buildingsState.loaded
  );

  // Revenue/analytics chart data is server-computed; refetch on a debounced
  // tick driven by live telemetry/alert changes (charts stay consistent with
  // with backend math without polling every telemetry push).
  const analyticsTick = useLiveTick([NODES.deviceTelemetry, NODES.alerts]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await analyticsService.getSystem();
        if (!cancelled && res.data?.success) setAnalytics(res.data.data);
      } catch {
        // keep last known analytics on transient failures
      }
    }, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [analyticsTick]);

  const totalBuildings = buildings.length;
  const totalRooms = rooms.length;
  const totalDevices = devices.length;
  const totalTenants = tenants.filter((t) => t?.status === 'ACTIVE').length;
  const totalRevenue = analytics?.totalRevenue ?? 0;

  const buildingData = buildings.slice(0, 3).map((b) => ({
    name: b.name || 'Building',
    usage: b.usage?.totalUsageToday ?? 0,
    tenants: tenants.filter(
      (t) => t.buildingId === b.buildingId && t.status === 'ACTIVE'
    ).length,
    devices: devices.filter((d) => d.buildingId === b.buildingId).length,
  }));

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={200} height={24} sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid item xs={12} sm={6} md={2.4} key={i}>
              <Card><CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
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
    <Box sx={{ minWidth: 0, wordBreak: 'break-word' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Welcome{profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}
          </Typography>
          <Typography variant="body2" color="text.secondary">Complete system at a glance</Typography>
        </Box>
      </motion.div>

      {/* Overview Section */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={0}>
        <SectionHeader title="Overview" subtitle="System-wide metrics" />
        <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          {[
            { icon: <Business />, label: 'Buildings', value: totalBuildings, color: 'primary.main' },
            { icon: <MeetingRoom />, label: 'Rooms', value: totalRooms, color: 'info.main' },
            { icon: <DevicesOther />, label: 'Devices', value: totalDevices, color: 'success.main' },
            { icon: <People />, label: 'Tenants', value: totalTenants, color: 'warning.main' },
            { icon: <AttachMoney />, label: 'Revenue (GHS)', value: totalRevenue.toLocaleString(), color: 'error.main' },
          ].map((item, idx) => (
            <Grid item xs={6} sm={4} md={2.4} key={idx}>
              <Card>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                  <Box sx={{ color: item.color, fontSize: { xs: 22, sm: 28 }, mb: 0.5 }}>{item.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{item.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      <Divider sx={{ mb: 4 }} />

      {/* Revenue & System Health Section */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={1}>
        <SectionHeader title="Revenue & System Health" subtitle="Financial performance and infrastructure status" />
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Monthly Revenue (GHS)</Typography>
                <Box sx={{ width: '100%', overflow: 'hidden' }}>
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
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>System Health</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                  {defaultHealth.map((item) => (
                    <Box key={item.label}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                          <Box sx={{ color: item.status === 'healthy' ? 'success.main' : 'warning.main', fontSize: { xs: 16, sm: 20 } }}>
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
          </Grid>
        </Grid>
      </motion.div>

      {/* Buildings Overview */}
      {buildingData.length > 0 && (
        <>
      <Divider sx={{ mb: { xs: 2, sm: 4 } }} />
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={2}>
            <SectionHeader title="Buildings Overview" subtitle="Individual building performance" />
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              {buildingData.map((b, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <Card>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>{b.name}</Typography>
                      <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 3 }, flexWrap: 'wrap' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Usage</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{(b.usage).toLocaleString()} L</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Tenants</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{b.tenants}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Devices</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{b.devices}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </>
      )}
    </Box>
  );
}

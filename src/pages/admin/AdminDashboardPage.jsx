import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Skeleton,
  List, ListItem, ListItemText, ListItemIcon, Divider, Avatar,
} from '@mui/material';
import {
  MeetingRoom, DevicesOther, People, WaterDrop, Warning,
  CheckCircle, TrendingUp, OfflineBolt,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Paper } from '@mui/material';
import { dashboardService, roomService, deviceService, tenantService } from '@/services';
import { extractList } from '@/utils/response';

const fallbackWeeklyUsage = [
  { day: 'Mon', usage: 0 }, { day: 'Tue', usage: 0 }, { day: 'Wed', usage: 0 },
  { day: 'Thu', usage: 0 }, { day: 'Fri', usage: 0 }, { day: 'Sat', usage: 0 },
  { day: 'Sun', usage: 0 },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const SectionHeader = ({ title, subtitle }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>{title}</Typography>
    {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
  </Box>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1.5, boxShadow: 4, borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="subtitle2" sx={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value.toLocaleString()} L
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

export function AdminDashboardPage() {
  const { profile, building } = useAuth();
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [statsRes, roomsRes, devicesRes, tenantsRes] = await Promise.allSettled([
          dashboardService.getStats(),
          roomService.getAll(),
          deviceService.getAll(),
          tenantService.getAll(),
        ]);
        if (cancelled) return;
        if (statsRes.value?.data?.success) setStats(statsRes.value.data.data);
        if (roomsRes.value?.data?.success) setRooms(extractList(roomsRes.value.data.data));
        if (devicesRes.value?.data?.success) setDevices(extractList(devicesRes.value.data.data));
        if (tenantsRes.value?.data?.success) setTenants(extractList(tenantsRes.value.data.data));
      } catch {
        // Use defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const totalRooms = stats?.occupiedRooms ?? rooms.length ?? 0;
  const totalDevices = devices.length ?? 0;
  const activeTenants = stats?.activeTenants ?? tenants.filter((t) => t?.status === 'ACTIVE').length ?? 0;
  const onlineDevices = devices.filter((d) => d?.telemetry?.status === 'ACTIVE').length ?? 0;
  const offlineDevices = totalDevices - onlineDevices;
  const recentAlerts = stats?.recentAlerts ?? 0;
  const todayUsage = stats?.totalUsageToday ?? 0;

  const recentActivity = [
    ...(offlineDevices > 0 ? [{ type: 'device', message: `${offlineDevices} device(s) offline`, time: 'Current', icon: <OfflineBolt color="error" /> }] : []),
    ...(recentAlerts > 0 ? [{ type: 'alert', message: `${recentAlerts} active alert(s)`, time: 'Current', icon: <Warning color="warning" /> }] : []),
    ...(tenants.length > 0 ? [{ type: 'tenant', message: `${tenants.length} tenant(s) registered`, time: 'Total', icon: <People color="primary" /> }] : []),
    { type: 'success', message: `System monitoring active`, time: 'Online', icon: <CheckCircle color="success" /> },
  ];

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={200} height={24} sx={{ mb: 3 }} />
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ borderRadius: 3 }}><CardContent sx={{ p: 2.5 }}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="60%" sx={{ mt: 1 }} />
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
            Building Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, {profile?.fullName?.split(' ')[0] || 'Admin'}
            {building?.name ? ` · ${building.name}` : ''}
          </Typography>
        </Box>
      </motion.div>

      {/* Overview Section */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={0}>
        <SectionHeader title="Overview" subtitle="Building metrics at a glance" />
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {[
            { icon: <MeetingRoom />, label: 'TOTAL ROOMS', value: totalRooms, color: 'info', sub: `${activeTenants} occupied · ${totalRooms - activeTenants} vacant` },
            { icon: <DevicesOther />, label: 'DEVICES', value: totalDevices, color: 'success', sub: `${onlineDevices} online · ${offlineDevices} offline` },
            { icon: <People />, label: 'TENANTS', value: activeTenants, color: 'warning', sub: 'Active tenants' },
            { icon: <WaterDrop />, label: "TODAY'S USAGE", value: `${todayUsage.toLocaleString()} L`, color: 'primary', sub: stats?.todayUsage ? "Today's reading" : 'No data' },
          ].map((item, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.06em', fontSize: '0.65rem' }}>{item.label}</Typography>
                    <Avatar sx={{ bgcolor: `${item.color}.main`, width: 40, height: 40, borderRadius: 2.5 }}>{item.icon}</Avatar>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', sm: '1.6rem' } }}>{item.value}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{item.sub}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      <Divider sx={{ mb: 4 }} />

      {/* Charts & Activity Section */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={1}>
        <SectionHeader title="Activity & Analytics" subtitle="Usage patterns and system status" />
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Weekly Building Usage</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fallbackWeeklyUsage}>
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

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>System Activity</Typography>
                {recentActivity.length > 0 ? (
                  <List dense sx={{ p: 0 }}>
                    {recentActivity.map((item, i) => (
                      <Box key={i}>
                        <ListItem sx={{ px: 0, py: 0.8 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                          <ListItemText
                            primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>{item.message}</Typography>}
                            secondary={<Typography variant="caption" color="text.secondary">{item.time}</Typography>}
                          />
                        </ListItem>
                        {i < recentActivity.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">No recent activity</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
}

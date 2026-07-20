import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Skeleton,
  List, ListItem, ListItemAvatar, ListItemText, Avatar, ListItemIcon,
  Chip, Divider, Button,
} from '@mui/material';
import {
  Business, MeetingRoom, DevicesOther, OnlinePrediction, OfflineBolt,
  People, AdminPanelSettings, WaterDrop, Receipt, Warning, CheckCircle,
  Adjust as ValveIcon, TrendingUp, Assessment, NotificationsActive,
  Analytics, Settings, ListAlt,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, StatCard } from '@/components/common';
import { apiGet } from '@/services/api';
import { ENDPOINTS } from '@/constants';
import { analyticsService } from '@/services';
import { extractList } from '@/utils/response';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

const fallbackWeeklyData = [
  { day: 'Mon', usage: 0 },
  { day: 'Tue', usage: 0 },
  { day: 'Wed', usage: 0 },
  { day: 'Thu', usage: 0 },
  { day: 'Fri', usage: 0 },
  { day: 'Sat', usage: 0 },
  { day: 'Sun', usage: 0 },
];

const fallbackYearlyData = [
  { month: 'Jan', usage: 0 },
  { month: 'Feb', usage: 0 },
  { month: 'Mar', usage: 0 },
  { month: 'Apr', usage: 0 },
  { month: 'May', usage: 0 },
  { month: 'Jun', usage: 0 },
  { month: 'Jul', usage: 0 },
  { month: 'Aug', usage: 0 },
  { month: 'Sep', usage: 0 },
  { month: 'Oct', usage: 0 },
  { month: 'Nov', usage: 0 },
  { month: 'Dec', usage: 0 },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const SectionHeader = ({ title, subtitle }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Box>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Card sx={{ p: 1.5, boxShadow: 4, borderRadius: 2, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {payload[0].value.toLocaleString()} L
        </Typography>
      </Card>
    );
  }
  return null;
};

const quickActions = [
  { label: 'Rooms', path: '/admin/rooms', icon: <MeetingRoom />, color: 'primary', roles: ['ADMIN', 'SUPER_ADMIN'] },
  { label: 'Devices', path: '/admin/devices', icon: <DevicesOther />, color: 'info', roles: ['ADMIN', 'SUPER_ADMIN'] },
  { label: 'Tenants', path: '/admin/tenants', icon: <People />, color: 'success', roles: ['ADMIN', 'SUPER_ADMIN'] },
  { label: 'Buildings', path: '/admin/buildings', icon: <Business />, color: 'primary', roles: ['ADMIN'] },
  { label: 'Billing', path: '/admin/billing', icon: <Receipt />, color: 'warning', roles: ['ADMIN', 'SUPER_ADMIN'] },
  { label: 'Reports', path: '/admin/reports', icon: <Assessment />, color: 'secondary', roles: ['ADMIN', 'SUPER_ADMIN'] },
  { label: 'Alerts', path: '/admin/alerts', icon: <NotificationsActive />, color: 'error', roles: ['ADMIN', 'SUPER_ADMIN'] },
  { label: 'Buildings', path: '/super-admin/buildings', icon: <Business />, color: 'primary', roles: ['SUPER_ADMIN'] },
  { label: 'Admins', path: '/super-admin/admins', icon: <AdminPanelSettings />, color: 'warning', roles: ['SUPER_ADMIN'] },
  { label: 'Analytics', path: '/super-admin/analytics', icon: <Analytics />, color: 'info', roles: ['SUPER_ADMIN'] },
  { label: 'Settings', path: '/super-admin/settings', icon: <Settings />, color: 'secondary', roles: ['SUPER_ADMIN'] },
  { label: 'Logs', path: '/super-admin/logs', icon: <ListAlt />, color: 'default', roles: ['SUPER_ADMIN'] },
];

export function DashboardPage() {
  const { profile, isSuperAdmin, isAdmin, isTenant } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashRes, analyticsRes] = await Promise.allSettled([
        apiGet(ENDPOINTS.DASHBOARD),
        analyticsService.getSystem(),
      ]);
      if (dashRes.status === 'fulfilled' && dashRes.value.data?.success) {
        setStats(dashRes.value.data.data);
      }
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data?.success) {
        setAnalytics(analyticsRes.value.data.data);
      }
    } catch {
      // Use defaults on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <Box>
      <PageHeader
        title={`Welcome${profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}`}
        subtitle="Here's an overview of your water monitoring system"
      />

      {/* Overview Section */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={0}>
        <SectionHeader title="Overview" subtitle="Key metrics at a glance" />
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Buildings" value={stats?.totalBuildings ?? 0} icon={<Business />} color="primary" loading={loading} index={0} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Rooms" value={stats?.totalRooms ?? 0} icon={<MeetingRoom />} color="info" loading={loading} index={1} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Active Tenants" value={stats?.activeTenants ?? 0} icon={<People />} color="warning" loading={loading} index={2} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Devices" value={stats?.totalDevices ?? 0} icon={<DevicesOther />} color="success" loading={loading} index={3} />
          </Grid>
        </Grid>
      </motion.div>

      <Divider sx={{ mb: 4 }} />

      {/* Live Monitoring Section */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={1}>
        <SectionHeader title="Live Monitoring" subtitle="Real-time system status" />
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Today's Usage" value={stats?.totalUsageToday ? `${Number(stats.totalUsageToday).toLocaleString()} L` : '0 L'} icon={<WaterDrop />} color="info" loading={loading} index={4} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Occupied Rooms" value={stats?.occupiedRooms ?? 0} icon={<MeetingRoom />} color="primary" loading={loading} index={5} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Active Alerts" value={stats?.unresolvedAlerts ?? 0} icon={<Warning />} color="error" loading={loading} index={6} />
          </Grid>
        </Grid>
      </motion.div>

      <Divider sx={{ mb: 4 }} />

      {/* Charts & Activity Section */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={2}>
        <SectionHeader title="Analytics" subtitle="Usage trends and recent activity" />
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Weekly Water Consumption</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.weeklyUsage || fallbackWeeklyData}>
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
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Recent Activity</Typography>
                <List dense>
                  {stats?.recentAlerts ? (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="body2" fontWeight={500}>{stats.recentAlerts} total alerts in the system</Typography>}
                        secondary={<Typography variant="caption" color="text.secondary">View alerts page for details</Typography>}
                      />
                    </ListItem>
                  ) : (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="body2" fontWeight={500}>No recent activity</Typography>}
                        secondary={<Typography variant="caption" color="text.secondary">System is running smoothly</Typography>}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Yearly Consumption Trend</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics?.monthlyTrend || fallbackYearlyData}>
                    <defs>
                      <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2F80ED" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2F80ED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="usage" stroke="#2F80ED" fill="url(#colorUsage)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Quick Actions Section */}
      {(isAdmin || isSuperAdmin) && (
        <>
          <Divider sx={{ mb: 4 }} />
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={3}>
            <SectionHeader title="Quick Actions" subtitle="Common tasks" />
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {quickActions
                    .filter((action) => action.roles.includes(profile?.role))
                    .map((action) => (
                      <motion.div key={action.label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          variant="outlined"
                          startIcon={action.icon}
                          onClick={() => navigate(action.path)}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2.5,
                            py: 1,
                            borderColor: 'grey.300',
                            color: 'text.primary',
                            '&:hover': {
                              borderColor: `${action.color}.main`,
                              bgcolor: `${action.color}.light`,
                              color: `${action.color}.dark`,
                            },
                          }}
                        >
                          {action.label}
                        </Button>
                      </motion.div>
                    ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </Box>
  );
}

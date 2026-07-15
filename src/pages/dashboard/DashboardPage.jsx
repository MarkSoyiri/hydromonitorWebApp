import { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Skeleton,
  List, ListItem, ListItemAvatar, ListItemText, Avatar, ListItemIcon,
  Chip, Divider,
} from '@mui/material';
import {
  Business, MeetingRoom, DevicesOther, OnlinePrediction, OfflineBolt,
  People, AdminPanelSettings, WaterDrop, Receipt, Warning, CheckCircle,
  Adjust as ValveIcon, TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, StatCard } from '@/components/common';
import { apiGet } from '@/services/api';
import { ENDPOINTS } from '@/constants';
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Card sx={{ p: 1.5, boxShadow: 4 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {payload[0].value.toLocaleString()} L
        </Typography>
      </Card>
    );
  }
  return null;
};

export function DashboardPage() {
  const { profile, isSuperAdmin, isAdmin, isTenant } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const { data } = await apiGet(ENDPOINTS.DASHBOARD);
      if (data?.success) {
        setStats(data.data);
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

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Buildings"
            value={stats?.totalBuildings ?? 0}
            icon={<Business />}
            color="primary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rooms"
            value={stats?.totalRooms ?? 0}
            icon={<MeetingRoom />}
            color="info"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Devices"
            value={stats?.totalDevices ?? 0}
            icon={<DevicesOther />}
            color="success"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Tenants"
            value={stats?.activeTenants ?? 0}
            icon={<People />}
            color="warning"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Usage"
            value={stats?.totalUsageToday ? `${Number(stats.totalUsageToday).toLocaleString()} L` : '0 L'}
            icon={<WaterDrop />}
            color="info"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Occupied Rooms"
            value={stats?.occupiedRooms ?? 0}
            icon={<MeetingRoom />}
            color="primary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Alerts"
            value={stats?.unresolvedAlerts ?? 0}
            icon={<Warning />}
            color="error"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Alerts"
            value={stats?.recentAlerts ?? 0}
            icon={<TrendingUp />}
            color="primary"
            loading={loading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Weekly Water Consumption</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fallbackWeeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="usage" fill="#2F80ED" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
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
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Yearly Consumption Trend</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={fallbackYearlyData}>
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
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}

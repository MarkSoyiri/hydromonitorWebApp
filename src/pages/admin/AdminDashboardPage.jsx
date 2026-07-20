import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Skeleton,
  List, ListItem, ListItemText, ListItemIcon, Divider, Avatar,
  Button, Chip, IconButton, Tooltip,
} from '@mui/material';
import {
  MeetingRoom, DevicesOther, People, WaterDrop, Warning,
  CheckCircle, TrendingUp, OfflineBolt, Business, ChevronRight,
  Add, Assessment, NotificationsActive,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, StatCard } from '@/components/common';
import { dashboardService, roomService, deviceService, tenantService, alertService, buildingService } from '@/services';
import { extractList } from '@/utils/response';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer } from 'recharts';

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
      <Card sx={{ p: 1.5, boxShadow: 4, borderRadius: 2, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="subtitle2" sx={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value.toLocaleString()} L
          </Typography>
        ))}
      </Card>
    );
  }
  return null;
};

function BuildingQuickCard({ building, stats, index, onNavigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card
        sx={{
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(135deg, #2F80ED, #00B4D8)',
          },
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 12px 40px rgba(0,0,0,0.3)'
              : '0 12px 40px rgba(0,0,0,0.08)',
          },
        }}
        onClick={() => onNavigate(`/admin/buildings/${building.buildingId}`)}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar
              sx={{
                width: 40, height: 40, borderRadius: 2,
                background: 'linear-gradient(135deg, #2F80ED 0%, #00B4D8 100%)',
                boxShadow: '0 4px 12px rgba(47,128,237,0.25)',
              }}
            >
              <Business />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                {building.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }} noWrap>
                {building.address || 'No address'}
              </Typography>
            </Box>
            <ChevronRight sx={{ color: 'text.disabled', fontSize: 18 }} />
          </Box>

          <Grid container spacing={1} sx={{ mb: 1.5 }}>
            {[
              { label: 'Rooms', value: stats.totalRooms, icon: <MeetingRoom sx={{ fontSize: 12 }} />, color: '#2F80ED' },
              { label: 'Tenants', value: stats.totalTenants, icon: <People sx={{ fontSize: 12 }} />, color: '#4CAF50' },
              { label: 'Online', value: stats.onlineDevices, icon: <CheckCircle sx={{ fontSize: 12 }} />, color: '#4CAF50' },
              { label: 'Alerts', value: stats.activeAlerts, icon: <Warning sx={{ fontSize: 12 }} />, color: stats.activeAlerts > 0 ? '#E53935' : '#4CAF50' },
            ].map((item) => (
              <Grid item xs={3} key={item.label}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.9rem', color: item.color }}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.55rem' }}>
                    {item.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {[
              { label: 'Manage', path: `/admin/buildings/${building.buildingId}`, icon: <Business sx={{ fontSize: 12 }} /> },
              { label: 'Tenants', path: '/admin/tenants', icon: <People sx={{ fontSize: 12 }} /> },
              { label: 'Alerts', path: '/admin/alerts', icon: <NotificationsActive sx={{ fontSize: 12 }} /> },
            ].map((action) => (
              <Tooltip key={action.label} title={action.label}>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); onNavigate(action.path); }}
                  sx={{
                    flex: 1,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AdminDashboardPage() {
  const { profile, assignedBuildings, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buildingStats, setBuildingStats] = useState({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [statsRes, roomsRes, devicesRes, tenantsRes, alertsRes] = await Promise.allSettled([
          dashboardService.getStats(),
          roomService.getAll(),
          deviceService.getAll(),
          tenantService.getAll(),
          alertService.getAll(),
        ]);
        if (cancelled) return;
        if (statsRes.value?.data?.success) setStats(statsRes.value.data.data);
        const r = roomsRes.value?.data?.success ? extractList(roomsRes.value.data.data) : [];
        const d = devicesRes.value?.data?.success ? extractList(devicesRes.value.data.data) : [];
        const t = tenantsRes.value?.data?.success ? extractList(tenantsRes.value.data.data) : [];
        const a = alertsRes.value?.data?.success ? extractList(alertsRes.value.data.data) : [];
        setRooms(r);
        setDevices(d);
        setTenants(t);
        setAlerts(a);

        if (isAdmin && assignedBuildings.length > 0) {
          const bStats = {};
          for (const b of assignedBuildings) {
            const bid = b.buildingId;
            const bRooms = r.filter((room) => room.buildingId === bid);
            const bDevices = d.filter((dev) => dev.buildingId === bid);
            const bTenants = t.filter((ten) => ten.buildingId === bid);
            const bAlerts = a.filter((al) => al.buildingId === bid);
            bStats[bid] = {
              totalRooms: bRooms.length,
              occupiedRooms: bRooms.filter((room) => room.status === 'OCCUPIED').length,
              totalTenants: bTenants.filter((ten) => ten.status === 'ACTIVE').length,
              totalDevices: bDevices.length,
              onlineDevices: bDevices.filter((dev) => dev.online).length,
              activeAlerts: bAlerts.filter((al) => !al.resolved).length,
            };
          }
          setBuildingStats(bStats);
        }
      } catch {
        // Use defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isAdmin, assignedBuildings]);

  const totalRooms = stats?.totalRooms ?? rooms.length ?? 0;
  const totalDevices = stats?.totalDevices ?? devices.length ?? 0;
  const activeTenants = stats?.activeTenants ?? tenants.filter((t) => t?.status === 'ACTIVE').length ?? 0;
  const onlineDevices = devices.filter((d) => d?.online).length ?? 0;
  const offlineDevices = totalDevices - onlineDevices;
  const unresolvedAlerts = stats?.unresolvedAlerts ?? alerts.filter((a) => !a.resolved).length ?? 0;
  const todayUsage = stats?.totalUsageToday ?? 0;
  const occupiedRooms = stats?.occupiedRooms ?? rooms.filter((r) => r.status === 'OCCUPIED').length ?? 0;

  const recentActivity = [
    ...(offlineDevices > 0 ? [{ type: 'device', message: `${offlineDevices} device(s) offline`, time: 'Current', icon: <OfflineBolt color="error" /> }] : []),
    ...(unresolvedAlerts > 0 ? [{ type: 'alert', message: `${unresolvedAlerts} active alert(s)`, time: 'Current', icon: <Warning color="warning" /> }] : []),
    ...(activeTenants > 0 ? [{ type: 'tenant', message: `${activeTenants} tenant(s) active`, time: 'Total', icon: <People color="primary" /> }] : []),
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
            Welcome{profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here's an overview of your water monitoring system
          </Typography>
        </Box>
      </motion.div>

      {/* Overview Section */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={0}>
        <SectionHeader title="Overview" subtitle="Key metrics at a glance" />
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {[
            { icon: <Business />, label: 'BUILDINGS', value: assignedBuildings.length || stats?.totalBuildings || 0, color: 'primary', sub: 'Assigned buildings' },
            { icon: <MeetingRoom />, label: 'ROOMS', value: totalRooms, color: 'info', sub: `${occupiedRooms} occupied · ${totalRooms - occupiedRooms} vacant` },
            { icon: <People />, label: 'TENANTS', value: activeTenants, color: 'warning', sub: 'Active tenants' },
            { icon: <DevicesOther />, label: 'DEVICES', value: totalDevices, color: 'success', sub: `${onlineDevices} online · ${offlineDevices} offline` },
          ].map((item, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <StatCard
                title={item.label}
                value={item.value}
                icon={item.icon}
                color={item.color}
                subtitle={item.sub}
                loading={loading}
                index={idx}
              />
            </Grid>
          ))}
        </Grid>
      </motion.div>

      <Divider sx={{ mb: 4 }} />

      {/* Live Monitoring Section */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={1}>
        <SectionHeader title="Live Monitoring" subtitle="Real-time system status" />
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Today's Usage" value={todayUsage ? `${Number(todayUsage).toLocaleString()} L` : '0 L'} icon={<WaterDrop />} color="info" loading={loading} index={4} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Occupied Rooms" value={occupiedRooms} icon={<MeetingRoom />} color="primary" loading={loading} index={5} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Active Alerts" value={unresolvedAlerts} icon={<Warning />} color="error" loading={loading} index={6} />
          </Grid>
        </Grid>
      </motion.div>

      {/* My Buildings Section - Admin Only */}
      {isAdmin && assignedBuildings.length > 0 && (
        <>
          <Divider sx={{ mb: 4 }} />
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>My Buildings</Typography>
                <Typography variant="caption" color="text.secondary">
                  Buildings assigned to you
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                endIcon={<ChevronRight />}
                onClick={() => navigate('/admin/buildings')}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                View All
              </Button>
            </Box>
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              {assignedBuildings.slice(0, 3).map((building, index) => (
                <Grid item xs={12} sm={6} md={4} key={building.buildingId}>
                  <BuildingQuickCard
                    building={building}
                    stats={buildingStats[building.buildingId] || {}}
                    index={index}
                    onNavigate={navigate}
                  />
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </>
      )}

      <Divider sx={{ mb: 4 }} />

      {/* Charts & Activity Section */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={3}>
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
                    <ReTooltip content={<CustomTooltip />} />
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

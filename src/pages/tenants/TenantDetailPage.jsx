import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, IconButton, Chip,
  Stack, Avatar, Paper,
} from '@mui/material';
import {
  ArrowBack, WaterDrop, MeetingRoom, Person,
  Home, DevicesOther, TrendingUp, Speed, CalendarMonth,
  Warning, CheckCircle, ErrorOutline, InfoOutlined,
  AccessTime, MonetizationOn, Analytics, Timeline,
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer,
} from 'recharts';
import { StatCard, StatusChip, LoadingScreen } from '@/components/common';
import { tenantService, roomService, buildingService, deviceService, analyticsService, usageService, alertService, billingService } from '@/services';
import { extractList } from '@/utils/response';
import { useAuth } from '@/contexts/AuthContext';
import { useBackNavigation } from '@/hooks/useBackNavigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1.5, boxShadow: 4, borderRadius: 2, backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.06)' }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="subtitle2" sx={{ color: p.color, fontWeight: 600 }}>
            {p.name || 'Usage'}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value} L
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

const InfoRow = ({ label, value, icon }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
    {icon && (
      <Box sx={{
        width: 32, height: 32, borderRadius: 1.5,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: 'action.hover', color: 'text.secondary', flexShrink: 0,
      }}>
        {icon}
      </Box>
    )}
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.65rem' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value || '—'}
      </Typography>
    </Box>
  </Box>
);

const SectionCard = ({ title, icon, children, delay = 0 }) => (
  <motion.div custom={delay} variants={sectionVariants} initial="hidden" animate="visible">
    <Card sx={{ height: '100%', overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          {icon && (
            <Box sx={{
              width: 36, height: 36, borderRadius: 2, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #2F80ED, #5FA4FF)',
              color: '#fff', boxShadow: '0 4px 12px rgba(47,128,237,0.25)',
            }}>
              {icon}
            </Box>
          )}
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

const AlertRow = ({ alert }) => {
  const severityColor = alert.severity === 'CRITICAL' ? 'error' : alert.severity === 'WARNING' ? 'warning' : 'info';
  const severityIcon = alert.severity === 'CRITICAL' ? <ErrorOutline sx={{ fontSize: 14 }} /> :
    alert.severity === 'WARNING' ? <Warning sx={{ fontSize: 14 }} /> : <InfoOutlined sx={{ fontSize: 14 }} />;

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5,
      borderBottom: '1px solid', borderColor: 'divider',
      '&:last-child': { borderBottom: 'none' },
    }}>
      <Chip
        icon={severityIcon}
        label={alert.severity || 'INFO'}
        size="small"
        color={severityColor}
        sx={{ fontWeight: 600, fontSize: '0.7rem', minWidth: 80 }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{alert.type || 'Alert'}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {alert.message || 'No description'}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Chip
          icon={alert.status === 'RESOLVED' ? <CheckCircle sx={{ fontSize: 12 }} /> : null}
          label={alert.status || 'ACTIVE'}
          size="small"
          color={alert.status === 'RESOLVED' ? 'success' : 'warning'}
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: '0.65rem' }}
        />
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
          {alert.createdAt ? dayjs(alert.createdAt).format('MMM D, HH:mm') : '—'}
        </Typography>
      </Box>
    </Box>
  );
};

const ActivityItem = ({ item, isLast }) => (
  <Box sx={{ display: 'flex', gap: 1.5, pb: isLast ? 0 : 2 }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0, mt: 0.7,
        bgcolor: item.color || 'primary.main',
        boxShadow: `0 0 8px ${item.color || 'rgba(47,128,237,0.4)'}`,
      }} />
      {!isLast && <Box sx={{ width: 1, flex: 1, bgcolor: 'divider', mt: 0.5 }} />}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.title}</Typography>
      <Typography variant="caption" color="text.secondary">{item.description}</Typography>
      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25, fontSize: '0.65rem' }}>
        {item.time}
      </Typography>
    </Box>
  </Box>
);

export function TenantDetailPage() {
  const { tenantId } = useParams();
  const { isSuperAdmin } = useAuth();
  const basePath = isSuperAdmin ? '/super-admin' : '/admin';
  const goBack = useBackNavigation(`${basePath}/tenants`);

  const [tenant, setTenant] = useState(null);
  const [room, setRoom] = useState(null);
  const [building, setBuilding] = useState(null);
  const [device, setDevice] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const tRes = await tenantService.getById(tenantId);
      const tenantData = tRes.data?.success ? { ...tRes.data.data, uid: tenantId } : null;
      if (!tenantData) { setTenant(null); setLoading(false); return; }
      setTenant(tenantData);

      const parallel = [];

      if (tenantData.roomId) {
        parallel.push(
          roomService.getById(tenantData.roomId).then((r) => {
            if (r.data?.success) {
              const roomData = { ...r.data.data, roomId: tenantData.roomId };
              setRoom(roomData);
              if (roomData.buildingId) {
                buildingService.getById(roomData.buildingId).then((b) => {
                  if (b.data?.success) setBuilding({ ...b.data.data, buildingId: roomData.buildingId });
                }).catch(() => {});
              }
            }
          }).catch(() => {})
        );

        parallel.push(
          deviceService.getByRoom(tenantData.roomId).then((d) => {
            if (d.data?.success) {
              const devices = extractList(d.data.data);
              if (devices.length > 0) {
                const primaryDevice = devices[0];
                setDevice(primaryDevice);
                usageService.getDeviceReadings(primaryDevice.deviceId).then((u) => {
                  if (u.data?.success) setReadings(extractList(u.data.data));
                }).catch(() => {});
              }
            }
          }).catch(() => {})
        );
      }

      parallel.push(
        analyticsService.getTenantAnalytics(tenantId).then((a) => {
          if (a.data?.success) setAnalytics(a.data.data);
        }).catch(() => {})
      );

      parallel.push(
        alertService.getAll({ tenantId }).then((a) => {
          if (a.data?.success) setAlerts(extractList(a.data.data));
        }).catch(() => {
          alertService.getAll().then((a) => {
            if (a.data?.success) {
              const all = extractList(a.data.data);
              setAlerts(all.filter((al) => al.tenantId === tenantId || al.buildingId === tenantData.buildingId));
            }
          }).catch(() => {});
        })
      );

      parallel.push(
        billingService.getCurrentBill().then((b) => {
          if (b.data?.success) setBillData(b.data.data);
        }).catch(() => {})
      );

      await Promise.allSettled(parallel);
    } catch {
      toast.error('Failed to load tenant details');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const chartData = useMemo(() => {
    if (!readings.length) return { daily: [], weekly: [], monthly: [] };

    const now = dayjs();
    const todayStr = now.format('YYYY-MM-DD');

    const todayReadings = readings.filter((r) => r.timestamp && dayjs(r.timestamp).format('YYYY-MM-DD') === todayStr);

    const daily = Array.from({ length: 24 }, (_, h) => {
      const hourReadings = todayReadings.filter((r) => dayjs(r.timestamp).hour() === h);
      const usage = hourReadings.reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || r.usageLiters || 0), 0);
      return { hour: `${String(h).padStart(2, '0')}:00`, usage };
    });

    const weekly = Array.from({ length: 7 }, (_, d) => {
      const dayDate = now.subtract(6 - d, 'day');
      const dayStr = dayDate.format('YYYY-MM-DD');
      const dayReadings = readings.filter((r) => r.timestamp && dayjs(r.timestamp).format('YYYY-MM-DD') === dayStr);
      const usage = dayReadings.reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || r.usageLiters || 0), 0);
      return { day: dayDate.format('ddd'), usage };
    });

    const monthly = Array.from({ length: 6 }, (_, m) => {
      const monthDate = now.subtract(5 - m, 'month');
      const monthReadings = readings.filter((r) => {
        if (!r.timestamp) return false;
        const rd = dayjs(r.timestamp);
        return rd.month() === monthDate.month() && rd.year() === monthDate.year();
      });
      const usage = monthReadings.reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || r.usageLiters || 0), 0);
      return { month: monthDate.format('MMM'), usage };
    });

    return { daily, weekly, monthly };
  }, [readings]);

  const usageStats = useMemo(() => {
    const now = dayjs();
    const todayStr = now.format('YYYY-MM-DD');
    const weekAgo = now.subtract(7, 'day');

    const todayUsage = readings
      .filter((r) => r.timestamp && dayjs(r.timestamp).format('YYYY-MM-DD') === todayStr)
      .reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || r.usageLiters || 0), 0);

    const weekUsage = readings
      .filter((r) => r.timestamp && dayjs(r.timestamp).isAfter(weekAgo))
      .reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || r.usageLiters || 0), 0);

    const monthUsage = analytics?.totalUsage ?? tenant?.usage?.totalUsageMonth ??
      readings.reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || r.usageLiters || 0), 0);

    const dailyAvg = monthUsage / (now.date() || 1);

    const dailyUsages = {};
    readings.forEach((r) => {
      if (!r.timestamp) return;
      const day = dayjs(r.timestamp).format('YYYY-MM-DD');
      dailyUsages[day] = (dailyUsages[day] || 0) + (r.flowRate || r.flow || r.usage || r.usageLiters || 0);
    });
    const peakDaily = Object.values(dailyUsages).length > 0 ? Math.max(...Object.values(dailyUsages)) : 0;

    const currentBill = billData?.totalAmount ?? tenant?.billing?.currentBill ?? 0;

    return { todayUsage, weekUsage, monthUsage, dailyAvg, peakDaily, currentBill };
  }, [readings, analytics, tenant, billData]);

  const activityItems = useMemo(() => {
    const items = [];

    if (device) {
      items.push({
        title: 'Device registered',
        description: `${device.deviceName || device.deviceId} assigned to this tenant`,
        time: device.createdAt ? dayjs(device.createdAt).format('MMM D, YYYY') : '—',
        color: '#4caf50',
      });
      if (device.telemetry?.valveState === 'OPEN') {
        items.push({
          title: 'Valve opened',
          description: `${device.deviceName} valve is currently open`,
          time: device.telemetry.lastSeen ? dayjs(device.telemetry.lastSeen).format('MMM D, HH:mm') : '—',
          color: '#2F80ED',
        });
      }
      if (device.telemetry?.leakDetected) {
        items.push({
          title: 'Leak detected',
          description: `Active leak alert on ${device.deviceName}`,
          time: device.telemetry.lastSeen ? dayjs(device.telemetry.lastSeen).format('MMM D, HH:mm') : '—',
          color: '#E53935',
        });
      }
    }

    if (alerts.length > 0) {
      alerts.slice(0, 5).forEach((a) => {
        items.push({
          title: a.type || 'Alert',
          description: a.message || 'Alert triggered',
          time: a.createdAt ? dayjs(a.createdAt).format('MMM D, HH:mm') : '—',
          color: a.severity === 'CRITICAL' ? '#E53935' : a.severity === 'WARNING' ? '#FB8C00' : '#2F80ED',
        });
      });
    }

    if (room) {
      items.push({
        title: 'Room assigned',
        description: `Assigned to ${room.roomNumber || room.roomId}`,
        time: room.updatedAt ? dayjs(room.updatedAt).format('MMM D, YYYY') : '—',
        color: '#42A5F5',
      });
    }

    items.sort((a, b) => {
      const dateA = new Date(a.time);
      const dateB = new Date(b.time);
      return dateB - dateA;
    });

    return items.slice(0, 8);
  }, [device, alerts, room]);

  if (loading) return <LoadingScreen />;

  if (!tenant) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconButton onClick={goBack}><ArrowBack /></IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Tenant not found</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
          <IconButton onClick={goBack} sx={{
            bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' },
          }}>
            <ArrowBack />
          </IconButton>
          <Avatar sx={{
            width: 48, height: 48,
            background: 'linear-gradient(135deg, #2F80ED, #5FA4FF)',
            boxShadow: '0 4px 16px rgba(47,128,237,0.3)',
            fontWeight: 700, fontSize: '1.1rem',
          }}>
            {(tenant.fullName || 'T').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {tenant.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tenant.email} {tenant.phoneNumber ? `· ${tenant.phoneNumber}` : ''}
            </Typography>
          </Box>
          <StatusChip status={tenant.status} />
        </Box>
      </motion.div>

      {/* Summary Stat Cards */}
      <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} lg>
            <StatCard title="Total Consumed" value={`${Math.round(usageStats.monthUsage).toLocaleString()} L`} icon={<WaterDrop />} color="primary" subtitle="This month" index={0} />
          </Grid>
          <Grid item xs={6} sm={4} lg>
            <StatCard title="Today's Usage" value={`${Math.round(usageStats.todayUsage).toLocaleString()} L`} icon={<TrendingUp />} color="info" index={1} />
          </Grid>
          <Grid item xs={6} sm={4} lg>
            <StatCard title="This Week" value={`${Math.round(usageStats.weekUsage).toLocaleString()} L`} icon={<CalendarMonth />} color="secondary" index={2} />
          </Grid>
          <Grid item xs={6} sm={4} lg>
            <StatCard title="Daily Average" value={`${Math.round(usageStats.dailyAvg)} L`} icon={<Speed />} color="success" index={3} />
          </Grid>
          <Grid item xs={6} sm={4} lg>
            <StatCard title="Current Bill" value={`GHS ${usageStats.currentBill.toLocaleString()}`} icon={<MonetizationOn />} color="warning" index={4} />
          </Grid>
        </Grid>
      </motion.div>

      {/* Main Content Grid */}
      <Grid container spacing={{ xs: 2, sm: 2.5 }}>
        {/* Left Column */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2.5}>
            {/* Personal Information */}
            <SectionCard title="Personal Information" icon={<Person />} delay={2}>
              <Stack spacing={0.5}>
                <InfoRow label="Full Name" value={tenant.fullName} icon={<Person sx={{ fontSize: 16 }} />} />
                <InfoRow label="Email Address" value={tenant.email} icon={<InfoOutlined sx={{ fontSize: 16 }} />} />
                <InfoRow label="Phone Number" value={tenant.phoneNumber} icon={<InfoOutlined sx={{ fontSize: 16 }} />} />
                <InfoRow label="Tenant ID" value={tenant.tenantId || tenantId} icon={<InfoOutlined sx={{ fontSize: 16 }} />} />
                <InfoRow label="Account Status" value={tenant.status} icon={tenant.status === 'ACTIVE' ? <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} /> : <ErrorOutline sx={{ fontSize: 16 }} />} />
                <InfoRow label="Date Joined" value={tenant.createdAt ? dayjs(tenant.createdAt).format('MMM D, YYYY') : '—'} icon={<CalendarMonth sx={{ fontSize: 16 }} />} />
                <InfoRow label="Last Updated" value={tenant.updatedAt ? dayjs(tenant.updatedAt).format('MMM D, YYYY') : '—'} icon={<AccessTime sx={{ fontSize: 16 }} />} />
              </Stack>
            </SectionCard>

            {/* Property Information */}
            <SectionCard title="Property Information" icon={<Home />} delay={3}>
              {room ? (
                <Stack spacing={0.5}>
                  <InfoRow label="Building" value={building?.name || room.buildingId} icon={<Home sx={{ fontSize: 16 }} />} />
                  <InfoRow label="Building Address" value={building?.address} icon={<Home sx={{ fontSize: 16 }} />} />
                  <InfoRow label="Room Number" value={room.roomNumber} icon={<MeetingRoom sx={{ fontSize: 16 }} />} />
                  <InfoRow label="Room Status" value={room.status} icon={<InfoOutlined sx={{ fontSize: 16 }} />} />
                  {room.roomType && <InfoRow label="Room Type" value={room.roomType} icon={<InfoOutlined sx={{ fontSize: 16 }} />} />}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <MeetingRoom sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No room assigned</Typography>
                </Box>
              )}
            </SectionCard>

            {/* Device Information */}
            <SectionCard title="Device Information" icon={<DevicesOther />} delay={4}>
              {device ? (
                <Stack spacing={0.5}>
                  <InfoRow label="Device Name" value={device.deviceName} icon={<DevicesOther sx={{ fontSize: 16 }} />} />
                  <InfoRow label="Device ID" value={device.deviceId} icon={<InfoOutlined sx={{ fontSize: 16 }} />} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: 1.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: 'action.hover', color: 'text.secondary', flexShrink: 0,
                    }}>
                      <InfoOutlined sx={{ fontSize: 16 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.65rem' }}>
                        Status
                      </Typography>
                      <Box sx={{ mt: 0.25 }}>
                        <StatusChip status={device.telemetry?.status || device.status || 'OFFLINE'} />
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: 1.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: 'action.hover', color: 'text.secondary', flexShrink: 0,
                    }}>
                      <InfoOutlined sx={{ fontSize: 16 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.65rem' }}>
                        Valve Status
                      </Typography>
                      <Box sx={{ mt: 0.25 }}>
                        <StatusChip status={device.telemetry?.valveState === 'OPEN' ? 'OPEN' : 'CLOSED'} />
                      </Box>
                    </Box>
                  </Box>
                  <InfoRow label="Current Flow Rate" value={device.telemetry?.currentFlowRate ? `${device.telemetry.currentFlowRate} L/min` : '—'} icon={<Speed sx={{ fontSize: 16 }} />} />
                  <InfoRow label="Last Seen" value={device.telemetry?.lastSeen ? dayjs(device.telemetry.lastSeen).format('MMM D, HH:mm') : '—'} icon={<AccessTime sx={{ fontSize: 16 }} />} />
                  <InfoRow label="Last Sync" value={device.telemetry?.lastSync ? dayjs(device.telemetry.lastSync).format('MMM D, HH:mm') : '—'} icon={<AccessTime sx={{ fontSize: 16 }} />} />
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <DevicesOther sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No device assigned</Typography>
                </Box>
              )}
            </SectionCard>
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8}>
          <Stack spacing={2.5}>
            {/* Charts */}
            <SectionCard title="Usage Analytics" icon={<Analytics />} delay={2}>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Daily Water Usage</Typography>
                  {chartData.daily.some((d) => d.usage > 0) ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={chartData.daily}>
                        <defs>
                          <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2F80ED" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2F80ED" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#A0AEC0" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#A0AEC0" />
                        <ReTooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="usage" stroke="#2F80ED" fill="url(#dailyGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary" variant="body2">No usage data available for today</Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Weekly Usage</Typography>
                  {chartData.weekly.some((d) => d.usage > 0) ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData.weekly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#A0AEC0" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#A0AEC0" />
                        <ReTooltip content={<CustomTooltip />} />
                        <Bar dataKey="usage" fill="#2F80ED" radius={[6, 6, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary" variant="body2">No weekly data</Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Monthly Trend</Typography>
                  {chartData.monthly.some((d) => d.usage > 0) ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData.monthly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#A0AEC0" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#A0AEC0" />
                        <ReTooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="usage" stroke="#2F80ED" strokeWidth={3} dot={{ fill: '#2F80ED', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary" variant="body2">No monthly data</Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </SectionCard>

            {/* Alerts */}
            <SectionCard title={`Alerts ${alerts.length > 0 ? `(${alerts.filter((a) => a.status !== 'RESOLVED').length} unresolved)` : ''}`} icon={<Warning />} delay={3}>
              {alerts.length > 0 ? (
                <Box>
                  {alerts.slice(0, 8).map((alert, idx) => (
                    <AlertRow key={alert.alertId || alert.id || idx} alert={alert} />
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1, opacity: 0.6 }} />
                  <Typography variant="body2" color="text.secondary">No alerts for this tenant</Typography>
                </Box>
              )}
            </SectionCard>

            {/* Recent Activity */}
            <SectionCard title="Recent Activity" icon={<Timeline />} delay={4}>
              {activityItems.length > 0 ? (
                <Box>
                  {activityItems.map((item, idx) => (
                    <ActivityItem key={idx} item={item} isLast={idx === activityItems.length - 1} />
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Timeline sx={{ fontSize: 48, color: 'text.disabled', mb: 1, opacity: 0.4 }} />
                  <Typography variant="body2" color="text.secondary">No recent activity</Typography>
                </Box>
              )}
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

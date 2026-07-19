import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button, Avatar, Stack,
  Chip, IconButton, Tooltip, Divider, Paper,
} from '@mui/material';
import {
  Person, Email, Phone, Badge, CalendarMonth, AccessTime,
  Home, MeetingRoom, DevicesOther, WaterDrop, TrendingUp, Speed,
  MonetizationOn, Business, People, Warning, CheckCircle, InfoOutlined,
  Settings, Edit, ArrowForward, Timeline, Shield, Analytics,
} from '@mui/icons-material';
import { StatCard, StatusChip } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeMode } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  buildingService, roomService, deviceService, tenantService,
  alertService, usageService, billingService, analyticsService, dashboardService,
} from '@/services';
import { extractList } from '@/utils/response';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
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

const SectionCard = ({ title, icon, children, delay = 0, isDark = false }) => (
  <motion.div custom={delay} variants={sectionVariants} initial="hidden" animate="visible">
    <Card sx={{ height: '100%', overflow: 'hidden', ...glassSx(isDark), borderRadius: 3 }}>
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
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5,
      borderBottom: '1px solid', borderColor: 'divider',
      '&:last-child': { borderBottom: 'none' },
    }}>
      <Chip
        label={alert.severity || 'INFO'}
        size="small"
        color={severityColor}
        sx={{ fontWeight: 600, fontSize: '0.7rem', minWidth: 80 }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{alert.type || 'Alert'}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {alert.message || 'No description'}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Chip
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

const QuickActionCard = ({ icon, label, onClick, color = 'primary', delay = 0, isDark = false }) => (
  <motion.div custom={delay} variants={sectionVariants} initial="hidden" animate="visible">
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer', textAlign: 'center', py: 2, borderRadius: 3,
        ...glassSx(isDark),
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: isDark
          ? '0 16px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 16px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7)' },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: 2.5, mx: 'auto', mb: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${color === 'primary' ? '#2F80ED, #5FA4FF' : color === 'success' ? '#4CAF50, #66BB6A' : color === 'warning' ? '#FB8C00, #FFB74D' : color === 'info' ? '#2F80ED, #00B4D8' : '#E53935, #EF5350'})`,
          color: '#fff', boxShadow: `0 4px 12px rgba(47,128,237,0.25)`,
        }}>
          {icon}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{label}</Typography>
      </CardContent>
    </Card>
  </motion.div>
);

const ROLE_BADGE_COLORS = {
  SUPER_ADMIN: { bg: 'linear-gradient(135deg, rgba(229,57,53,0.12), rgba(239,83,80,0.06))', text: 'error.main', border: 'rgba(229,57,53,0.2)' },
  ADMIN: { bg: 'linear-gradient(135deg, rgba(47,128,237,0.12), rgba(95,164,255,0.06))', text: 'primary.main', border: 'rgba(47,128,237,0.2)' },
  TENANT: { bg: 'linear-gradient(135deg, rgba(76,175,80,0.12), rgba(102,187,106,0.06))', text: 'success.main', border: 'rgba(76,175,80,0.2)' },
};

const ROLE_LABELS = { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', TENANT: 'Tenant' };

const glassSx = (isDark) => ({
  background: isDark ? 'rgba(17, 25, 33, 0.6)' : 'rgba(255, 255, 255, 0.6)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(255, 255, 255, 0.6)',
  boxShadow: isDark
    ? '0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)'
    : '0 4px 24px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.6)',
  transition: 'box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.3s ease',
  '&:hover': {
    boxShadow: isDark
      ? '0 12px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)'
      : '0 12px 40px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.7)',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
  },
});

export function ProfilePage() {
  const { profile, building, room, device, isSuperAdmin, isAdmin, isTenant, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { isDark } = useThemeMode();

  const [name, setName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phoneNumber || '');
  const [saving, setSaving] = useState(false);

  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenantsList, setTenantsList] = useState([]);
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [readings, setReadings] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dashStats, setDashStats] = useState(null);
  const [billData, setBillData] = useState(null);

  const fetchRoleData = useCallback(async () => {
    if (!profile) return;

    const parallel = [];

    if (isSuperAdmin) {
      parallel.push(
        buildingService.getAll().then((r) => { if (r.data?.success) setBuildings(extractList(r.data.data)); }).catch(() => {}),
        tenantService.getAll().then((r) => { if (r.data?.success) setTenantsList(extractList(r.data.data)); }).catch(() => {}),
        deviceService.getAll().then((r) => { if (r.data?.success) setDevices(extractList(r.data.data)); }).catch(() => {}),
        alertService.getAll().then((r) => { if (r.data?.success) setAlerts(extractList(r.data.data)); }).catch(() => {}),
        analyticsService.getSystem().then((r) => { if (r.data?.success) setAnalyticsData(r.data.data); }).catch(() => {}),
        dashboardService.getStats().then((r) => { if (r.data?.success) setDashStats(r.data.data); }).catch(() => {}),
      );
    } else if (isAdmin) {
      const bid = profile.buildingId;
      parallel.push(
        bid ? buildingService.getById(bid).then((r) => { if (r.data?.success) setBuildings([{ ...r.data.data, buildingId: bid }]); }).catch(() => {}) : Promise.resolve(),
        bid ? roomService.getAll(bid).then((r) => { if (r.data?.success) setRooms(extractList(r.data.data)); }).catch(() => {}) : Promise.resolve(),
        tenantService.getAll().then((r) => {
          if (r.data?.success) {
            const all = extractList(r.data.data);
            setTenantsList(bid ? all.filter((t) => t.buildingId === bid) : all);
          }
        }).catch(() => {}),
        deviceService.getAll().then((r) => {
          if (r.data?.success) {
            const all = extractList(r.data.data);
            setDevices(bid ? all.filter((d) => d.buildingId === bid) : all);
          }
        }).catch(() => {}),
        alertService.getAll(bid ? { buildingId: bid } : undefined).then((r) => { if (r.data?.success) setAlerts(extractList(r.data.data)); }).catch(() => {}),
        bid ? analyticsService.getBuildingAnalytics(bid).then((r) => { if (r.data?.success) setAnalyticsData(r.data.data); }).catch(() => {}) : Promise.resolve(),
      );
    } else if (isTenant) {
      parallel.push(
        alertService.getAll({ tenantId: profile.uid }).then((r) => {
          if (r.data?.success) setAlerts(extractList(r.data.data));
        }).catch(() => {
          alertService.getAll().then((r) => {
            if (r.data?.success) {
              const all = extractList(r.data.data);
              setAlerts(all.filter((a) => a.tenantId === profile.uid || a.buildingId === profile.buildingId));
            }
          }).catch(() => {});
        }),
        billingService.getCurrentBill().then((r) => { if (r.data?.success) setBillData(r.data.data); }).catch(() => {}),
        profile.roomId ? analyticsService.getTenantAnalytics(profile.uid).then((r) => { if (r.data?.success) setAnalyticsData(r.data.data); }).catch(() => {}) : Promise.resolve(),
        device?.deviceId ? usageService.getDeviceReadings(device.deviceId).then((r) => {
          if (r.data?.success) setReadings(extractList(r.data.data));
        }).catch(() => {}) : Promise.resolve(),
      );
    }

    await Promise.allSettled(parallel);
  }, [profile, isSuperAdmin, isAdmin, isTenant, device]);

  useEffect(() => { fetchRoleData(); }, [fetchRoleData]);

  useEffect(() => {
    setName(profile?.fullName || '');
    setPhone(profile?.phoneNumber || '');
  }, [profile]);

  const initials = profile?.fullName
    ?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const usageStats = useMemo(() => {
    if (!isTenant || readings.length === 0) return null;
    const now = dayjs();
    const todayStr = now.format('YYYY-MM-DD');
    const weekAgo = now.subtract(7, 'day');

    const todayUsage = readings
      .filter((r) => r.timestamp && dayjs(r.timestamp).format('YYYY-MM-DD') === todayStr)
      .reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || r.usageLiters || 0), 0);

    const monthUsage = analyticsData?.totalUsage ?? profile?.usage?.totalUsageMonth ??
      readings.reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || r.usageLiters || 0), 0);

    const dailyAvg = monthUsage / (now.date() || 1);
    const currentBill = billData?.totalAmount ?? profile?.billing?.currentBill ?? 0;

    return { todayUsage, monthUsage, dailyAvg, currentBill };
  }, [readings, analyticsData, profile, billData, isTenant]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ fullName: name, phoneNumber: phone });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const activityItems = useMemo(() => {
    const items = [];
    if (profile?.createdAt) {
      items.push({ title: 'Account created', description: 'User account was registered', time: dayjs(profile.createdAt).format('MMM D, YYYY'), color: '#4caf50' });
    }
    if (profile?.updatedAt && profile.updatedAt !== profile.createdAt) {
      items.push({ title: 'Profile updated', description: 'Account information was modified', time: dayjs(profile.updatedAt).format('MMM D, HH:mm'), color: '#2F80ED' });
    }
    if (device) {
      items.push({ title: 'Device assigned', description: `${device.deviceName || 'Device'} linked to your account`, time: dayjs().format('MMM D, HH:mm'), color: '#42A5F5' });
    }
    if (room) {
      items.push({ title: 'Room assigned', description: `Assigned to room ${room.roomNumber || room.roomId}`, time: dayjs().format('MMM D, YYYY'), color: '#FB8C00' });
    }
    alerts.slice(0, 3).forEach((a) => {
      items.push({
        title: a.type || 'Alert',
        description: a.message || 'Alert triggered',
        time: a.createdAt ? dayjs(a.createdAt).format('MMM D, HH:mm') : '—',
        color: a.severity === 'CRITICAL' ? '#E53935' : a.severity === 'WARNING' ? '#FB8C00' : '#2F80ED',
      });
    });
    return items.slice(0, 8);
  }, [profile, device, room, alerts]);

  const quickActions = useMemo(() => {
    if (isSuperAdmin) {
      return [
        { icon: <Business />, label: 'Add Building', color: 'primary', onClick: () => navigate('/super-admin/buildings') },
        { icon: <People />, label: 'Manage Admins', color: 'info', onClick: () => navigate('/super-admin/admins') },
        { icon: <Analytics />, label: 'System Overview', color: 'success', onClick: () => navigate('/super-admin/analytics') },
        { icon: <Warning />, label: 'View Alerts', color: 'error', onClick: () => navigate('/super-admin/alerts') },
      ];
    }
    if (isAdmin) {
      return [
        { icon: <People />, label: 'Add Tenant', color: 'primary', onClick: () => navigate('/admin/tenants') },
        { icon: <MeetingRoom />, label: 'Add Room', color: 'info', onClick: () => navigate('/admin/rooms') },
        { icon: <DevicesOther />, label: 'Register Device', color: 'success', onClick: () => navigate('/admin/devices') },
        { icon: <Business />, label: 'View Buildings', color: 'warning', onClick: () => navigate('/admin/buildings') },
      ];
    }
    return [
      { icon: <WaterDrop />, label: 'View Usage', color: 'primary', onClick: () => navigate('/app/usage') },
      { icon: <Warning />, label: 'View Alerts', color: 'error', onClick: () => navigate('/app/alerts') },
      { icon: <DevicesOther />, label: 'My Device', color: 'info', onClick: () => navigate('/app/dashboard') },
      { icon: <MonetizationOn />, label: 'View Bills', color: 'success', onClick: () => navigate('/app/bills') },
    ];
  }, [isSuperAdmin, isAdmin, navigate]);

  const onlineDevices = devices.filter((d) => d.online || d.telemetry?.status === 'ONLINE').length;
  const unresolvedAlerts = alerts.filter((a) => a.status !== 'RESOLVED').length;

  const roleStyle = ROLE_BADGE_COLORS[profile?.role] || ROLE_BADGE_COLORS.TENANT;

  if (!profile) return null;

  return (
    <Box>
      {/* Profile Header */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <Card sx={{
          mb: 3, overflow: 'hidden', position: 'relative', borderRadius: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(7,15,26,0.7) 0%, rgba(17,25,33,0.5) 50%, rgba(7,15,26,0.7) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0.65) 100%)',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 8px 32px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}>
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 140,
            background: 'linear-gradient(135deg, rgba(47,128,237,0.25) 0%, rgba(0,180,216,0.2) 40%, rgba(95,164,255,0.15) 70%, rgba(47,128,237,0.1) 100%)',
            borderRadius: '20px 20px 0 0',
          }} />
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Avatar sx={{
                width: { xs: 72, sm: 88 }, height: { xs: 72, sm: 88 },
                background: 'linear-gradient(135deg, #2F80ED, #5FA4FF)',
                boxShadow: '0 8px 32px rgba(47,128,237,0.3)',
                fontWeight: 800, fontSize: { xs: '1.5rem', sm: '2rem' },
              }}>
                {initials || 'U'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', sm: '1.6rem' }, letterSpacing: '-0.02em' }}>
                  {profile.fullName || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {profile.email}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={ROLE_LABELS[profile.role] || profile.role}
                    size="small"
                    sx={{
                      fontWeight: 600, fontSize: '0.75rem',
                      background: roleStyle.bg,
                      color: roleStyle.text,
                      border: `1px solid ${roleStyle.border}`,
                    }}
                  />
                  <StatusChip status={profile.status || 'ACTIVE'} />
                  {profile.createdAt && (
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarMonth sx={{ fontSize: 14 }} />
                      Member since {dayjs(profile.createdAt).format('MMM YYYY')}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      <Grid container spacing={2.5}>
        {/* Left Column */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2.5}>
            {/* Account Information */}
            <SectionCard title="Account Information" icon={<Person />} delay={1} isDark={isDark}>
              <Stack spacing={0.5}>
                <InfoRow label="Full Name" value={profile.fullName} icon={<Person sx={{ fontSize: 16 }} />} />
                <InfoRow label="Email" value={profile.email} icon={<Email sx={{ fontSize: 16 }} />} />
                <InfoRow label="Phone Number" value={profile.phoneNumber} icon={<Phone sx={{ fontSize: 16 }} />} />
                <InfoRow label="User ID" value={profile.uid} icon={<Badge sx={{ fontSize: 16 }} />} />
                <InfoRow label="Account Status" value={profile.status} icon={<CheckCircle sx={{ fontSize: 16, color: profile.status === 'ACTIVE' ? 'success.main' : 'text.secondary' }} />} />
                <InfoRow label="Created" value={profile.createdAt ? dayjs(profile.createdAt).format('MMM D, YYYY') : '—'} icon={<CalendarMonth sx={{ fontSize: 16 }} />} />
                <InfoRow label="Last Updated" value={profile.updatedAt ? dayjs(profile.updatedAt).format('MMM D, YYYY') : '—'} icon={<AccessTime sx={{ fontSize: 16 }} />} />
              </Stack>
            </SectionCard>

            {/* Assigned Information */}
            {(isTenant || isAdmin) && (
              <SectionCard title="Assigned Information" icon={<Home />} delay={2} isDark={isDark}>
                {isTenant ? (
                  <Stack spacing={0.5}>
                    <InfoRow label="Building" value={building?.name || profile.buildingId} icon={<Home sx={{ fontSize: 16 }} />} />
                    <InfoRow label="Room" value={room?.roomNumber || profile.roomId} icon={<MeetingRoom sx={{ fontSize: 16 }} />} />
                    <InfoRow label="Device" value={device?.deviceName || 'Not assigned'} icon={<DevicesOther sx={{ fontSize: 16 }} />} />
                  </Stack>
                ) : (
                  <Stack spacing={0.5}>
                    <InfoRow label="Building" value={building?.name || profile.buildingId || '—'} icon={<Home sx={{ fontSize: 16 }} />} />
                    <InfoRow label="Rooms Managed" value={rooms.length || '—'} icon={<MeetingRoom sx={{ fontSize: 16 }} />} />
                    <InfoRow label="Tenants Managed" value={tenantsList.length || '—'} icon={<People sx={{ fontSize: 16 }} />} />
                    <InfoRow label="Devices Managed" value={devices.length || '—'} icon={<DevicesOther sx={{ fontSize: 16 }} />} />
                  </Stack>
                )}
              </SectionCard>
            )}

            {/* Super Admin Overview */}
            {isSuperAdmin && (
              <SectionCard title="System Overview" icon={<Shield />} delay={2} isDark={isDark}>
                <Stack spacing={0.5}>
                  <InfoRow label="Total Buildings" value={buildings.length} icon={<Business sx={{ fontSize: 16 }} />} />
                  <InfoRow label="Total Tenants" value={tenantsList.length} icon={<People sx={{ fontSize: 16 }} />} />
                  <InfoRow label="Total Devices" value={devices.length} icon={<DevicesOther sx={{ fontSize: 16 }} />} />
                  <InfoRow label="Active Alerts" value={unresolvedAlerts} icon={<Warning sx={{ fontSize: 16 }} />} />
                </Stack>
              </SectionCard>
            )}

            {/* Alerts (compact sidebar view) */}
            <SectionCard title={`Alerts ${unresolvedAlerts > 0 ? `(${unresolvedAlerts})` : ''}`} icon={<Warning />} delay={3} isDark={isDark}>
              {alerts.length > 0 ? (
                <Box>
                  {alerts.slice(0, 4).map((alert, idx) => (
                    <AlertRow key={alert.alertId || alert.id || idx} alert={alert} />
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircle sx={{ fontSize: 36, color: 'success.main', mb: 0.5, opacity: 0.6 }} />
                  <Typography variant="body2" color="text.secondary">No alerts</Typography>
                </Box>
              )}
            </SectionCard>
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8}>
          <Stack spacing={2.5}>
            {/* Statistics */}
            <SectionCard title="Statistics" icon={<Analytics />} delay={1} isDark={isDark}>
              {isSuperAdmin && (
                <Grid container spacing={2.5}>
                  <Grid item xs={6} sm={4}>
                    <StatCard title="Buildings" value={buildings.length} icon={<Business />} color="primary" index={0} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <StatCard title="Tenants" value={tenantsList.length} icon={<People />} color="success" index={1} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <StatCard title="Devices" value={devices.length} icon={<DevicesOther />} color="info" subtitle={`${onlineDevices} online`} index={2} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <StatCard title="Active Alerts" value={unresolvedAlerts} icon={<Warning />} color={unresolvedAlerts > 0 ? 'error' : 'success'} index={3} />
                  </Grid>
                  {analyticsData && (
                    <>
                      <Grid item xs={6} sm={4}>
                        <StatCard title="Total Usage" value={`${(analyticsData.totalUsage || 0).toLocaleString()} L`} icon={<WaterDrop />} color="primary" index={4} />
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <StatCard title="Avg Daily" value={`${(analyticsData.avgDailyUsage || 0).toFixed(0)} L`} icon={<Speed />} color="warning" index={5} />
                      </Grid>
                    </>
                  )}
                </Grid>
              )}

              {isAdmin && (
                <Grid container spacing={2.5}>
                  <Grid item xs={6} sm={3}>
                    <StatCard title="Rooms" value={rooms.length} icon={<MeetingRoom />} color="primary" index={0} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard title="Tenants" value={tenantsList.length} icon={<People />} color="success" index={1} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard title="Devices" value={devices.length} icon={<DevicesOther />} color="info" subtitle={`${onlineDevices} online`} index={2} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard title="Alerts" value={unresolvedAlerts} icon={<Warning />} color={unresolvedAlerts > 0 ? 'error' : 'success'} index={3} />
                  </Grid>
                </Grid>
              )}

              {isTenant && (
                <Grid container spacing={2.5}>
                  <Grid item xs={6} sm={3}>
                    <StatCard title="Total Consumed" value={`${Math.round(usageStats?.monthUsage || 0).toLocaleString()} L`} icon={<WaterDrop />} color="primary" subtitle="This month" index={0} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard title="Today" value={`${Math.round(usageStats?.todayUsage || 0).toLocaleString()} L`} icon={<TrendingUp />} color="info" index={1} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard title="Daily Average" value={`${Math.round(usageStats?.dailyAvg || 0)} L`} icon={<Speed />} color="success" index={2} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard title="Current Bill" value={`GHS ${(usageStats?.currentBill || 0).toLocaleString()}`} icon={<MonetizationOn />} color="warning" index={3} />
                  </Grid>
                </Grid>
              )}
            </SectionCard>

            {/* Activity */}
            <SectionCard title="Recent Activity" icon={<Timeline />} delay={2} isDark={isDark}>
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

            {/* Quick Actions */}
            <SectionCard title="Quick Actions" icon={<ArrowForward />} delay={3} isDark={isDark}>
              <Grid container spacing={2}>
                {quickActions.map((action, idx) => (
                  <Grid item xs={6} sm={3} key={idx}>
                    <QuickActionCard
                      icon={action.icon}
                      label={action.label}
                      onClick={action.onClick}
                      color={action.color}
                      delay={3 + idx * 0.05}
                      isDark={isDark}
                    />
                  </Grid>
                ))}
              </Grid>
            </SectionCard>

            {/* Profile Settings */}
            <SectionCard title="Profile Settings" icon={<Settings />} delay={4} isDark={isDark}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Full Name" fullWidth value={name}
                    onChange={(e) => setName(e.target.value)} size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Email" fullWidth value={profile?.email || ''} disabled size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Phone Number" fullWidth value={phone}
                    onChange={(e) => setPhone(e.target.value)} size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="User ID" fullWidth value={profile?.uid || ''} disabled size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
                    <Button variant="contained" onClick={handleSave} disabled={saving}
                      startIcon={<Edit />}
                      sx={{
                        borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3,
                        background: 'linear-gradient(135deg, #2F80ED, #5FA4FF)',
                        boxShadow: '0 4px 16px rgba(47,128,237,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1C5DC9, #2F80ED)',
                          boxShadow: '0 6px 24px rgba(47,128,237,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      }}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

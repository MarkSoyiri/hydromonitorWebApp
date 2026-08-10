import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Avatar,
  List, ListItem, ListItemText, ListItemIcon, Divider,
  LinearProgress, Button, Skeleton,
} from '@mui/material';
import {
  WaterDrop, Receipt, AccountBalance, CheckCircle, Warning,
  Home, Adjust as ValveIcon, TrendingUp,
  Download, ArrowForward,
  Paid, Description, ErrorOutline,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
} from 'recharts';
import { Paper as MuiPaper } from '@mui/material';
import { WaterFlowIndicator } from '@/components/tenant/WaterFlowIndicator';
import { QuickActions } from '@/components/tenant/QuickActions';
import { WaterSavingTip } from '@/components/tenant/WaterSavingTip';
import { usageService } from '@/services';
import { extractList } from '@/utils/response';
import {
  NODES, useRealtimeValue, useRealtimeMap, useLiveTelemetry,
} from '@/services/realtime';
import dayjs from 'dayjs';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <MuiPaper sx={{ p: 1.5, boxShadow: 4, borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="subtitle2" sx={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value.toLocaleString()} L
          </Typography>
        ))}
      </MuiPaper>
    );
  }
  return null;
};

function StatSkeleton() {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 2.5 }}>
        <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: 2 }} />
        <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
        <Skeleton variant="text" width="40%" />
      </CardContent>
    </Card>
  );
}

const SectionHeader = ({ title, subtitle }) => (
  <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' } }}>{title}</Typography>
    {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
  </Box>
);

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export function TenantDashboardPage() {
  const navigate = useNavigate();
  const { profile, building, room, device: authDevice, loading: authLoading } = useAuth();
  const [readings, setReadings] = useState([]);

  const tenantUid = profile?.uid || profile?.currentUser?.uid;

  const userLive = useRealtimeValue(tenantUid ? `${NODES.users}/${tenantUid}` : null);
  const liveUser = userLive.value;
  const liveProfile = liveUser ? { ...profile, ...liveUser, uid: tenantUid } : profile;

  const roomId = liveProfile?.roomId || room?.roomId;
  const roomLive = useRealtimeValue(roomId ? `${NODES.rooms}/${roomId}` : null);
  const liveRoom = roomLive.value ? { ...roomLive.value, roomId } : roomLive.value;

  const buildingId = liveProfile?.buildingId || liveRoom?.buildingId || building?.buildingId;
  const buildingLive = useRealtimeValue(buildingId ? `${NODES.buildings}/${buildingId}` : null);
  const liveBuilding = buildingLive.value ? { ...buildingLive.value, buildingId } : buildingLive.value;

  const deviceId = liveRoom?.device?.deviceId || liveProfile?.deviceId || authDevice?.deviceId;
  const { telemetry: liveTelemetry } = useLiveTelemetry(deviceId);
  const device = deviceId
    ? {
        ...(authDevice || {}),
        deviceId,
        deviceName: liveRoom?.device?.deviceName || authDevice?.deviceName || deviceId,
        telemetry: liveTelemetry || authDevice?.telemetry || null,
        online: liveTelemetry?.online ?? authDevice?.online ?? false,
        lastSeen: liveTelemetry?.lastSeen ?? authDevice?.lastSeen ?? 0,
      }
    : authDevice;

  const rateLive = useRealtimeValue(`${NODES.rates}/current`);
  const pricePerUnit = rateLive.value?.pricePerUnit ?? 0;

  const billingMap = useRealtimeMap(tenantUid ? `${NODES.billingHistory}/${tenantUid}` : null);
  const billingHistory = (Object.values(billingMap.data || {}) || [])
    .filter((p) => p && typeof p === 'object')
    .map((p) => ({
      ...p,
      status: 'PAID',
      amount: p.amount || 0,
      date: p.recordedAt ? dayjs(p.recordedAt).format('MMM D, YYYY') : '—',
      method: p.recordedBy || '—',
    }))
    .sort((a, b) => (b.recordedAt || 0) - (a.recordedAt || 0));

  const firstName = liveProfile?.fullName?.split(' ')[0] || 'there';
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const now = dayjs();
  const todayStr = now.format('YYYY-MM-DD');

  const todayReadings = readings.filter((r) => {
    if (!r.timestamp) return false;
    return dayjs(r.timestamp).format('YYYY-MM-DD') === todayStr;
  });

  const dailyData = Array.from({ length: 12 }, (_, i) => {
    const h = i * 2;
    const hourReadings = todayReadings.filter((r) => dayjs(r.timestamp).hour() === h);
    const usage = hourReadings.reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || 0), 0);
    return { time: `${String(h).padStart(2, '0')}:00`, usage };
  });

  const weeklyData = Array.from({ length: 7 }, (_, d) => {
    const dayDate = now.subtract(6 - d, 'day');
    const dayStr = dayDate.format('YYYY-MM-DD');
    const lastWeekStr = dayDate.subtract(7, 'day').format('YYYY-MM-DD');
    const thisWeekReadings = readings.filter((r) => r.timestamp && dayjs(r.timestamp).format('YYYY-MM-DD') === dayStr);
    const lastWeekReadings = readings.filter((r) => r.timestamp && dayjs(r.timestamp).format('YYYY-MM-DD') === lastWeekStr);
    return {
      day: dayDate.format('ddd'),
      usage: thisWeekReadings.reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || 0), 0),
      lastWeek: lastWeekReadings.reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || 0), 0),
    };
  });

  const monthlyData = Array.from({ length: 6 }, (_, m) => {
    const monthDate = now.subtract(5 - m, 'month');
    const yearAgoDate = monthDate.subtract(1, 'year');
    const monthReadings = readings.filter((r) => {
      if (!r.timestamp) return false;
      const rd = dayjs(r.timestamp);
      return rd.month() === monthDate.month() && rd.year() === monthDate.year();
    });
    const lastYearReadings = readings.filter((r) => {
      if (!r.timestamp) return false;
      const rd = dayjs(r.timestamp);
      return rd.month() === yearAgoDate.month() && rd.year() === yearAgoDate.year();
    });
    return {
      month: monthDate.format('MMM'),
      usage: monthReadings.reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || 0), 0),
      lastYear: lastYearReadings.reduce((sum, r) => sum + (r.flowRate || r.flow || r.usage || 0), 0),
    };
  });

  useEffect(() => {
    let cancelled = false;
    const loadReadings = async () => {
      if (!deviceId) return;
      try {
        const { data } = await usageService.getDeviceReadings(deviceId);
        if (!cancelled && data?.success) {
          setReadings(extractList(data.data));
        }
      } catch {
        // silently fail
      }
    };
    loadReadings();
    return () => { cancelled = true; };
  }, [deviceId]);

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const flowRate = device?.telemetry?.currentFlowRate ?? liveProfile?.usage?.currentFlowRate ?? 0;
  const isFlowing = flowRate > 0;
  const valveOpen = device?.telemetry?.valveStatus === 'OPEN';
  const deviceOnline = device?.telemetry?.status === 'ACTIVE' || device?.online;
  const leakDetected = device?.telemetry?.leakDetected ?? false;

  const currentUsage = liveProfile?.usage?.totalUsageMonth ?? liveProfile?.billing?.monthUsage ?? 0;
  const monthAmount = liveProfile?.billing?.currentBill > 0
    ? liveProfile?.billing?.currentBill
    : currentUsage * pricePerUnit;
  const totalPaid = liveProfile?.billing?.totalPaid ?? 0;
  const storedOutstanding = liveProfile?.billing?.outstandingBalance ?? 0;
  const outstandingBalance = storedOutstanding > 0
    ? storedOutstanding
    : Math.max(monthAmount - totalPaid, 0);
  const billAmount = totalPaid > 0 || outstandingBalance > 0 ? outstandingBalance + totalPaid : monthAmount;
  const currentRoomLabel = liveRoom?.roomNumber
    ? `Room ${liveRoom.roomNumber}${liveBuilding?.name ? `, ${liveBuilding.name}` : ''}`
    : liveProfile?.roomId || 'Not assigned';
  const assignedDevice = liveRoom?.device?.deviceName || device?.deviceName || authDevice?.deviceName || liveProfile?.deviceId || 'Not assigned';

  const paymentHistory = Array.isArray(billingHistory) ? billingHistory.filter(b => b.status === 'PAID' || b.type === 'payment') : [];
  const invoiceHistory = Array.isArray(billingHistory) ? billingHistory.filter(b => b.status !== 'PAID' || b.type === 'invoice') : [];

  const loading = authLoading || !(profile && userLive.loaded);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={200} height={24} sx={{ mb: 3 }} />
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}><StatSkeleton /></Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={0}>
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
            {greeting}, {firstName}!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
            Here's your water usage overview for today.
          </Typography>
        </Box>
      </motion.div>

      {/* Overview Section */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={0.5}>
        <SectionHeader title="Overview" subtitle="Your billing and usage summary" />
      </motion.div>
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={i + 1}>
              {loading ? <StatSkeleton /> : (
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, wordBreak: 'break-word', pr: 1 }}>
                        {[
                          'THIS MONTH\'S USAGE',
                          'CURRENT BILL',
                          outstandingBalance > 0 ? 'OUTSTANDING BALANCE' : 'TOTAL PAID (YTD)',
                          'PAYMENT STATUS'
                        ][i]}
                      </Typography>
                      <Avatar sx={{
                        bgcolor: [
                          'primary.main',
                          'warning.main',
                          outstandingBalance > 0 ? 'error.main' : 'success.main',
                          'success.main'
                        ][i],
                        width: { xs: 32, sm: 36 }, height: { xs: 32, sm: 36 }, borderRadius: 2
                      }}>
                        {[<WaterDrop key="water-drop" />, <Receipt key="receipt" />, <AccountBalance key="account-balance" />, <CheckCircle key="check-circle" />][i]}
                      </Avatar>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.25rem', sm: '2.125rem' }, wordBreak: 'break-word', color: i === 2 && outstandingBalance > 0 ? 'error.main' : 'text.primary' }}>
                      {[
                        `${currentUsage.toLocaleString()} L`,
                        `GHS ${billAmount.toFixed(2)}`,
                        outstandingBalance > 0 ? `GHS ${outstandingBalance.toFixed(2)}` : `GHS ${totalPaid.toFixed(2)}`,
                        ''
                      ][i]}
                    </Typography>
                    {i === 1 && (
                      <Typography variant="caption" color="text.secondary">
                        Current period
                      </Typography>
                    )}
                    {i === 2 && (
                      <Chip
                        label={outstandingBalance === 0 ? 'Fully Paid' : 'Amount Due'}
                        size="small"
                        color={outstandingBalance === 0 ? 'success' : 'error'}
                        sx={{ mt: 0.5, height: 22, fontSize: '0.7rem' }}
                      />
                    )}
                    {i === 3 && (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, mt: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={outstandingBalance === 0 ? 100 : 70}
                              sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover' }}
                              color={outstandingBalance === 0 ? 'success' : 'warning'}
                            />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: outstandingBalance === 0 ? 'success.main' : 'warning.main' }}>
                            {outstandingBalance === 0 ? 'Paid' : 'Partial'}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {totalPaid > 0 ? `Last payment: GHS ${totalPaid.toFixed(2)}` : 'No payments yet'}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: { xs: 2.5, sm: 4 } }} />

      {/* Live Status & Usage Section */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={4}>
        <SectionHeader title="Live Status & Usage" subtitle="Real-time device status and daily consumption" />
      </motion.div>
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={5}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 2, display: 'block' }}>LIVE STATUS</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                  {device ? (
                    <WaterFlowIndicator flowRate={flowRate} isFlowing={isFlowing} />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <WaterDrop sx={{ color: 'text.disabled', fontSize: { xs: 24, sm: 28 } }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>No device data available</Typography>
                      </Box>
                    </Box>
                  )}
                  <Divider />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: 0 }}>
                    <ValveIcon sx={{ color: valveOpen ? '#10B981' : 'text.disabled', fontSize: { xs: 24, sm: 28 } }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>Valve {valveOpen ? 'Open' : 'Closed'}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>{valveOpen ? 'Water supply is active' : 'Water supply is shut'}</Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: 0 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: deviceOnline ? '#43a047' : '#EF4444', boxShadow: deviceOnline ? '0 0 8px rgba(67,160,71,0.6)' : 'none', flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>Device {deviceOnline ? 'Online' : 'Offline'}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>{assignedDevice}</Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: 0 }}>
                    <Home sx={{ color: 'text.secondary', fontSize: { xs: 24, sm: 28 } }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>{currentRoomLabel}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>Assigned room</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } }, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>TODAY'S USAGE</Typography>
                <Box sx={{ flex: 1, width: '100%', overflow: { xs: 'hidden', sm: 'visible' } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData}>
                      <defs>
                        <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2F80ED" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2F80ED" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#A0AEC0" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#A0AEC0" />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="usage" stroke="#2F80ED" fill="url(#dailyGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                  {todayReadings.length > 0 ? `${todayReadings.reduce((s, r) => s + (r.flowRate || r.flow || r.usage || 0), 0).toLocaleString()} L today` : 'No usage data available'}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={7}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>QUICK ACTIONS</Typography>
                <QuickActions />
                <Box sx={{ mt: 2 }}>
                  <WaterSavingTip />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <Divider sx={{ mb: { xs: 2.5, sm: 4 } }} />

      {/* Analytics Section */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={7.5}>
        <SectionHeader title="Analytics" subtitle="Usage trends and comparisons" />
      </motion.div>
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={8}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
                <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 2, flexDirection: { xs: 'column', sm: 'row' }, flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 } }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>WEEKLY USAGE COMPARISON</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 3, borderRadius: 1, bgcolor: '#2F80ED' }} />
                      <Typography variant="caption" color="text.secondary">This Week</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 3, borderRadius: 1, bgcolor: '#A0AEC0' }} />
                      <Typography variant="caption" color="text.secondary">Last Week</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ width: '100%', overflow: { xs: 'hidden', sm: 'visible' } }}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="lastWeek" fill="#A0AEC0" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="usage" fill="#2F80ED" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={9}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 2, display: 'block', wordBreak: 'break-word' }}>MONTHLY USAGE TREND</Typography>
                <Box sx={{ width: '100%', overflow: { xs: 'hidden', sm: 'visible' } }}>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="usage" stroke="#2F80ED" strokeWidth={3} dot={{ fill: '#2F80ED', r: 4 }} />
                    <Line type="monotone" dataKey="lastYear" stroke="#A0AEC0" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#A0AEC0', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={3}>
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={10}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 2, display: 'block', wordBreak: 'break-word' }}>USAGE INSIGHTS</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Estimated Bill</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.3 }}>GHS {(billAmount * 1.15).toFixed(2)}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3, flexWrap: 'wrap' }}>
                      <TrendingUp color="warning" sx={{ fontSize: { xs: 12, sm: 14 } }} />
                      <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>Est. 15% increase</Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Daily Average</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.3 }}>
                      {(currentUsage / (new Date().getDate() || 1)).toFixed(0)}
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>L/day</Typography>
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Device Status</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: deviceOnline ? '#43a047' : '#EF4444', boxShadow: deviceOnline ? '0 0 8px rgba(67,160,71,0.6)' : 'none' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: deviceOnline ? 'success.main' : 'error.main' }}>{deviceOnline ? 'Online' : 'Offline'}</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={3}>
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={11}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 2, display: 'block' }}>ALERTS & NOTIFICATIONS</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: leakDetected ? 'error.light' : 'success.light', opacity: 0.9, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {leakDetected ? <Warning color="error" sx={{ fontSize: 20 }} /> : <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />}
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: leakDetected ? 'error.dark' : 'success.dark' }}>{leakDetected ? 'Leak Detected!' : 'No Leaks Detected'}</Typography>
                        <Typography variant="caption" display="block" color="text.secondary">{leakDetected ? 'Immediate attention needed' : 'All systems normal'}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <List dense sx={{ p: 0 }}>
                    {leakDetected && (
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}><Warning color="error" /></ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="caption" sx={{ fontWeight: 500 }}>Leak detected on your device</Typography>}
                          secondary={<Typography variant="caption" color="text.secondary">Immediate attention needed</Typography>}
                        />
                      </ListItem>
                    )}
                    {!leakDetected && (
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}><CheckCircle color="success" /></ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="caption" sx={{ fontWeight: 500 }}>No active issues</Typography>}
                          secondary={<Typography variant="caption" color="text.secondary">All systems normal</Typography>}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/app/alerts')} sx={{ mt: 1, width: { xs: '100%', sm: 'auto' } }}>View All Alerts</Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <Divider sx={{ mb: { xs: 2.5, sm: 4 } }} />

      {/* Billing Section */}
      <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={11.5}>
        <SectionHeader title="Billing" subtitle="Payment history and invoices" />
      </motion.div>
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
        <Grid item xs={12} md={6}>
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>PAYMENT HISTORY</Typography>
                  <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/app/payments')} sx={{ width: { xs: '100%', sm: 'auto' } }}>View All</Button>
                </Box>
                {paymentHistory.length > 0 ? (
                  <List dense sx={{ p: 0 }}>
                    {paymentHistory.map((p, i) => (
                      <ListItem key={i} sx={{ px: 0, py: 0.8 }}>
                        <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36 } }}><Paid sx={{ color: 'success.main', fontSize: { xs: 18, sm: 20 } }} /></ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{p.date}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>GHS {p.amount.toFixed(2)}</Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">{p.method}</Typography>
                              <Chip label={p.status} size="small" color="success" sx={{ height: 18, fontSize: '0.6rem' }} />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <ErrorOutline sx={{ color: 'text.disabled', fontSize: 32, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">No payment history available</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={13}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>INVOICES</Typography>
                  <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/app/invoices')} sx={{ width: { xs: '100%', sm: 'auto' } }}>View All</Button>
                </Box>
                {invoiceHistory.length > 0 ? (
                  <List dense sx={{ p: 0 }}>
                    {invoiceHistory.map((inv, i) => (
                      <ListItem key={i} sx={{ px: 0, py: 0.8 }}>
                        <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36 } }}><Description sx={{ color: 'primary.main', fontSize: { xs: 18, sm: 20 } }} /></ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{inv.id}</Typography>
                                <Typography variant="caption" color="text.secondary">{inv.date}</Typography>
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>GHS {inv.amount.toFixed(2)}</Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.3 }}>
                              <Typography variant="caption" color="text.secondary">Due: {inv.dueDate}</Typography>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Chip label={inv.status} size="small" color={inv.status === 'Paid' ? 'success' : 'warning'} sx={{ height: 18, fontSize: '0.6rem' }} />
                                <Button size="small" variant="text" sx={{ minWidth: 24, p: 0 }}><Download sx={{ fontSize: 14 }} /></Button>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Description sx={{ color: 'text.disabled', fontSize: 32, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">No invoices available</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}

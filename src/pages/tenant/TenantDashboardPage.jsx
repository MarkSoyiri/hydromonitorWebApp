import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Avatar,
  List, ListItem, ListItemText, ListItemIcon, Divider,
  LinearProgress, Button, Skeleton,
} from '@mui/material';
import {
  WaterDrop, Receipt, AccountBalance, CheckCircle, Warning,
  Home, Adjust as ValveIcon, TrendingUp, TrendingDown,
  Download, ArrowForward, NotificationsActive,
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
import { billingService } from '@/services';

const fallbackWeeklyData = [
  { day: 'Mon', usage: 0, lastWeek: 0 },
  { day: 'Tue', usage: 0, lastWeek: 0 },
  { day: 'Wed', usage: 0, lastWeek: 0 },
  { day: 'Thu', usage: 0, lastWeek: 0 },
  { day: 'Fri', usage: 0, lastWeek: 0 },
  { day: 'Sat', usage: 0, lastWeek: 0 },
  { day: 'Sun', usage: 0, lastWeek: 0 },
];

const fallbackMonthlyData = [
  { month: 'Jan', usage: 0, lastYear: 0 },
  { month: 'Feb', usage: 0, lastYear: 0 },
  { month: 'Mar', usage: 0, lastYear: 0 },
  { month: 'Apr', usage: 0, lastYear: 0 },
  { month: 'May', usage: 0, lastYear: 0 },
  { month: 'Jun', usage: 0, lastYear: 0 },
];

const fallbackDailyData = [
  { time: '00:00', usage: 0 }, { time: '02:00', usage: 0 }, { time: '04:00', usage: 0 },
  { time: '06:00', usage: 0 }, { time: '08:00', usage: 0 }, { time: '10:00', usage: 0 },
  { time: '12:00', usage: 0 }, { time: '14:00', usage: 0 }, { time: '16:00', usage: 0 },
  { time: '18:00', usage: 0 }, { time: '20:00', usage: 0 }, { time: '22:00', usage: 0 },
];

const fallbackPaymentHistory = [];

const fallbackInvoiceHistory = [];

const fallbackNotifications = [];

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

export function TenantDashboardPage() {
  const navigate = useNavigate();
  const { profile, building, room, device, loading: authLoading } = useAuth();
  const [billingHistory, setBillingHistory] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);
  const [loading, setLoading] = useState(true);

  const firstName = profile?.fullName?.split(' ')[0] || 'there';
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadBilling = async () => {
      setLoading(true);
      try {
        const [historyRes, billRes] = await Promise.allSettled([
          billingService.getHistory(),
          billingService.getCurrentBill(),
        ]);
        if (!cancelled) {
          if (historyRes.status === 'fulfilled' && historyRes.value.data?.success) {
            setBillingHistory(historyRes.value.data.data || []);
          }
          if (billRes.status === 'fulfilled' && billRes.value.data?.success) {
            setCurrentBill(billRes.value.data.data);
          }
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadBilling();
    return () => { cancelled = true; };
  }, []);

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const flowRate = device?.telemetry?.currentFlowRate ?? profile?.usage?.currentFlowRate ?? 0;
  const isFlowing = flowRate > 0;
  const valveOpen = device?.telemetry?.valveStatus === 'OPEN';
  const deviceOnline = device?.telemetry?.status === 'ACTIVE';
  const leakDetected = device?.telemetry?.leakDetected ?? false;

  const currentUsage = profile?.usage?.totalUsageMonth ?? 0;
  const billAmount = currentBill?.amount ?? profile?.billing?.currentBill ?? 0;
  const outstandingBalance = currentBill?.outstandingBalance ?? profile?.billing?.outstandingBalance ?? 0;
  const totalPaid = currentBill?.totalPaid ?? profile?.billing?.totalPaid ?? 0;
  const currentRoomLabel = room?.roomNumber ? `Room ${room.roomNumber}${building?.name ? `, ${building.name}` : ''}` : profile?.roomId || 'Not assigned';
  const assignedDevice = device?.deviceName || room?.device?.deviceName || profile?.assignedDevice || 'Not assigned';

  const paymentHistory = Array.isArray(billingHistory) ? billingHistory.filter(b => b.status === 'PAID' || b.type === 'payment') : [];
  const invoiceHistory = Array.isArray(billingHistory) ? billingHistory.filter(b => b.status !== 'PAID' || b.type === 'invoice') : [];

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.08, duration: 0.4 },
    }),
  };

  if (authLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={200} height={24} sx={{ mb: 3 }} />
        <Grid container spacing={2.5}>
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
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.75rem' } }}>
            {greeting}, {firstName}!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Here's your water usage overview for today.
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={2.5}>
        {[0, 1, 2, 3].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={i + 1}>
              {loading ? <StatSkeleton /> : (
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
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
                        width: 36, height: 36, borderRadius: 2
                      }}>
                        {[<WaterDrop />, <Receipt />, <AccountBalance />, <CheckCircle />][i]}
                      </Avatar>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: i === 2 && outstandingBalance > 0 ? 'error.main' : 'text.primary' }}>
                      {[
                        `${currentUsage.toLocaleString()} L`,
                        `GHS ${billAmount.toFixed(2)}`,
                        outstandingBalance > 0 ? `GHS ${outstandingBalance.toFixed(2)}` : `GHS ${totalPaid.toFixed(2)}`,
                        ''
                      ][i]}
                    </Typography>
                    {i === 1 && (
                      <Typography variant="caption" color="text.secondary">
                        {currentBill?.billDate || profile?.billing?.billDate || 'Current period'}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
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

        <Grid item xs={12} md={4}>
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={5}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 2, display: 'block' }}>
                  LIVE STATUS
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {device ? (
                    <WaterFlowIndicator flowRate={flowRate} isFlowing={isFlowing} />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <WaterDrop sx={{ color: 'text.disabled', fontSize: 28 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                          No device data available
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ValveIcon sx={{ color: valveOpen ? '#10B981' : 'text.disabled', fontSize: 28 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Valve {valveOpen ? 'Open' : 'Closed'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {valveOpen ? 'Water supply is active' : 'Water supply is shut'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 12, height: 12, borderRadius: '50%',
                      bgcolor: deviceOnline ? '#10B981' : '#EF4444',
                      boxShadow: deviceOnline ? '0 0 8px rgba(16,185,129,0.5)' : 'none',
                    }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Device {deviceOnline ? 'Online' : 'Offline'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {assignedDevice}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Home sx={{ color: 'text.secondary', fontSize: 28 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {currentRoomLabel}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Assigned room
                      </Typography>
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
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  TODAY'S USAGE
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={fallbackDailyData}>
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
                  {currentUsage > 0 ? `Today: ${currentUsage.toLocaleString()} L` : 'No usage data available'}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={7}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>
                  QUICK ACTIONS
                </Typography>
                <QuickActions />
                <Box sx={{ mt: 2 }}>
                  <WaterSavingTip />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={8}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    WEEKLY USAGE COMPARISON
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={fallbackWeeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="lastWeek" fill="#A0AEC0" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="usage" fill="#2F80ED" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={9}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    MONTHLY USAGE TREND
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={fallbackMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="usage" stroke="#2F80ED" strokeWidth={3} dot={{ fill: '#2F80ED', r: 4 }} />
                    <Line type="monotone" dataKey="lastYear" stroke="#A0AEC0" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#A0AEC0', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={3}>
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={10}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 2, display: 'block' }}>
                  USAGE INSIGHTS
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Estimated Bill</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.3 }}>
                      GHS {(currentBill * 1.15).toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                      <TrendingUp color="warning" sx={{ fontSize: 14 }} />
                      <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                        Est. 15% increase
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Daily Average</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.3 }}>
                      {(currentUsage / (new Date().getDate() || 1)).toFixed(0)}
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        L/day
                      </Typography>
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Device Status</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Box sx={{
                        width: 10, height: 10, borderRadius: '50%',
                        bgcolor: deviceOnline ? '#10B981' : '#EF4444',
                      }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: deviceOnline ? 'success.main' : 'error.main' }}>
                        {deviceOnline ? 'Online' : 'Offline'}
                      </Typography>
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
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 2, display: 'block' }}>
                  ALERTS & NOTIFICATIONS
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: leakDetected ? 'error.light' : 'success.light', opacity: 0.9, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {leakDetected ? <Warning color="error" sx={{ fontSize: 20 }} /> : <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />}
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: leakDetected ? 'error.dark' : 'success.dark' }}>
                          {leakDetected ? 'Leak Detected!' : 'No Leaks Detected'}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {leakDetected ? 'Immediate attention needed' : 'All systems normal'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <List dense sx={{ p: 0 }}>
                    {leakDetected && (
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Warning color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="caption" sx={{ fontWeight: 500 }}>Leak detected on your device</Typography>}
                          secondary={<Typography variant="caption" color="text.secondary">Immediate attention needed</Typography>}
                        />
                      </ListItem>
                    )}
                    {!leakDetected && (
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="caption" sx={{ fontWeight: 500 }}>No active issues</Typography>}
                          secondary={<Typography variant="caption" color="text.secondary">All systems normal</Typography>}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/app/alerts')} sx={{ mt: 1 }}>
                  View All Alerts
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    PAYMENT HISTORY
                  </Typography>
                  <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/app/payments')}>
                    View All
                  </Button>
                </Box>
                {paymentHistory.length > 0 ? (
                  <List dense sx={{ p: 0 }}>
                    {paymentHistory.map((p, i) => (
                      <ListItem key={i} sx={{ px: 0, py: 0.8 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Paid sx={{ color: 'success.main', fontSize: 20 }} />
                        </ListItemIcon>
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
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    INVOICES
                  </Typography>
                  <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/app/invoices')}>
                    View All
                  </Button>
                </Box>
                {invoiceHistory.length > 0 ? (
                  <List dense sx={{ p: 0 }}>
                    {invoiceHistory.map((inv, i) => (
                      <ListItem key={i} sx={{ px: 0, py: 0.8 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Description sx={{ color: 'primary.main', fontSize: 20 }} />
                        </ListItemIcon>
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

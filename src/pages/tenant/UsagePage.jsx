import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { WaterDrop, TrendingUp, Speed } from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Paper } from '@mui/material';

const fallbackDaily = [
  { hour: '00', usage: 12 }, { hour: '02', usage: 8 }, { hour: '04', usage: 6 },
  { hour: '06', usage: 45 }, { hour: '08', usage: 78 }, { hour: '10', usage: 52 },
  { hour: '12', usage: 38 }, { hour: '14', usage: 42 }, { hour: '16', usage: 55 },
  { hour: '18', usage: 72 }, { hour: '20', usage: 48 }, { hour: '22', usage: 28 },
];

const fallbackWeekly = [
  { day: 'Mon', usage: 340 }, { day: 'Tue', usage: 420 }, { day: 'Wed', usage: 380 },
  { day: 'Thu', usage: 510 }, { day: 'Fri', usage: 480 }, { day: 'Sat', usage: 395 },
  { day: 'Sun', usage: 320 },
];

const fallbackMonthly = [
  { month: 'Jan', usage: 8500 }, { month: 'Feb', usage: 7800 }, { month: 'Mar', usage: 9200 },
  { month: 'Apr', usage: 10100 }, { month: 'May', usage: 11500 }, { month: 'Jun', usage: 12400 },
];

const usageByRoom = [
  { name: 'Kitchen', value: 35 },
  { name: 'Bathroom', value: 42 },
  { name: 'Laundry', value: 15 },
  { name: 'Other', value: 8 },
];

const COLORS = ['#2F80ED', '#00B4D8', '#10B981', '#F59E0B'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1.5, boxShadow: 4, borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="subtitle2" sx={{ color: p.color, fontWeight: 600 }}>
            {p.name || 'Usage'}: {p.value.toLocaleString()} L
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

export function UsagePage() {
  const { profile } = useAuth();
  const [daily, setDaily] = useState(fallbackDaily);
  const [weekly, setWeekly] = useState(fallbackWeekly);
  const [monthly, setMonthly] = useState(fallbackMonthly);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const currentUsage = profile?.usage?.totalUsageMonth ?? 12400;
  const todayUsage = profile?.usage?.totalUsageToday ?? 0;
  const dailyAvg = currentUsage / (new Date().getDate() || 1);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={36} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={300} height={20} sx={{ mb: 3 }} />
        <Grid container spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Card sx={{ borderRadius: 3 }}><CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Skeleton variant="circular" width={32} height={32} sx={{ mx: 'auto', mb: 1 }} />
                <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
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
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Water Usage</Typography>
          <Typography variant="body2" color="text.secondary">Detailed breakdown of your water consumption</Typography>
        </Box>
      </motion.div>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
              <WaterDrop sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{todayUsage.toLocaleString()} L</Typography>
              <Typography variant="body2" color="text.secondary">Today's Usage</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{currentUsage.toLocaleString()} L</Typography>
              <Typography variant="body2" color="text.secondary">This Month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
              <Speed sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{dailyAvg.toFixed(0)} L</Typography>
              <Typography variant="body2" color="text.secondary">Daily Average</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Hourly Usage Today</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={daily}>
                  <defs><linearGradient id="hourlyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2F80ED" stopOpacity={0.3} /><stop offset="95%" stopColor="#2F80ED" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="usage" stroke="#2F80ED" fill="url(#hourlyGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Usage by Area</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={usageByRoom} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value">
                    {usageByRoom.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Weekly Usage</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weekly}>
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

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Monthly Trend</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="usage" stroke="#2F80ED" strokeWidth={3} dot={{ fill: '#2F80ED', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CardHeader, Skeleton, Alert,
} from '@mui/material';
import { PageHeader } from '@/components/common';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { analyticsService } from '@/services';

const fallbackWeeklyUsage = [
  { day: 'Mon', usage: 0, avg: 0 },
  { day: 'Tue', usage: 0, avg: 0 },
  { day: 'Wed', usage: 0, avg: 0 },
  { day: 'Thu', usage: 0, avg: 0 },
  { day: 'Fri', usage: 0, avg: 0 },
  { day: 'Sat', usage: 0, avg: 0 },
  { day: 'Sun', usage: 0, avg: 0 },
];

const fallbackMonthlyTrend = [
  { month: 'Jan', current: 0, predicted: 0 },
  { month: 'Feb', current: 0, predicted: 0 },
  { month: 'Mar', current: 0, predicted: 0 },
  { month: 'Apr', current: 0, predicted: 0 },
  { month: 'May', current: 0, predicted: 0 },
  { month: 'Jun', current: 0, predicted: 0 },
];

const fallbackBuildingComparison = [];

const fallbackLeakTrend = [
  { month: 'Jan', leaks: 0 },
  { month: 'Feb', leaks: 0 },
  { month: 'Mar', leaks: 0 },
  { month: 'Apr', leaks: 0 },
  { month: 'May', leaks: 0 },
  { month: 'Jun', leaks: 0 },
];

const COLORS = ['#2F80ED', '#42A5F5', '#4CAF50', '#FB8C00', '#E53935'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <Card sx={{ p: 1.5, boxShadow: 4 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="subtitle2" sx={{ fontWeight: 600, color: p.color }}>
            {p.name}: {Number(p.value).toLocaleString()} L
          </Typography>
        ))}
      </Card>
    );
  }
  return null;
};

function ChartSkeleton() {
  return <Skeleton variant="rounded" width="100%" height={300} sx={{ borderRadius: 2 }} />;
}

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const { data } = await analyticsService.getSystem();
      if (data?.success && data?.data) {
        setAnalytics(data.data);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const weeklyUsage = analytics?.weeklyUsage || fallbackWeeklyUsage;
  const monthlyTrend = analytics?.monthlyTrend || fallbackMonthlyTrend;
  const buildingComparison = analytics?.buildingComparison || fallbackBuildingComparison;
  const leakTrend = analytics?.leakTrend || fallbackLeakTrend;

  return (
    <Box>
      <PageHeader title="Analytics" subtitle="Water usage analytics and insights" />

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error} - Showing default data.</Alert>}

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Weekly Consumption vs Average" />
            <CardContent>
              {loading ? <ChartSkeleton /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="usage" fill="#2F80ED" radius={[4, 4, 0, 0]} name="Usage" />
                    <Bar dataKey="avg" fill="#A0AEC0" radius={[4, 4, 0, 0]} name="Average" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Building Comparison" />
            <CardContent>
              {loading ? <ChartSkeleton /> : buildingComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={buildingComparison} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                      dataKey="usage" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {buildingComparison.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                  <Typography color="text.secondary">No building data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Usage Trend" />
            <CardContent>
              {loading ? <ChartSkeleton /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="current" stroke="#2F80ED" strokeWidth={2} name="Current" dot />
                    {monthlyTrend[0]?.predicted !== undefined && (
                      <Line type="monotone" dataKey="predicted" stroke="#FB8C00" strokeWidth={2} strokeDasharray="5 5" name="Predicted" dot />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Leak Detection Trend" />
            <CardContent>
              {loading ? <ChartSkeleton /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={leakTrend}>
                    <defs>
                      <linearGradient id="leakGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E53935" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                    <Tooltip />
                    <Area type="monotone" dataKey="leaks" stroke="#E53935" fill="url(#leakGrad)" strokeWidth={2} name="Leaks" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

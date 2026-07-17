import { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Stack, TextField,
  Select, MenuItem, FormControl, InputLabel, Skeleton, Alert,
} from '@mui/material';
import { PictureAsPdf, Description, TableChart, Download } from '@mui/icons-material';
import { PageHeader } from '@/components/common';
import { analyticsService, dashboardService } from '@/services';
import { extractList } from '@/utils/response';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const reportTypes = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const reportCategories = [
  { value: 'buildings', label: 'Buildings' },
  { value: 'rooms', label: 'Rooms' },
  { value: 'tenants', label: 'Tenants' },
  { value: 'devices', label: 'Devices' },
  { value: 'leaks', label: 'Leaks' },
  { value: 'billing', label: 'Billing' },
];

export function ReportsPage() {
  const [reportType, setReportType] = useState('monthly');
  const [category, setCategory] = useState('buildings');
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [analyticsRes, statsRes] = await Promise.allSettled([
        analyticsService.getSystem(),
        dashboardService.getStats(),
      ]);
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data?.success) {
        setAnalytics(analyticsRes.value.data.data);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
        setStats(statsRes.value.data.data);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalUsage = stats?.totalUsageToday ?? 0;
  const totalBuildings = stats?.totalBuildings ?? 0;
  const totalRooms = stats?.totalRooms ?? 0;
  const totalDevices = stats?.totalDevices ?? 0;
  const activeAlerts = stats?.unresolvedAlerts ?? 0;

  const availableReports = [
    { title: 'Monthly Consumption Report', desc: `Water usage across ${totalBuildings} building(s)`, icon: <TableChart />, color: 'primary', data: analytics?.weeklyUsage },
    { title: 'Revenue Summary', desc: 'Billing and payment overview', icon: <Description />, color: 'success', data: analytics?.monthlyTrend },
    { title: 'Device Health Report', desc: `${totalDevices} device(s) monitored`, icon: <PictureAsPdf />, color: 'info', data: analytics?.buildingComparison },
    { title: 'Leak Analysis', desc: `${activeAlerts} active alert(s)`, icon: <PictureAsPdf />, color: 'error', data: analytics?.leakTrend },
    { title: 'Tenant Usage Report', desc: 'Individual tenant consumption', icon: <TableChart />, color: 'warning', data: null },
    { title: 'System Audit Log', desc: 'All administrative actions', icon: <Description />, color: 'text.secondary', data: null },
  ];

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <PageHeader title="Reports" subtitle="Generate and export system reports" />
      </motion.div>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Generate Report</Typography>
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Report Type</InputLabel>
                    <Select value={reportType} label="Report Type" onChange={(e) => setReportType(e.target.value)}>
                      {reportTypes.map((rt) => (
                        <MenuItem key={rt.value} value={rt.value}>{rt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                      {reportCategories.map((rc) => (
                        <MenuItem key={rc.value} value={rc.value}>{rc.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField label="Date" type="date" defaultValue={dayjs().format('YYYY-MM-DD')} fullWidth
                    InputLabelProps={{ shrink: true }} />
                  <Button variant="contained" startIcon={<Download />} fullWidth disabled={loading}>
                    Generate Report
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Card>
                    <CardContent>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="80%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              availableReports.map((report, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}>
                    <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ color: `${report.color}.main`, opacity: 0.7 }}>{report.icon}</Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2">{report.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{report.desc}</Typography>
                        </Box>
                        <Button size="small" startIcon={<Download />}>Export</Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

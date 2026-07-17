import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Tabs, Tab, Alert as MuiAlert,
} from '@mui/material';
import { Warning, CheckCircle, Error as ErrorIcon, Info } from '@mui/icons-material';
import { PageHeader, StatCard, DataTable, StatusChip } from '@/components/common';
import { alertService } from '@/services';
import { extractList } from '@/utils/response';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const columns = [
  {
    field: 'type', label: 'Type', width: 100,
    render: (r) => (
      <Chip
        icon={r.type === 'LEAK' ? <Warning /> : r.type === 'CRITICAL' ? <ErrorIcon /> : <Info />}
        label={r.type || 'INFO'}
        color={r.type === 'LEAK' ? 'error' : r.type === 'CRITICAL' ? 'warning' : 'info'}
        size="small"
      />
    ),
  },
  { field: 'deviceId', label: 'Device', width: 140 },
  { field: 'roomId', label: 'Room', width: 100, render: (r) => r.roomId || '—' },
  { field: 'message', label: 'Message', width: 300 },
  { field: 'status', label: 'Status', width: 100, render: (r) => <StatusChip status={r.status || 'PENDING'} /> },
  { field: 'createdAt', label: 'Time', width: 160, render: (r) => r.createdAt ? dayjs(r.createdAt).format('MMM D, YYYY HH:mm') : r.timestamp ? dayjs(r.timestamp).format('MMM D, YYYY HH:mm') : '—' },
];

export function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    alertService.getAll()
      .then((response) => {
        if (!mounted) return;
        const apiData = response?.data;
        if (apiData?.success) {
          setAlerts(extractList(apiData.data));
        } else {
          setAlerts([]);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || 'Failed to load alerts');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const activeAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
  const resolvedAlerts = alerts.filter((a) => a.status === 'RESOLVED');
  const leakAlerts = alerts.filter((a) => a.type === 'LEAK');
  const criticalAlerts = alerts.filter((a) => a.type === 'CRITICAL');

  const displayAlerts = tab === 0 ? alerts
    : tab === 1 ? activeAlerts
      : tab === 2 ? resolvedAlerts
        : tab === 3 ? leakAlerts
          : criticalAlerts;

  if (error) {
    return (
      <Box>
        <PageHeader title="Alerts" subtitle="Real-time alerts and notifications" />
        <MuiAlert severity="error" sx={{ mt: 2 }}>{error}</MuiAlert>
      </Box>
    );
  }

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <PageHeader title="Alerts" subtitle="Real-time alerts and notifications" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <StatCard title="Total" value={alerts.length} icon={<Warning />} color="primary" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Active" value={activeAlerts.length} icon={<ErrorIcon />} color="error" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Leaks" value={leakAlerts.length} icon={<Warning />} color="warning" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Critical" value={criticalAlerts.length} icon={<ErrorIcon />} color="error" />
          </Grid>
        </Grid>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
        <Card>
          <CardContent>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
              <Tab label="All" />
              <Tab label="Active" />
              <Tab label="Resolved" />
              <Tab label="Leaks" />
              <Tab label="Critical" />
            </Tabs>
            <DataTable columns={columns} rows={displayAlerts} loading={loading} />
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

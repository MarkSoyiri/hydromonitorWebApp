import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip, List, ListItem, ListItemText, ListItemIcon, Skeleton } from '@mui/material';
import { CheckCircle, Warning, Info, NotificationsActive } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { alertService } from '@/services';
import { extractList } from '@/utils/response';
import { useAuth } from '@/contexts/AuthContext';

const fallbackAlerts = [];

const severityIcons = {
  'OK': <CheckCircle color="success" />,
  'Info': <Info color="primary" />,
  'Warning': <Warning color="warning" />,
  'Critical': <Warning color="error" />,
};

const severityColors = {
  'OK': 'success',
  'Info': 'primary',
  'Warning': 'warning',
  'Critical': 'error',
};

export function TenantAlertsPage() {
  const { device } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const leakDetected = device?.telemetry?.leakDetected ?? false;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await alertService.getAll();
        const apiData = response?.data;
        if (!cancelled && apiData?.success) {
          setAlerts(extractList(apiData.data));
        } else {
          if (!cancelled) setAlerts(fallbackAlerts);
        }
      } catch {
        if (!cancelled) {
          const leakAlert = leakDetected
            ? [{ type: 'critical', message: 'Leak detected in your system!', time: 'Just now', severity: 'Critical' }, ...fallbackAlerts]
            : fallbackAlerts;
          setAlerts(leakAlert);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [leakDetected]);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={36} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={250} height={20} sx={{ mb: 3 }} />
        <Grid container spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Card sx={{ borderRadius: 3 }}><CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Skeleton variant="circular" width={36} height={36} sx={{ mx: 'auto', mb: 1 }} />
                <Skeleton variant="text" width="40%" sx={{ mx: 'auto' }} />
              </CardContent></Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const activeIssues = alerts.filter((a) => a.severity === 'Critical' || a.severity === 'Warning').length;
  const resolvedIssues = alerts.filter((a) => a.severity === 'OK').length;

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Alerts & Notifications</Typography>
          <Typography variant="body2" color="text.secondary">Stay informed about your water system</Typography>
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3, bgcolor: leakDetected ? 'error.light' : 'success.light', opacity: 0.9 }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                {leakDetected ? <Warning sx={{ fontSize: 36, color: 'error.main' }} /> : <CheckCircle sx={{ fontSize: 36, color: 'success.main' }} />}
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{leakDetected ? 'Leak!' : 'No Issues'}</Typography>
                <Typography variant="body2" color="text.secondary">{leakDetected ? 'Immediate attention required' : 'All systems normal'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <NotificationsActive sx={{ fontSize: 36, color: 'primary.main' }} />
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{alerts.length}</Typography>
                <Typography variant="body2" color="text.secondary">Total Notifications</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Warning sx={{ fontSize: 36, color: activeIssues > 0 ? 'warning.main' : 'success.main' }} />
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{activeIssues}</Typography>
                <Typography variant="body2" color="text.secondary">Active Alerts</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Recent Alerts</Typography>
            {alerts.length > 0 ? (
              <List sx={{ p: 0 }}>
                {alerts.map((alert, i) => (
                  <ListItem key={i} sx={{ px: 0, py: 1.2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {severityIcons[alert.severity] || <Info color="primary" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{alert.message}</Typography>
                          <Chip label={alert.severity} size="small" color={severityColors[alert.severity] || 'default'} sx={{ height: 20, fontSize: '0.6rem' }} />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">{alert.time || alert.createdAt || ''}</Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 40, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">No alerts at this time</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

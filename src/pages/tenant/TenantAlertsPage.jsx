import { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip, List, ListItem, ListItemText, ListItemIcon, Skeleton } from '@mui/material';
import { CheckCircle, Warning, Info, NotificationsActive } from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  NODES, useRealtimeValue, useLiveAlertsByBuilding, useLiveTelemetry,
} from '@/services/realtime';
import { useAuth } from '@/contexts/AuthContext';
import dayjs from 'dayjs';

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

const toTitleCase = (s) => {
  const lower = (s || 'Info').toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export function TenantAlertsPage() {
  const { profile, device: authDevice, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  const tenantUid = profile?.uid || profile?.currentUser?.uid;

  const userLive = useRealtimeValue(tenantUid ? `${NODES.users}/${tenantUid}` : null);
  const liveProfile = userLive.value ? { ...profile, ...userLive.value, uid: tenantUid } : profile;
  const buildingId = liveProfile?.buildingId;
  const roomId = liveProfile?.roomId;

  const deviceId = liveProfile?.deviceId || authDevice?.deviceId;
  const { telemetry: liveTelemetry } = useLiveTelemetry(deviceId);
  const leakDetected = liveTelemetry?.leakDetected ?? authDevice?.telemetry?.leakDetected ?? false;

  const { alerts: apiAlerts, loaded: alertsLoaded } = useLiveAlertsByBuilding(buildingId);
  const alerts = useMemo(
    () => {
      const relevant = apiAlerts.filter(
        (a) => a.tenantId === tenantUid
          || (roomId && a.roomId === roomId)
      );
      return relevant.map((a) => ({
        ...a,
        severity: toTitleCase(a.severity || 'Info'),
        message: a.message || a.type || 'Notification',
        time: a.createdAt ? dayjs(a.createdAt).format('MMM D, HH:mm') : 'Just now',
      }));
    },
    [apiAlerts, tenantUid, roomId]
  );

  useEffect(() => {
    if (profile && alertsLoaded) setLoading(false);
  }, [profile, alertsLoaded, authLoading]);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={36} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={250} height={20} sx={{ mb: 3 }} />
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Card sx={{ borderRadius: 3 }}><CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, textAlign: 'center' }}>
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

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Alerts & Notifications</Typography>
          <Typography variant="body2" color="text.secondary">Stay informed about your water system</Typography>
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3, bgcolor: leakDetected ? 'error.light' : 'success.light', opacity: 0.9 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, textAlign: 'center' }}>
                {leakDetected ? <Warning sx={{ fontSize: { xs: 28, sm: 36 }, color: 'error.main' }} /> : <CheckCircle sx={{ fontSize: { xs: 28, sm: 36 }, color: 'success.main' }} />}
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>{leakDetected ? 'Leak!' : 'No Issues'}</Typography>
                <Typography variant="body2" color="text.secondary">{leakDetected ? 'Immediate attention required' : 'All systems normal'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, textAlign: 'center' }}>
                <NotificationsActive sx={{ fontSize: { xs: 28, sm: 36 }, color: 'primary.main' }} />
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>{alerts.length}</Typography>
                <Typography variant="body2" color="text.secondary">Total Notifications</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, textAlign: 'center' }}>
                <Warning sx={{ fontSize: { xs: 28, sm: 36 }, color: activeIssues > 0 ? 'warning.main' : 'success.main' }} />
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>{activeIssues}</Typography>
                <Typography variant="body2" color="text.secondary">Active Alerts</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Recent Alerts</Typography>
            {alerts.length > 0 ? (
              <List sx={{ p: 0 }}>
                {alerts.map((alert, i) => (
                  <ListItem key={i} sx={{ px: 0, py: 1.2 }}>
                    <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
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

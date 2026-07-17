import { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, Chip, Skeleton, Divider } from '@mui/material';
import { NotificationsOutlined, Warning, CheckCircle, Info, Error as ErrorIcon } from '@mui/icons-material';
import { PageHeader, EmptyState } from '@/components/common';
import { alertService } from '@/services';
import { extractList } from '@/utils/response';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const severityIcons = {
  LEAK: <ErrorIcon color="error" />,
  CRITICAL: <Warning color="error" />,
  WARNING: <Warning color="warning" />,
  INFO: <Info color="primary" />,
  RESOLVED: <CheckCircle color="success" />,
};

const severityColors = {
  LEAK: 'error',
  CRITICAL: 'error',
  WARNING: 'warning',
  INFO: 'info',
  RESOLVED: 'success',
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await alertService.getAll();
      if (data?.success) {
        const alerts = extractList(data.data);
        setNotifications(alerts.map((a) => ({
          id: a.alertId || a.id,
          message: a.message || `Alert ${a.alertId || ''}`,
          type: a.type || a.severity || 'INFO',
          time: a.createdAt || a.timestamp || '',
          status: a.status || 'PENDING',
          deviceId: a.deviceId,
        })));
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <PageHeader title="Notifications" subtitle="All system notifications" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
        <Card>
          <CardContent>
          {loading ? (
            <List sx={{ p: 0 }}>
              {[1, 2, 3].map((i) => (
                <Box key={i}>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </ListItem>
                  {i < 3 && <Divider />}
                </Box>
              ))}
            </List>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={<NotificationsOutlined sx={{ fontSize: 64 }} />}
              title="No notifications"
              description="You're all caught up!"
            />
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((n, i) => (
                <Box key={n.id || i}>
                  <ListItem sx={{ px: 0, py: 1.2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {severityIcons[n.type] || <Info color="primary" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{n.message}</Typography>
                          <Chip
                            label={n.type}
                            size="small"
                            color={severityColors[n.type] || 'default'}
                            sx={{ height: 20, fontSize: '0.6rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.3 }}>
                          <Typography variant="caption" color="text.secondary">
                            {n.time ? dayjs(n.time).format('MMM D, YYYY HH:mm') : ''}
                          </Typography>
                          <Chip
                            label={n.status}
                            size="small"
                            variant="outlined"
                            color={n.status === 'RESOLVED' ? 'success' : 'warning'}
                            sx={{ height: 18, fontSize: '0.6rem' }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  {i < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

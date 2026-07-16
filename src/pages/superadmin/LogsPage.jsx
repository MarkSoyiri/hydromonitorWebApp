import { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Chip, List, ListItem, ListItemText, ListItemIcon, TextField, InputAdornment, Skeleton } from '@mui/material';
import { ListAlt, Search, Info, Warning, Error as ErrorIcon, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { alertService } from '@/services';
import { extractList } from '@/utils/response';
import dayjs from 'dayjs';

const levelIcons = {
  INFO: <Info color="primary" />,
  LEAK: <ErrorIcon color="error" />,
  CRITICAL: <ErrorIcon color="error" />,
  WARNING: <Warning color="warning" />,
  RESOLVED: <CheckCircle color="success" />,
};

const levelColors = {
  INFO: 'primary',
  LEAK: 'error',
  CRITICAL: 'error',
  WARNING: 'warning',
  RESOLVED: 'success',
};

export function LogsPage() {
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const { data } = await alertService.getAll();
      if (data?.success) {
        const alerts = extractList(data.data);
        const logEntries = alerts.map((alert) => ({
          time: alert.createdAt || alert.timestamp || '',
          level: alert.type || alert.severity || 'INFO',
          message: alert.message || `Alert ${alert.alertId || ''}`,
          source: alert.deviceId ? 'Device' : alert.type === 'LEAK' ? 'Alert' : 'System',
          status: alert.status || 'PENDING',
        }));
        logEntries.sort((a, b) => new Date(b.time) - new Date(a.time));
        setLogs(logEntries);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = logs.filter((log) =>
    log.message.toLowerCase().includes(search.toLowerCase()) ||
    log.source.toLowerCase().includes(search.toLowerCase()) ||
    log.level.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>System Logs</Typography>
            <Typography variant="body2" color="text.secondary">Monitor system activity and events</Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            }}
            sx={{ minWidth: 280 }}
          />
        </Box>
      </motion.div>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          {loading ? (
            <List sx={{ p: 0 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Box key={i}>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="70%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </ListItem>
                </Box>
              ))}
            </List>
          ) : (
            <List sx={{ p: 0 }}>
              {filtered.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <ListAlt sx={{ color: 'text.disabled', fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {search ? 'No logs match your search' : 'No system logs available'}
                  </Typography>
                </Box>
              ) : (
                filtered.map((log, i) => (
                  <Box key={i}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>{levelIcons[log.level] || <Info color="primary" />}</ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>{log.message}</Typography>
                            <Chip label={log.level} size="small" color={levelColors[log.level] || 'default'} sx={{ height: 18, fontSize: '0.6rem' }} />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            {log.time ? dayjs(log.time).format('DD MMM YYYY HH:mm:ss') : '—'} · {log.source}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {i < filtered.length - 1 && <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}
                  </Box>
                ))
              )}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

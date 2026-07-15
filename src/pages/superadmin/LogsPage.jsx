import { Box, Card, CardContent, Typography, Chip, List, ListItem, ListItemText, ListItemIcon, Button, TextField, InputAdornment } from '@mui/material';
import { ListAlt, Search, Info, Warning, Error as ErrorIcon, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useState } from 'react';

const logEntries = [
  { time: '09 Jul 2026 14:32:18', level: 'info', message: 'User admin@hydromonitor.com logged in', source: 'Auth' },
  { time: '09 Jul 2026 14:30:05', level: 'warn', message: 'Device WM-0042 heartbeat delay: 3.2s', source: 'Device' },
  { time: '09 Jul 2026 14:28:44', level: 'info', message: 'Tenant John Doe viewed dashboard', source: 'App' },
  { time: '09 Jul 2026 14:25:00', level: 'error', message: 'Device WM-0012 connection timeout', source: 'Device' },
  { time: '09 Jul 2026 14:20:12', level: 'info', message: 'Monthly bill generated for Building A', source: 'Billing' },
  { time: '09 Jul 2026 14:15:33', level: 'warn', message: 'High water usage alert: Room 204 (510L/day)', source: 'Alert' },
  { time: '09 Jul 2026 14:10:00', level: 'info', message: 'System health check completed: OK', source: 'System' },
  { time: '09 Jul 2026 14:00:00', level: 'info', message: 'Database backup completed successfully', source: 'System' },
  { time: '09 Jul 2026 13:45:22', level: 'info', message: 'User admin2@hydromonitor.com created tenant', source: 'Admin' },
  { time: '09 Jul 2026 13:30:00', level: 'warn', message: 'Memory usage at 72% on app-server-01', source: 'System' },
];

const levelIcons = {
  info: <Info color="primary" />,
  warn: <Warning color="warning" />,
  error: <ErrorIcon color="error" />,
};

const levelColors = {
  info: 'primary',
  warn: 'warning',
  error: 'error',
};

export function LogsPage() {
  const [search, setSearch] = useState('');

  const filtered = logEntries.filter((log) =>
    log.message.toLowerCase().includes(search.toLowerCase()) ||
    log.source.toLowerCase().includes(search.toLowerCase()) ||
    log.level.includes(search.toLowerCase())
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
          <List sx={{ p: 0 }}>
            {filtered.map((log, i) => (
              <Box key={i}>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>{levelIcons[log.level]}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>{log.message}</Typography>
                        <Chip label={log.level} size="small" color={levelColors[log.level]} sx={{ height: 18, fontSize: '0.6rem' }} />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {log.time} · {log.source}
                      </Typography>
                    }
                  />
                </ListItem>
                {i < filtered.length - 1 && <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}

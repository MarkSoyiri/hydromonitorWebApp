import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';
import {
  WaterDrop, Receipt, Download, BugReport,
  NotificationsActive, HeadsetMic,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const actions = [
  { label: 'View Usage', icon: <WaterDrop />, path: '/app/usage', color: '#2F80ED' },
  { label: 'Pay Bill', icon: <Receipt />, path: '/app/bills', color: '#10B981' },
  { label: 'Download Invoice', icon: <Download />, path: '/app/invoices', color: '#8B5CF6' },
  { label: 'Report Issue', icon: <BugReport />, path: '/app/support', color: '#F59E0B' },
  { label: 'View Alerts', icon: <NotificationsActive />, path: '/app/alerts', color: '#EF4444' },
  { label: 'Contact Support', icon: <HeadsetMic />, path: '/app/support', color: '#06B6D4' },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
        Quick Actions
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
        {actions.map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Paper
              onClick={() => navigate(action.path)}
              sx={{
                p: 1.5,
                borderRadius: 2,
                cursor: 'pointer',
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: action.color,
                  boxShadow: `0 4px 12px ${action.color}20`,
                },
              }}
              elevation={0}
            >
              <Box sx={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 0.5,
                background: `${action.color}15`,
                color: action.color,
              }}>
                {action.icon}
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.65rem' }}>
                {action.label}
              </Typography>
            </Paper>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}

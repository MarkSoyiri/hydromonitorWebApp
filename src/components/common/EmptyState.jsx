import { Box, Typography } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';

export function EmptyState({ icon, title = 'No data found', description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 6, sm: 8 },
          px: 2,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            color: 'text.disabled',
            mb: 2,
            opacity: 0.5,
            '& .MuiSvgIcon-root': { fontSize: { xs: 40, sm: 56 } },
          }}
        >
          {icon || <InboxOutlined />}
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1.125rem' } }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.disabled" sx={{ mb: 2, maxWidth: 400, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            {description}
          </Typography>
        )}
        {action}
      </Box>
    </motion.div>
  );
}

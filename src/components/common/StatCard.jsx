import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

export function StatCard({ title, value, icon, color = 'primary', subtitle, loading, trend, trendLabel, onClick }) {
  if (loading) {
    return (
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
          <Skeleton variant="text" width="80%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card
        onClick={onClick}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          transition: 'box-shadow 0.2s',
          '&:hover': onClick ? { boxShadow: 6 } : {},
        }}
      >
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${color}.light`,
                color: `${color}.main`,
                opacity: 0.9,
              }}
            >
              {icon}
            </Box>
          </Box>
          <Typography variant="h4" sx={{ mt: 2, fontWeight: 700 }}>
            {value ?? '—'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {(subtitle || trend) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              {trend && (
                <Typography
                  variant="caption"
                  sx={{
                    color: trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  {trend > 0 ? '+' : ''}{trend}%
                </Typography>
              )}
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
              {trendLabel && (
                <Typography variant="caption" color="text.secondary">
                  {trendLabel}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

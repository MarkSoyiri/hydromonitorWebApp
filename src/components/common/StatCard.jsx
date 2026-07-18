import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { useThemeMode } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

const colorGradients = {
  primary: (isDark) => isDark
    ? 'linear-gradient(135deg, rgba(95,164,255,0.1) 0%, rgba(47,128,237,0.04) 100%)'
    : 'linear-gradient(135deg, rgba(47,128,237,0.08) 0%, rgba(47,128,237,0.02) 100%)',
  info: (isDark) => isDark
    ? 'linear-gradient(135deg, rgba(95,164,255,0.1) 0%, rgba(0,180,216,0.04) 100%)'
    : 'linear-gradient(135deg, rgba(47,128,237,0.08) 0%, rgba(95,164,255,0.02) 100%)',
  success: (isDark) => isDark
    ? 'linear-gradient(135deg, rgba(102,187,106,0.1) 0%, rgba(76,175,80,0.04) 100%)'
    : 'linear-gradient(135deg, rgba(76,175,80,0.08) 0%, rgba(129,199,132,0.02) 100%)',
  warning: (isDark) => isDark
    ? 'linear-gradient(135deg, rgba(255,167,38,0.1) 0%, rgba(251,140,0,0.04) 100%)'
    : 'linear-gradient(135deg, rgba(251,140,0,0.08) 0%, rgba(255,183,77,0.02) 100%)',
  error: (isDark) => isDark
    ? 'linear-gradient(135deg, rgba(239,83,80,0.1) 0%, rgba(229,57,53,0.04) 100%)'
    : 'linear-gradient(135deg, rgba(229,57,53,0.08) 0%, rgba(239,83,80,0.02) 100%)',
  secondary: (isDark) => isDark
    ? 'linear-gradient(135deg, rgba(128,201,255,0.1) 0%, rgba(66,165,245,0.04) 100%)'
    : 'linear-gradient(135deg, rgba(66,165,245,0.08) 0%, rgba(128,201,255,0.02) 100%)',
};

const iconGradients = {
  primary: 'linear-gradient(135deg, #2F80ED, #5FA4FF)',
  info: 'linear-gradient(135deg, #2F80ED, #00B4D8)',
  success: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
  warning: 'linear-gradient(135deg, #FB8C00, #FFB74D)',
  error: 'linear-gradient(135deg, #E53935, #EF5350)',
  secondary: 'linear-gradient(135deg, #42A5F5, #80C9FF)',
};

const iconShadows = {
  primary: 'rgba(47,128,237,0.25)',
  success: 'rgba(76,175,80,0.25)',
  warning: 'rgba(251,140,0,0.25)',
  error: 'rgba(229,57,53,0.25)',
  info: 'rgba(47,128,237,0.25)',
  secondary: 'rgba(66,165,245,0.25)',
};

export function StatCard({ title, value, icon, color = 'primary', subtitle, loading, trend, trendLabel, onClick, index = 0 }) {
  const { isDark } = useThemeMode();

  if (loading) {
    return (
      <Card sx={{ overflow: 'hidden' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="60%" height={36} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="30%" height={16} sx={{ mt: 0.5 }} />
            </Box>
            <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2.5 }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      style={{ height: '100%' }}
    >
      <Card
        onClick={onClick}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          background: (colorGradients[color] || colorGradients.primary)(isDark),
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.6)',
          boxShadow: isDark
            ? '0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)'
            : '0 4px 24px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.6)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: iconGradients[color] || iconGradients.primary,
            borderRadius: '20px 20px 0 0',
          },
        }}
      >
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                  fontSize: '0.65rem',
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  mt: 1,
                  fontWeight: 800,
                  fontSize: { xs: '1.5rem', sm: '1.75rem' },
                  lineHeight: 1.2,
                  color: 'text.primary',
                }}
              >
                {value ?? '—'}
              </Typography>
              {(subtitle || trend) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  {trend && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    >
                      {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </Typography>
                  )}
                  {subtitle && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {subtitle}
                    </Typography>
                  )}
                  {trendLabel && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {trendLabel}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: iconGradients[color] || iconGradients.primary,
                color: '#fff',
                boxShadow: `0 4px 12px ${iconShadows[color] || iconShadows.primary}`,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

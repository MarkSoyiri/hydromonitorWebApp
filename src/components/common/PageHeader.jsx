import { Box, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { motion } from 'framer-motion';

export function PageHeader({ title, subtitle, action, onAction, actionLabel, actionIcon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.35rem', sm: '1.5rem', md: '1.6rem' },
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, maxWidth: 500 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && onAction && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="contained"
              startIcon={actionIcon || <Add />}
              onClick={onAction}
              size="medium"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                boxShadow: '0 4px 12px rgba(47,128,237,0.25)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(47,128,237,0.35)',
                },
              }}
            >
              {actionLabel || action}
            </Button>
          </motion.div>
        )}
      </Box>
    </motion.div>
  );
}

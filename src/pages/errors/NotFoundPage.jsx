import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { WaterDrop } from '@mui/icons-material';
import { motion } from 'framer-motion';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(47,128,237,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <WaterDrop
              sx={{
                fontSize: 72,
                color: 'primary.main',
                mb: 2,
                opacity: 0.6,
                filter: 'drop-shadow(0 4px 12px rgba(47,128,237,0.3))',
              }}
            />
          </motion.div>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '4rem', sm: '6rem' },
              background: 'linear-gradient(135deg, #2F80ED 0%, #00B4D8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}
          >
            404
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
            Page not found
          </Typography>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="contained"
              onClick={() => window.history.back()}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.2,
                boxShadow: '0 4px 16px rgba(47,128,237,0.3)',
              }}
            >
              Go Back
            </Button>
          </motion.div>
        </Box>
      </motion.div>
    </Box>
  );
}

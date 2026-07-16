import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';

function WaveBackground() {
  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      <motion.div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100%',
          opacity: 0.06,
        }}
        animate={{ x: [0, -100, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 1440 400" preserveAspectRatio="none" style={{ width: '200%', height: '100%' }}>
          <path
            d="M0,250 C360,200 720,300 1080,250 C1260,225 1350,275 1440,250 L1440,400 L0,400 Z"
            fill="url(#ctaWaveGradient)"
          />
        </svg>
      </motion.div>
      <motion.div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100%',
          opacity: 0.04,
        }}
        animate={{ x: [0, -80, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 1440 400" preserveAspectRatio="none" style={{ width: '200%', height: '100%' }}>
          <path
            d="M0,280 C360,230 720,330 1080,280 C1260,255 1350,305 1440,280 L1440,400 L0,400 Z"
            fill="url(#ctaWaveGradient2)"
          />
        </svg>
      </motion.div>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="ctaWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2F80ED" />
            <stop offset="100%" stopColor="#00B4D8" />
          </linearGradient>
          <linearGradient id="ctaWaveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5FA4FF" />
            <stop offset="100%" stopColor="#42A5F5" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  );
}

export function CTASection() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        py: { xs: 12, md: 18 },
        background: 'linear-gradient(135deg, #0A1A2B 0%, #0D2137 50%, #0F2A45 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <WaveBackground />

      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(47,128,237,0.08), transparent)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h2"
            sx={{
              color: '#fff',
              fontWeight: 800,
              fontSize: { xs: '1.75rem', md: '2.75rem' },
              letterSpacing: '-0.02em',
              mb: 2,
            }}
          >
            Ready to modernize your water management?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: { xs: '1rem', md: '1.125rem' },
              mb: 5,
              maxWidth: 420,
              mx: 'auto',
            }}
          >
            Join hundreds of property managers who have already transformed their water monitoring with HydroMonitor.
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}
        >
          <Button
            onClick={() => navigate('/login')}
            variant="contained"
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #2F80ED 0%, #00B4D8 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              px: 4,
              py: 1.5,
              borderRadius: 2.5,
              boxShadow: '0 8px 32px rgba(47, 128, 237, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1C5DC9 0%, #0098B8 100%)',
                boxShadow: '0 12px 40px rgba(47, 128, 237, 0.5)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.5s',
              },
              '&:hover::after': { left: '100%' },
            }}
          >
            Sign In
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{
              borderColor: 'rgba(255,255,255,0.25)',
              borderWidth: 2,
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              px: 3.5,
              py: 1.5,
              borderRadius: 2.5,
              '&:hover': {
                borderColor: '#5FA4FF',
                bgcolor: 'rgba(95, 164, 255, 0.08)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s',
            }}
          >
            Get Started
          </Button>
        </motion.div>
      </Container>
    </Box>
  );
}

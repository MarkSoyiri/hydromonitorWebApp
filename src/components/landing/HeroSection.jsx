import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import {
  WaterDrop, Opacity, Bolt, Biotech, TrendingUp, Sensors,
} from '@mui/icons-material';

function FloatingIcon({ icon: Icon, x, y, size = 40, delay = 0, duration = 6 }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        zIndex: 1,
      }}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 10, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      <Box
        sx={{
          width: size + 16,
          height: size + 16,
          borderRadius: '50%',
          background: 'rgba(95, 164, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(95, 164, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(47, 128, 237, 0.15)',
        }}
      >
        <Icon sx={{ fontSize: size, color: 'rgba(95, 164, 255, 0.7)' }} />
      </Box>
    </motion.div>
  );
}

function AnimatedWave({ index = 0 }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        zIndex: 0,
        opacity: 0.05,
      }}
      animate={{
        x: [0, -100, 0],
      }}
      transition={{
        duration: 20 + index * 5,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <svg viewBox="0 0 1440 400" preserveAspectRatio="none" style={{ width: '200%', height: '100%' }}>
        <path
          d={`M0,${200 + index * 50} C360,${150 + index * 50 + Math.sin(index) * 50} 720,${250 + index * 50} 1080,${200 + index * 50} C1260,${175 + index * 50} 1350,${220 + index * 50} 1440,${200 + index * 50} L1440,400 L0,400 Z`}
          fill={`url(#waveGradient${index})`}
        />
      </svg>
    </motion.div>
  );
}

function ParticleField() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const arr = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 4,
    }));
    setParticles(arr);
  }, []);

  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: 'rgba(95, 164, 255, 0.3)',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </Box>
  );
}

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const step = 16;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [target]);

  return <>{count}{suffix}</>;
}

export function HeroSection() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <Box
      id="home"
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0A1A2B 0%, #0D2137 40%, #0F2A45 70%, #0A1A2B 100%)',
        overflow: 'hidden',
        pt: { xs: 10, md: 0 },
      }}
    >
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="waveGradient0" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2F80ED" />
            <stop offset="100%" stopColor="#00B4D8" />
          </linearGradient>
          <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5FA4FF" />
            <stop offset="100%" stopColor="#42A5F5" />
          </linearGradient>
        </defs>
      </svg>

      <AnimatedWave index={0} />
      <AnimatedWave index={1} />
      <ParticleField />

      <FloatingIcon icon={WaterDrop} x={8} y={30} size={32} delay={0} />
      <FloatingIcon icon={Opacity} x={85} y={25} size={36} delay={1.5} />
      <FloatingIcon icon={Sensors} x={92} y={65} size={28} delay={0.8} />
      <FloatingIcon icon={Biotech} x={5} y={70} size={30} delay={2.2} />
      <FloatingIcon icon={TrendingUp} x={75} y={20} size={26} delay={1} />
      <FloatingIcon icon={Bolt} x={15} y={75} size={24} delay={3} />

      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(47,128,237,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: 'center',
            gap: { xs: 6, lg: 4 },
            py: { xs: 6, md: 8 },
          }}
        >
          <Box sx={{ flex: 1, textAlign: { xs: 'center', lg: 'left' } }}>
            <motion.div variants={itemVariants}>
              <Typography
                variant="overline"
                sx={{
                  color: '#5FA4FF',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  fontSize: '0.75rem',
                  mb: 2,
                  display: 'inline-block',
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  border: '1px solid rgba(95, 164, 255, 0.2)',
                  bgcolor: 'rgba(95, 164, 255, 0.08)',
                }}
              >
                SMART WATER MANAGEMENT PLATFORM
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.25rem', md: '4rem', lg: '4.5rem' },
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  color: '#fff',
                  mb: 2.5,
                }}
              >
                Monitor{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #5FA4FF 0%, #00B4D8 50%, #4FC3F7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Every Drop
                </Box>
                .<br />
                Save Every{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #4FC3F7 0%, #26C6DA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Cedi
                </Box>
                .
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  lineHeight: 1.7,
                  maxWidth: 560,
                  mx: { xs: 'auto', lg: 0 },
                  mb: 4,
                }}
              >
                HydroMonitor is an intelligent water management platform that helps property owners,
                administrators, and tenants monitor water consumption in real time, detect leaks
                instantly, automate billing, and reduce water waste.
              </Typography>
            </motion.div>

            <motion.div
              variants={itemVariants}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: { xs: 'center', lg: 'flex-start' } }}
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
              <Button
                variant="text"
                size="large"
                onClick={() => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })}
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 500,
                  fontSize: '1rem',
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 2.5,
                  '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' },
                }}
              >
                Learn More
              </Button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              style={{
                display: 'flex',
                gap: 40,
                marginTop: 48,
                justifyContent: { xs: 'center', lg: 'flex-start' },
              }}
            >
              {[
                { label: 'Active Users', value: 250 },
                { label: 'Buildings', value: 48 },
                { label: 'Devices Online', value: 1200 },
              ].map((stat) => (
                <Box key={stat.label}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.5rem', md: '1.75rem' },
                      background: 'linear-gradient(135deg, #5FA4FF, #00B4D8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    <AnimatedCounter target={stat.value} />+
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontWeight: 500, mt: 0.25, display: 'block' }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </motion.div>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: { xs: 'none', lg: 'flex' },
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              style={{ position: 'relative' }}
            >
              <Box
                sx={{
                  width: 420,
                  height: 420,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(47,128,237,0.15) 0%, rgba(0,180,216,0.08) 50%, transparent 70%)',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 0,
                }}
              />

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <svg width="340" height="340" viewBox="0 0 340 340">
                  <circle cx="170" cy="170" r="150" fill="none" stroke="rgba(95,164,255,0.08)" strokeWidth="1" />
                  <circle cx="170" cy="170" r="110" fill="none" stroke="rgba(95,164,255,0.06)" strokeWidth="0.5" />
                  <circle cx="170" cy="170" r="70" fill="none" stroke="rgba(95,164,255,0.04)" strokeWidth="0.5" />
                  <g>
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                      const rad = (angle * Math.PI) / 180;
                      return (
                        <motion.circle
                          key={i}
                          cx={170 + 130 * Math.cos(rad)}
                          cy={170 + 130 * Math.sin(rad)}
                          r={4 + i * 1.5}
                          fill={i % 2 === 0 ? '#5FA4FF' : '#00B4D8'}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                        />
                      );
                    })}
                  </g>
                  <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    style={{ transformOrigin: '170px 170px' }}
                  >
                    <circle cx="170" cy="50" r="12" fill="rgba(95,164,255,0.15)" />
                  </motion.g>
                  <motion.g
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    style={{ transformOrigin: '170px 170px' }}
                  >
                    <circle cx="280" cy="170" r="8" fill="rgba(0,180,216,0.15)" />
                  </motion.g>
                </svg>
              </motion.div>

              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2, textAlign: 'center' }}>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <WaterDrop sx={{ fontSize: 80, color: '#5FA4FF', opacity: 0.8 }} />
                </motion.div>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', mt: 1, fontWeight: 500, letterSpacing: '0.1em' }}>
                  IoT READY
                </Typography>
              </Box>
            </motion.div>
          </Box>
        </Box>
      </Container>

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(to top, #0A1A2B, transparent)',
          zIndex: 1,
        }}
      />
    </Box>
  );
}

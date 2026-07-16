import { useState, useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import {
  WaterDrop, Apartment, CheckCircle, Warning, ShowChart,
} from '@mui/icons-material';

function AnimatedBar({ height, delay = 0, color = '#2F80ED' }) {
  return (
    <motion.div
      initial={{ height: 0 }}
      whileInView={{ height }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      style={{
        width: '100%',
        borderRadius: '4px 4px 0 0',
        background: `linear-gradient(180deg, ${color}, rgba(47,128,237,0.3))`,
        transformOrigin: 'bottom',
      }}
    />
  );
}

function StatusDot({ active = true }) {
  return (
    <motion.div
      animate={{ scale: active ? [1, 1.3, 1] : 1 }}
      transition={{ duration: 2, repeat: active ? Infinity : 0, ease: 'easeInOut' }}
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: active ? '#4CAF50' : '#E53935',
      }}
    />
  );
}

export function DashboardPreview() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const barData = [
    { height: '60%', color: '#2F80ED', delay: 0 },
    { height: '80%', color: '#00B4D8', delay: 0.1 },
    { height: '40%', color: '#2F80ED', delay: 0.2 },
    { height: '90%', color: '#5FA4FF', delay: 0.3 },
    { height: '55%', color: '#00B4D8', delay: 0.4 },
    { height: '70%', color: '#2F80ED', delay: 0.5 },
    { height: '45%', color: '#5FA4FF', delay: 0.6 },
    { height: '85%', color: '#00B4D8', delay: 0.7 },
    { height: '50%', color: '#2F80ED', delay: 0.8 },
    { height: '75%', color: '#5FA4FF', delay: 0.9 },
    { height: '65%', color: '#00B4D8', delay: 1.0 },
    { height: '95%', color: '#2F80ED', delay: 1.1 },
  ];

  return (
    <Box
      id="pricing"
      sx={{
        py: { xs: 10, md: 16 },
        background: 'linear-gradient(180deg, #0D2137 0%, #0A1A2B 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="overline"
            sx={{
              color: '#5FA4FF',
              fontWeight: 700,
              letterSpacing: '0.12em',
              fontSize: '0.75rem',
              textAlign: 'center',
              display: 'block',
              mb: 1.5,
            }}
          >
            DASHBOARD PREVIEW
          </Typography>
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              mb: 1.5,
              letterSpacing: '-0.02em',
            }}
          >
            See it in action
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.5)',
              maxWidth: 480,
              mx: 'auto',
              mb: 6,
            }}
          >
            A sneak peek at the powerful dashboard that puts you in control.
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <Box
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.4), 0 0 60px rgba(47,128,237,0.05)',
              background: '#0A1A2B',
              '&:hover': { boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 80px rgba(47,128,237,0.08)' },
              transition: 'box-shadow 0.5s',
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <WaterDrop sx={{ fontSize: 20, color: '#5FA4FF' }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                  HydroMonitor Dashboard
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#E53935' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#FB8C00' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#4CAF50' }} />
                </Box>
              </Box>
            </Box>

            <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  {[
                    { label: 'Total Usage Today', value: '2,847 L', icon: WaterDrop, change: '+12%', up: true },
                    { label: 'Active Buildings', value: '12', icon: Apartment, change: '3 online', up: true },
                    { label: 'Devices Online', value: '47/52', icon: CheckCircle, change: '90%', up: true },
                    { label: 'Active Alerts', value: '2', icon: Warning, change: '1 critical', up: false },
                  ].map((stat) => (
                    <Box
                      key={stat.label}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <stat.icon sx={{ fontSize: 18, color: 'rgba(95,164,255,0.6)' }} />
                        <Typography variant="caption" sx={{ color: stat.up ? '#4CAF50' : '#E53935', fontWeight: 600 }}>
                          {stat.change}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem' }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    flex: 1,
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, mb: 1.5, display: 'block' }}>
                    DEVICE STATUS
                  </Typography>
                  {[
                    { name: 'Building A - Main Meter', status: 'Online', active: true },
                    { name: 'Building B - Floor 2', status: 'Online', active: true },
                    { name: 'Building C - Basement', status: 'Warning', active: false },
                    { name: 'Building D - Roof Tank', status: 'Online', active: true },
                  ].map((device) => (
                    <Box
                      key={device.name}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5, py: 1,
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <StatusDot active={device.active} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: '#fff', fontWeight: 500, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {device.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: device.active ? '#4CAF50' : '#FB8C00',
                          fontWeight: 600,
                          fontSize: '0.65rem',
                        }}
                      >
                        {device.status}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                mx: { xs: 2, md: 3 },
                mb: 3,
                p: 2.5,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, mb: 2, display: 'block' }}>
                MONTHLY CONSUMPTION (LITERS)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 120, pt: 1 }}>
                {barData.map((bar, i) => (
                  <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <AnimatedBar height={bar.height} delay={bar.delay} color={bar.color} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.55rem' }}>
                      {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ px: 3, pb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(229,57,53,0.1), rgba(239,83,80,0.05))',
                  border: '1px solid rgba(229,57,53,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flex: 1,
                }}
              >
                <Warning sx={{ color: '#E53935', fontSize: 24 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#E53935', fontWeight: 700, fontSize: '0.75rem', display: 'block' }}>
                    LEAK ALERT
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    Building C - Basement: Abnormal flow detected
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}

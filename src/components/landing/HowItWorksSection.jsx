import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Sensors, CloudQueue, Storage, Web, People,
} from '@mui/icons-material';

const STEPS = [
  { icon: Sensors, title: 'ESP32 Smart Meter', subtitle: 'IoT sensors capture flow data' },
  { icon: CloudQueue, title: 'HydroMonitor API', subtitle: 'Data processed and validated' },
  { icon: Storage, title: 'Firebase Database', subtitle: 'Securely stored in real-time' },
  { icon: Web, title: 'Web Application', subtitle: 'Visualized in rich dashboards' },
  { icon: People, title: 'Users & Tenants', subtitle: 'Actionable insights delivered' },
];

export function HowItWorksSection() {
  return (
    <Box
      id="how-it-works"
      sx={{
        py: { xs: 10, md: 16 },
        background: 'linear-gradient(180deg, #0D2137 0%, #0A1A2B 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
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
            HOW IT WORKS
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
            From sensor to insight
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.5)',
              maxWidth: 480,
              mx: 'auto',
              mb: 8,
            }}
          >
            Our streamlined architecture transforms raw water data into actionable intelligence in seconds.
          </Typography>
        </motion.div>

        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  p: 2.5,
                  borderRadius: 3,
                  width: '100%',
                  maxWidth: 480,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    background: 'rgba(95, 164, 255, 0.05)',
                    border: '1px solid rgba(95, 164, 255, 0.12)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    minWidth: 44,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(47,128,237,0.2), rgba(0,180,216,0.2))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(95,164,255,0.15)',
                  }}
                >
                  <step.icon sx={{ fontSize: 20, color: '#5FA4FF' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
                    {step.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mt: 0.25, display: 'block' }}>
                    {step.subtitle}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(95,164,255,0.4)',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                  }}
                >
                  STEP {i + 1}
                </Typography>
              </Box>
            </motion.div>
          ))}

          {STEPS.map((_, i) =>
            i < STEPS.length - 1 ? (
              <motion.div
                key={`connector-${i}`}
                initial={{ opacity: 0, scaleY: 0 }}
                whileInView={{ opacity: 1, scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 + 0.3 }}
                style={{ height: 28, width: 2, transformOrigin: 'top' }}
              >
                <Box
                  sx={{
                    width: 2,
                    height: '100%',
                    mx: 'auto',
                    background: 'linear-gradient(180deg, rgba(95,164,255,0.3), rgba(0,180,216,0.1))',
                  }}
                />
              </motion.div>
            ) : null,
          )}
        </Box>
      </Container>
    </Box>
  );
}

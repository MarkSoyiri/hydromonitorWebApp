import { Box, Container, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import {
  ShowChart, WaterDamage, Receipt, Apartment, DevicesOther, Analytics,
} from '@mui/icons-material';

const FEATURES = [
  {
    icon: ShowChart,
    title: 'Real-Time Monitoring',
    description: 'Monitor water usage live from smart IoT devices with instant data streaming and visualization.',
    gradient: 'linear-gradient(135deg, #2F80ED, #5FA4FF)',
  },
  {
    icon: WaterDamage,
    title: 'Leak Detection',
    description: 'Automatically detect abnormal water flow patterns and notify users instantly via multiple channels.',
    gradient: 'linear-gradient(135deg, #E53935, #EF5350)',
  },
  {
    icon: Receipt,
    title: 'Smart Billing',
    description: 'Generate accurate tenant water bills based on real consumption data with automated invoicing.',
    gradient: 'linear-gradient(135deg, #FB8C00, #FFB74D)',
  },
  {
    icon: Apartment,
    title: 'Multi-Building Management',
    description: 'Manage multiple properties and buildings from a single unified dashboard with ease.',
    gradient: 'linear-gradient(135deg, #4CAF50, #81C784)',
  },
  {
    icon: DevicesOther,
    title: 'Device Management',
    description: 'Monitor device health, online status, signal strength, and remote valve control capabilities.',
    gradient: 'linear-gradient(135deg, #7C4DFF, #B388FF)',
  },
  {
    icon: Analytics,
    title: 'Advanced Analytics',
    description: 'Interactive charts and reports showing historical water usage trends, forecasts, and insights.',
    gradient: 'linear-gradient(135deg, #00B4D8, #4FC3F7)',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

export function FeaturesSection() {
  return (
    <Box
      id="features"
      sx={{
        py: { xs: 10, md: 16 },
        background: 'linear-gradient(180deg, #0A1A2B 0%, #0D2137 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '-10%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(47,128,237,0.05), transparent)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '-5%',
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(0,180,216,0.05), transparent)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
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
            FEATURES
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
            Everything you need to manage water
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.5)',
              maxWidth: 520,
              mx: 'auto',
              mb: 8,
              fontSize: '1.05rem',
            }}
          >
            A complete platform with powerful tools for monitoring, detecting, billing, and analyzing water usage across your properties.
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {FEATURES.map((feature, i) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <motion.div
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <Box
                  sx={{
                    p: 3.5,
                    height: '100%',
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(12px)',
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                    '&:hover': {
                      border: '1px solid rgba(95, 164, 255, 0.15)',
                      background: 'rgba(255,255,255,0.05)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(47,128,237,0.05)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2.5,
                      background: feature.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5,
                      boxShadow: '0 8px 24px rgba(47,128,237,0.2)',
                    }}
                  >
                    <feature.icon sx={{ fontSize: 26, color: '#fff' }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      mb: 1,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.55)',
                      lineHeight: 1.7,
                      fontSize: '0.875rem',
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

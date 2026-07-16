import { Box, Container, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Business, AdminPanelSettings, Person,
} from '@mui/icons-material';

const SERVICES = [
  {
    icon: Business,
    title: 'Property Owners',
    description: 'Monitor all your properties from a single dashboard. Get real-time insights into water consumption, detect waste, and reduce operational costs across your entire portfolio.',
    gradient: 'linear-gradient(135deg, #2F80ED, #00B4D8)',
    features: ['Portfolio overview', 'Cost reduction', 'ROI tracking'],
  },
  {
    icon: AdminPanelSettings,
    title: 'Building Administrators',
    description: 'Manage tenants, devices, billing, and maintenance requests effortlessly. Automate water billing based on real usage and keep your building running efficiently.',
    gradient: 'linear-gradient(135deg, #7C4DFF, #B388FF)',
    features: ['Tenant management', 'Automated billing', 'Maintenance alerts'],
  },
  {
    icon: Person,
    title: 'Tenants',
    description: 'Track your personal water usage, view and pay bills, receive maintenance alerts, and contribute to water conservation with real-time consumption insights.',
    gradient: 'linear-gradient(135deg, #4CAF50, #81C784)',
    features: ['Usage tracking', 'Bill payments', 'Leak alerts'],
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function ServicesSection() {
  return (
    <Box
      id="about"
      sx={{
        py: { xs: 10, md: 16 },
        background: 'linear-gradient(180deg, #0A1A2B 0%, #0D2137 100%)',
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
            WHO WE SERVE
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
            Built for everyone
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.5)',
              maxWidth: 520,
              mx: 'auto',
              mb: 8,
            }}
          >
            Whether you own a single property or manage hundreds, HydroMonitor adapts to your needs.
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {SERVICES.map((service, i) => (
            <Grid item xs={12} md={4} key={service.title}>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <Box
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      border: '1px solid rgba(95, 164, 255, 0.15)',
                      background: 'rgba(255,255,255,0.04)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2.5,
                      background: service.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5,
                      boxShadow: '0 8px 24px rgba(47,128,237,0.2)',
                    }}
                  >
                    <service.icon sx={{ fontSize: 28, color: '#fff' }} />
                  </Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1.5 }}>
                    {service.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, mb: 3, flex: 1 }}>
                    {service.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {service.features.map((f) => (
                      <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: service.gradient,
                          }}
                        />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                          {f}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

import { Box, Container, Typography, Grid, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { FormatQuote } from '@mui/icons-material';

const TESTIMONIALS = [
  {
    name: 'Kwame Asante',
    role: 'Property Owner',
    company: 'Asante Real Estate Group',
    avatar: 'KA',
    text: 'HydroMonitor transformed how we manage water across our 8 properties. We have reduced water waste by 35% and our tenants love the transparent billing. The leak detection alone has saved us thousands in potential damage.',
  },
  {
    name: 'Ama Osei',
    role: 'Building Administrator',
    company: 'Lagon City Mall',
    avatar: 'AO',
    text: 'Managing water for a large commercial building was always a challenge until we found HydroMonitor. The real-time dashboard gives me complete visibility, and automated billing has saved our admin team countless hours.',
  },
  {
    name: 'Ekow Mensah',
    role: 'Tenant',
    company: 'Marina Heights Apartments',
    avatar: 'EM',
    text: 'As a tenant, I love being able to track my water usage and bills from my phone. The app is intuitive, and the instant leak alerts give me peace of mind knowing any issues will be caught early.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: 'easeOut' },
  }),
};

export function TestimonialsSection() {
  return (
    <Box
      id="contact"
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
            TESTIMONIALS
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
            What our users say
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
            Hear from property owners, administrators, and tenants who use HydroMonitor every day.
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {TESTIMONIALS.map((t, i) => (
            <Grid item xs={12} md={4} key={t.name}>
              <motion.div
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Box
                  sx={{
                    p: 3.5,
                    height: '100%',
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s',
                    '&:hover': {
                      border: '1px solid rgba(95, 164, 255, 0.12)',
                      background: 'rgba(255,255,255,0.04)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  <FormatQuote sx={{ fontSize: 28, color: 'rgba(95,164,255,0.3)', mb: 1.5 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.65)',
                      lineHeight: 1.8,
                      fontSize: '0.875rem',
                      flex: 1,
                      mb: 3,
                      fontStyle: 'italic',
                    }}
                  >
                    "{t.text}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        background: 'linear-gradient(135deg, #2F80ED, #00B4D8)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      {t.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600, display: 'block', fontSize: '0.8rem' }}>
                        {t.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                        {t.role}, {t.company}
                      </Typography>
                    </Box>
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

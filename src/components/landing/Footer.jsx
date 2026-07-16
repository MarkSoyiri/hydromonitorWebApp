import { Box, Container, Typography, Grid, IconButton, Button } from '@mui/material';
import { motion } from 'framer-motion';
import {
  WaterDrop, Twitter, GitHub, LinkedIn, Mail,
} from '@mui/icons-material';

const FOOTER_LINKS = {
  Product: ['Features', 'Pricing', 'How It Works', 'Integrations'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Support: ['Help Center', 'Documentation', 'API Status', 'Community'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
};

export function Footer() {
  const scrollToSection = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      sx={{
        background: '#060F1A',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        pt: { xs: 6, md: 10 },
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 6 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WaterDrop sx={{ fontSize: 28, color: '#5FA4FF' }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #5FA4FF 0%, #00B4D8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                HydroMonitor
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.35)',
                lineHeight: 1.7,
                mb: 3,
                maxWidth: 300,
              }}
            >
              Smart water monitoring and management platform for modern buildings. Monitor every drop, save every cedi.
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[
                { icon: Twitter, label: 'Twitter' },
                { icon: GitHub, label: 'GitHub' },
                { icon: LinkedIn, label: 'LinkedIn' },
                { icon: Mail, label: 'Email' },
              ].map(({ icon: Icon, label }) => (
                <IconButton
                  key={label}
                  size="small"
                  sx={{
                    color: 'rgba(255,255,255,0.3)',
                    '&:hover': { color: '#5FA4FF', bgcolor: 'rgba(95,164,255,0.1)' },
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <Grid item xs={6} md={2} key={category}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 2, display: 'block' }}>
                {category}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {links.map((link) => (
                  <Button
                    key={link}
                    onClick={() => scrollToSection('#home')}
                    sx={{
                      color: 'rgba(255,255,255,0.35)',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      px: 0,
                      py: 0.25,
                      minWidth: 0,
                      '&:hover': { color: '#5FA4FF', bgcolor: 'transparent' },
                      textTransform: 'none',
                    }}
                  >
                    {link}
                  </Button>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: { xs: 6, md: 8 },
            pt: 3,
            borderTop: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} HydroMonitor. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
            Built with precision for smart water management
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

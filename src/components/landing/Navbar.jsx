import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Button, Container, IconButton, Drawer, List, ListItem,
  ListItemButton, ListItemText, Typography, Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, WaterDrop } from '@mui/icons-material';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: scrolled ? 'rgba(10, 26, 43, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ height: 72, minHeight: '72px !important' }}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <WaterDrop sx={{ fontSize: 32, color: '#5FA4FF' }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #5FA4FF 0%, #00B4D8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px',
                }}
              >
                HydroMonitor
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }} />

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Button
                    onClick={() => handleNavClick(link.href)}
                    sx={{
                      color: scrolled ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.85)',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'rgba(95, 164, 255, 0.1)',
                        color: '#fff',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    {link.label}
                  </Button>
                </motion.div>
              ))}
            </Box>

            <Box sx={{ flex: { xs: 1, md: 0 } }} />

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <Button
                  onClick={() => navigate('/login')}
                  variant="text"
                  sx={{
                    color: '#fff',
                    fontWeight: 600,
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Sign In
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #2F80ED 0%, #00B4D8 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: '0 4px 15px rgba(47, 128, 237, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1C5DC9 0%, #0098B8 100%)',
                      boxShadow: '0 6px 20px rgba(47, 128, 237, 0.4)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  Get Started
                </Button>
              </motion.div>
            </Box>

            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: 'none' }, color: '#fff' }}
            >
              <Menu />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: '#0A1A2B',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
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
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
        <List sx={{ pt: 1 }}>
          {NAV_LINKS.map((link) => (
            <ListItem key={link.label} disablePadding>
              <ListItemButton onClick={() => handleNavClick(link.href)} sx={{ borderRadius: 2, mx: 1, my: 0.25 }}>
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.8)', fontWeight: 500 } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mt: 'auto' }} />
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            onClick={() => { setMobileOpen(false); navigate('/login'); }}
            variant="outlined"
            sx={{
              borderColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              borderRadius: 2,
              '&:hover': { borderColor: '#5FA4FF', bgcolor: 'rgba(95,164,255,0.08)' },
            }}
          >
            Sign In
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #2F80ED 0%, #00B4D8 100%)',
              color: '#fff',
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Get Started
          </Button>
        </Box>
      </Drawer>
    </>
  );
}

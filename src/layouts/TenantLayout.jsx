import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, IconButton, Avatar, Menu, MenuItem, ListItemIcon as LI,
  Divider, Tooltip, Badge, AppBar, Toolbar, useMediaQuery, useTheme,
  BottomNavigation, BottomNavigationAction, Paper,
} from '@mui/material';
import {
  Dashboard as DashIcon,
  WaterDrop, Receipt, Payment, Description,
  NotificationsActive, Support, Person, Logout,
  DarkModeOutlined, LightModeOutlined, Menu as MenuIcon,
  Close, ChevronRight,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeMode } from '@/contexts/ThemeContext';
import { ROLE_LABELS, ROLE_COLORS } from '@/constants/roles';
import { Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const tenantNavItems = [
  { label: 'Dashboard', path: '/app/dashboard', icon: <DashIcon /> },
  { label: 'Usage', path: '/app/usage', icon: <WaterDrop /> },
  { label: 'Bills', path: '/app/bills', icon: <Receipt /> },
  { label: 'Payments', path: '/app/payments', icon: <Payment /> },
  { label: 'Invoices', path: '/app/invoices', icon: <Description /> },
  { label: 'Alerts', path: '/app/alerts', icon: <NotificationsActive /> },
  { label: 'Support', path: '/app/support', icon: <Support /> },
];

const SIDEBAR_WIDTH = 270;

function TenantSidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { isDark } = useThemeMode();

  const isActive = (path) => {
    if (path === '/app/dashboard') return location.pathname === '/app/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          background: isDark
            ? 'linear-gradient(180deg, rgba(13,27,42,0.85) 0%, rgba(27,40,56,0.85) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.85) 100%)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          borderRight: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box onClick={() => navigate('/app/dashboard')} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2,
            background: 'linear-gradient(135deg, #2F80ED 0%, #00B4D8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <WaterDrop sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.2 }}>
              HydroMonitor
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Water Intelligence
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.5 }} />

      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 1, fontWeight: 600, letterSpacing: 1 }}>
          MENU
        </Typography>
      </Box>

      <List sx={{ px: 1.5, flex: 1 }}>
        {tenantNavItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => { navigate(item.path); onClose(); }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: 1.2,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(47,128,237,0.9), rgba(0,180,216,0.9))',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 16px rgba(47,128,237,0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(47,128,237,0.95), rgba(0,180,216,0.95))',
                  },
                },
              }}
            >
              <ListItemIcon sx={{
                minWidth: 40,
                color: active ? '#fff' : 'text.secondary',
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.9rem',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#fff' : 'text.primary',
                  },
                }}
              />
              {active && <ChevronRight sx={{ color: '#fff', fontSize: 18 }} />}
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ p: 2, mx: 1.5, mb: 2, borderRadius: 2, background: isDark ? 'rgba(47,128,237,0.1)' : 'rgba(47,128,237,0.06)' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {profile?.email}
        </Typography>
        <Typography variant="caption" display="block" color="primary.main" sx={{ fontWeight: 600, mt: 0.3 }}>
          {profile?.fullName || 'Tenant'}
        </Typography>
        {profile?.role && (
          <Chip
            label={ROLE_LABELS[profile.role] || profile.role}
            size="small"
            color={ROLE_COLORS[profile.role] || 'default'}
            sx={{ mt: 0.5, height: 20, '& .MuiChip-label': { fontSize: '0.65rem' } }}
          />
        )}
      </Box>
    </Drawer>
  );
}

function TenantBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useThemeMode();

  const bottomNavItems = [
    { label: 'Home', path: '/app/dashboard', icon: <DashIcon /> },
    { label: 'Usage', path: '/app/usage', icon: <WaterDrop /> },
    { label: 'Bills', path: '/app/bills', icon: <Receipt /> },
    { label: 'Alerts', path: '/app/alerts', icon: <NotificationsActive /> },
    { label: 'Profile', path: '/app/profile', icon: <Person /> },
  ];

  const currentValue = bottomNavItems.findIndex(
    (item) => item.path === location.pathname || location.pathname.startsWith(item.path.replace('/app/', '/app/'))
  );

  const getValue = () => {
    const idx = bottomNavItems.findIndex((item) => {
      if (item.path === '/app/dashboard') return location.pathname === '/app/dashboard';
      return location.pathname.startsWith(item.path);
    });
    return idx >= 0 ? idx : 0;
  };

  return (
    <Paper sx={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100, borderRadius: 0,
      background: isDark ? 'rgba(7,15,26,0.75)' : 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(24px) saturate(200%)',
      WebkitBackdropFilter: 'blur(24px) saturate(200%)',
      borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)',
      boxShadow: '0 -2px 16px rgba(0,0,0,0.04)',
    }} elevation={0}>
      <BottomNavigation
        value={getValue()}
        onChange={(_, newValue) => navigate(bottomNavItems[newValue].path)}
        sx={{ height: 64 }}
      >
        {bottomNavItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
            sx={{
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.65rem',
                fontWeight: 500,
              },
              '&.Mui-selected': {
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.7rem',
                  fontWeight: 700,
                },
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

function TenantTopbar({ onMenuOpen }) {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const { toggleTheme, isDark } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login');
  };

  const initials = profile?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{
      borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)',
      background: isDark ? 'rgba(13,27,42,0.72)' : 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(32px) saturate(200%)',
      WebkitBackdropFilter: 'blur(32px) saturate(200%)',
    }}>
      <Toolbar sx={{ minHeight: 64, px: { xs: 1.5, sm: 3 } }}>
        <IconButton edge="start" onClick={onMenuOpen} sx={{ mr: 1, display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>

        <Box onClick={() => navigate('/app/dashboard')} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: 1.5,
            background: 'linear-gradient(135deg, #2F80ED 0%, #00B4D8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <WaterDrop sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
            HydroMonitor
          </Typography>
        </Box>

        <Typography variant="subtitle2" sx={{ flex: 1, textAlign: 'center', fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem', display: { xs: 'block', md: 'none' } }}>
          {profile?.fullName?.split(' ')[0] || 'Home'}
        </Typography>

        <Box sx={{ flex: { md: 1 }, display: { xs: 'none', md: 'block' } }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggleTheme} size="small">
              {isDark ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Profile">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ ml: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                {initials || <Person />}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: {
            minWidth: 200, mt: 1, borderRadius: 3,
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
            background: isDark ? 'rgba(17,25,33,0.85)' : 'rgba(255,255,255,0.85)',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.6)',
            boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.3)' : '0 16px 48px rgba(0,0,0,0.08)',
          } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>{profile?.fullName || 'User'}</Typography>
            {profile?.role && (
              <Chip label={ROLE_LABELS[profile.role] || profile.role} size="small"
                color={ROLE_COLORS[profile.role] || 'default'}
                sx={{ mt: 0.3, height: 20, '& .MuiChip-label': { fontSize: '0.65rem' } }} />
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>{profile?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/app/profile'); }}>
            <LI><Person fontSize="small" /></LI>
            Profile
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <LI><Logout fontSize="small" /></LI>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export function TenantLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', pb: isMobile ? 7 : 0 }}>
      <TenantSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TenantTopbar onMenuOpen={() => setSidebarOpen(true)} />

        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: 1200,
            width: '100%',
            mx: 'auto',
          }}
        >
          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Outlet />
          </motion.main>
        </Box>
      </Box>

      {isMobile && <TenantBottomNav />}
    </Box>
  );
}

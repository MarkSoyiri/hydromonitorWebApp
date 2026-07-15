import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, IconButton, Avatar, Menu, MenuItem, ListItemIcon as LI,
  Divider, Tooltip, Badge, AppBar, Toolbar, useMediaQuery, useTheme,
  Collapse, Chip,
} from '@mui/material';
import {
  Dashboard as DashIcon,
  Business, AdminPanelSettings, People,
  Analytics, Assessment, Settings, ListAlt,
  Person, Logout, DarkModeOutlined, LightModeOutlined,
  Menu as MenuIcon, ChevronLeft, WaterDrop,
  ExpandLess, ExpandMore, Security,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeMode } from '@/contexts/ThemeContext';
import { ROLE_LABELS, ROLE_COLORS } from '@/constants/roles';
import { motion } from 'framer-motion';

const SIDEBAR_WIDTH = 270;

const superAdminNavGroups = [
  {
    label: 'Management',
    items: [
      { label: 'Dashboard', path: '/super-admin/dashboard', icon: <DashIcon /> },
      { label: 'Buildings', path: '/super-admin/buildings', icon: <Business /> },
      { label: 'Admins', path: '/super-admin/admins', icon: <AdminPanelSettings /> },
      { label: 'Tenants', path: '/super-admin/tenants', icon: <People /> },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Analytics', path: '/super-admin/analytics', icon: <Analytics /> },
      { label: 'Reports', path: '/super-admin/reports', icon: <Assessment /> },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', path: '/super-admin/settings', icon: <Settings /> },
      { label: 'Logs', path: '/super-admin/logs', icon: <ListAlt /> },
    ],
  },
];

function SuperAdminSidebar({ open, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { isDark } = useThemeMode();

  const isActive = (path) => {
    if (path === '/super-admin/dashboard') return location.pathname === '/super-admin/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? SIDEBAR_WIDTH : 72,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        '& .MuiDrawer-paper': {
          width: open ? SIDEBAR_WIDTH : 72,
          transition: 'width 0.25s ease',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: isDark ? '#070F1A' : '#0F1923',
          borderRight: '1px solid rgba(255,255,255,0.04)',
        },
      }}
    >
      <Box sx={{
        display: 'flex', alignItems: 'center',
        p: open ? 2.5 : 1.5, minHeight: 72,
        justifyContent: open ? 'space-between' : 'center',
      }}>
        {open && (
          <Box onClick={() => navigate('/super-admin/dashboard')} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: 1.5,
              background: 'linear-gradient(135deg, #2F80ED 0%, #00B4D8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(47,128,237,0.3)',
            }}>
              <WaterDrop sx={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#fff', lineHeight: 1.2 }}>
                HydroMonitor
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.6rem', letterSpacing: 1 }}>
                ENTERPRISE
              </Typography>
            </Box>
          </Box>
        )}
        <IconButton onClick={onToggle} size="small" sx={{ color: 'rgba(255,255,255,0.4)' }}>
          {open ? <ChevronLeft fontSize="small" /> : <MenuIcon fontSize="small" />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {superAdminNavGroups.map((group) => (
          <Box key={group.label}>
            {open && (
              <Typography variant="caption" sx={{
                px: 3, py: 1, display: 'block',
                color: 'rgba(255,255,255,0.25)',
                fontSize: '0.6rem', fontWeight: 600, letterSpacing: 1.5,
              }}>
                {group.label}
              </Typography>
            )}
            <List sx={{ px: open ? 1.5 : 0.5 }}>
              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <ListItemButton
                    key={item.path}
                    selected={active}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.2,
                      minHeight: 42,
                      justifyContent: open ? 'initial' : 'center',
                      px: open ? 1.5 : 0.5,
                      mx: open ? 0 : 0.5,
                      '&.Mui-selected': {
                        bgcolor: 'rgba(47,128,237,0.15)',
                        '&:hover': { bgcolor: 'rgba(47,128,237,0.2)' },
                      },
                    }}
                  >
                    <ListItemIcon sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: active ? '#5FA4FF' : 'rgba(255,255,255,0.4)',
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        primary={item.label}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontSize: '0.85rem',
                            fontWeight: active ? 600 : 400,
                            color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

      <List sx={{ py: 1, px: open ? 1.5 : 0.5 }}>
        <ListItemButton
          selected={location.pathname === '/super-admin/profile'}
          onClick={() => navigate('/super-admin/profile')}
          sx={{
            borderRadius: 1.5,
            minHeight: 42,
            justifyContent: open ? 'initial' : 'center',
            px: open ? 1.5 : 0.5,
            mx: open ? 0 : 0.5,
          }}
        >
          <ListItemIcon sx={{
            minWidth: 0, mr: open ? 2 : 'auto', justifyContent: 'center',
            color: 'rgba(255,255,255,0.4)',
          }}>
            <Person />
          </ListItemIcon>
          {open && (
            <ListItemText primary="Profile" sx={{
              '& .MuiListItemText-primary': { fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' },
            }} />
          )}
        </ListItemButton>
      </List>

      {open && profile && (
        <Box sx={{
          p: 2, mx: 1.5, mb: 2, borderRadius: 1.5,
          background: 'linear-gradient(135deg, rgba(47,128,237,0.12), rgba(0,180,216,0.08))',
          border: '1px solid rgba(47,128,237,0.15)',
        }}>
          <Chip
            label={ROLE_LABELS[profile?.role] || 'Super Admin'}
            size="small"
            color={ROLE_COLORS[profile?.role] || 'error'}
            sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.65rem' }, mb: 0.3 }}
          />
          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, mt: 0.3 }}>
            {profile?.fullName || 'Administrator'}
          </Typography>
        </Box>
      )}
    </Drawer>
  );
}

function SuperAdminTopbar() {
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
      borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.06)',
      background: isDark ? 'rgba(7,15,26,0.9)' : 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(20px)',
    }}>
      <Toolbar sx={{ minHeight: 64 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
          System Overview
        </Typography>
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
          PaperProps={{ sx: { minWidth: 200, mt: 1, borderRadius: 2 } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>{profile?.fullName || 'Admin'}</Typography>
            {profile?.role && (
              <Chip label={ROLE_LABELS[profile.role] || profile.role} size="small"
                color={ROLE_COLORS[profile.role] || 'error'}
                sx={{ mt: 0.3, height: 20, '& .MuiChip-label': { fontSize: '0.65rem' } }} />
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>{profile?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/super-admin/profile'); }}>
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

export function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const effectiveOpen = isMobile ? false : sidebarOpen;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <SuperAdminSidebar
        open={effectiveOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: `calc(100% - ${effectiveOpen ? SIDEBAR_WIDTH : 72}px)`,
        transition: 'width 0.25s ease',
      }}>
        <SuperAdminTopbar />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            overflow: 'auto',
            bgcolor: 'background.default',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}

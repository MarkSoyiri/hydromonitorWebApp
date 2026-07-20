import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, IconButton, Avatar, Menu, MenuItem, ListItemIcon as LI,
  Divider, Tooltip, Badge, AppBar, Toolbar, useMediaQuery, useTheme, Chip,
} from '@mui/material';
import {
  Dashboard as DashIcon,
  MeetingRoom, DevicesOther, People,
  Receipt, Assessment, NotificationsActive, Person,
  Logout, DarkModeOutlined, LightModeOutlined, Menu as MenuIcon,
  ChevronLeft, WaterDrop, Business,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeMode } from '@/contexts/ThemeContext';
import { ROLE_LABELS, ROLE_COLORS } from '@/constants/roles';
import { motion } from 'framer-motion';

const adminNavItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <DashIcon /> },
  { label: 'Rooms', path: '/admin/rooms', icon: <MeetingRoom /> },
  { label: 'Devices', path: '/admin/devices', icon: <DevicesOther /> },
  { label: 'Tenants', path: '/admin/tenants', icon: <People /> },
  { label: 'Billing', path: '/admin/billing', icon: <Receipt /> },
  { label: 'Reports', path: '/admin/reports', icon: <Assessment /> },
  { label: 'Alerts', path: '/admin/alerts', icon: <NotificationsActive /> },
];

const SIDEBAR_WIDTH = 260;

function AdminSidebar({ open, onClose, onToggle, isMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { isDark } = useThemeMode();

  const isActive = (path) => {
    if (path === '/admin/dashboard') return location.pathname === '/admin/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleNav = (path) => {
    navigate(path);
    if (isMobile && onClose) onClose();
  };

  const renderNavItems = (expanded) => adminNavItems.map((item) => {
    const active = isActive(item.path);
    return (
      <ListItemButton
        key={item.path}
        selected={active}
        onClick={() => handleNav(item.path)}
        sx={{
          borderRadius: 1.5,
          mb: 0.3,
          minHeight: 44,
          justifyContent: expanded ? 'initial' : 'center',
          px: expanded ? 1.5 : 0.5,
          mx: expanded ? 0 : 0.5,
          transition: 'all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&.Mui-selected': {
            bgcolor: 'rgba(95,164,255,0.12)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(95,164,255,0.08)',
            '&:hover': { bgcolor: 'rgba(95,164,255,0.18)' },
          },
        }}
      >
        <ListItemIcon sx={{
          minWidth: 0,
          mr: expanded ? 2 : 'auto',
          justifyContent: 'center',
          color: active ? '#5FA4FF' : 'rgba(255,255,255,0.5)',
        }}>
          {item.icon}
        </ListItemIcon>
        {expanded && (
          <ListItemText
            primary={item.label}
            sx={{
              '& .MuiListItemText-primary': {
                fontSize: '0.85rem',
                fontWeight: active ? 600 : 400,
                color: active ? '#fff' : 'rgba(255,255,255,0.7)',
              },
            }}
          />
        )}
      </ListItemButton>
    );
  });

  const renderProfileItem = (expanded) => (
    <ListItemButton
      selected={location.pathname === '/admin/profile'}
      onClick={() => handleNav('/admin/profile')}
      sx={{
        borderRadius: 1.5,
        minHeight: 44,
        justifyContent: expanded ? 'initial' : 'center',
        px: expanded ? 1.5 : 0.5,
        mx: expanded ? 0 : 0.5,
      }}
    >
      <ListItemIcon sx={{
        minWidth: 0, mr: expanded ? 2 : 'auto', justifyContent: 'center',
        color: 'rgba(255,255,255,0.5)',
      }}>
        <Person />
      </ListItemIcon>
      {expanded && (
        <ListItemText primary="Profile" sx={{
          '& .MuiListItemText-primary': { fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' },
        }} />
      )}
    </ListItemButton>
  );

  const renderHeader = (expanded, showToggle, onToggle) => (
    <Box sx={{
      display: 'flex', alignItems: 'center',
      p: expanded ? 2.5 : 1.5, minHeight: 72,
      justifyContent: expanded ? 'space-between' : 'center',
    }}>
      {expanded ? (
        <Box onClick={() => handleNav('/admin/dashboard')} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 1.5,
            background: 'linear-gradient(135deg, #2F80ED 0%, #00B4D8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <WaterDrop sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', lineHeight: 1.2 }}>
              HydroMonitor
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem' }}>
              Admin Panel
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box onClick={() => handleNav('/admin/dashboard')} sx={{ cursor: 'pointer' }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 1.5,
            background: 'linear-gradient(135deg, #2F80ED 0%, #00B4D8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <WaterDrop sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
        </Box>
      )}
      {showToggle && (
        <IconButton onClick={onToggle} size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          {expanded ? <ChevronLeft fontSize="small" /> : <MenuIcon fontSize="small" />}
        </IconButton>
      )}
    </Box>
  );

  const sidebarBody = (expanded, showToggle, onToggle) => (
    <>
      {renderHeader(expanded, showToggle, onToggle)}
      <Divider sx={{ mx: 2, borderColor: 'rgba(255,255,255,0.06)' }} />
      <List sx={{ flex: 1, py: 1.5, px: expanded ? 1.5 : 0.5 }}>
        {renderNavItems(expanded)}
      </List>
      <Divider sx={{ mx: 2, borderColor: 'rgba(255,255,255,0.06)' }} />
      <List sx={{ py: 1.5, px: expanded ? 1.5 : 0.5 }}>
        {renderProfileItem(expanded)}
      </List>
      {expanded && profile && (
        <Box sx={{
          p: 2, mx: 1.5, mb: 2, borderRadius: 1.5,
          background: 'rgba(95,164,255,0.08)',
          border: '1px solid rgba(95,164,255,0.1)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          <Chip
            label={ROLE_LABELS[profile?.role] || 'Admin'}
            size="small"
            color={ROLE_COLORS[profile?.role] || 'primary'}
            sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.65rem' }, mb: 0.3 }}
          />
          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, mt: 0.3 }}>
            {profile?.fullName || 'Admin'}
          </Typography>
          {profile?.role === 'ADMIN' && profile?.buildingIds && Object.keys(profile.buildingIds).length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <Business sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem' }}>
                {Object.keys(profile.buildingIds).length} building{Object.keys(profile.buildingIds).length > 1 ? 's' : ''} assigned
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH * 0.85,
            background: isDark ? 'rgba(13,27,42,0.85)' : 'rgba(26,32,44,0.85)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
            borderRight: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.1)',
          },
        }}
      >
        {sidebarBody(true, false, null)}
      </Drawer>
    );
  }

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
          background: isDark ? 'rgba(13,27,42,0.85)' : 'rgba(26,32,44,0.85)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
          borderRight: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.1)',
        },
      }}
    >
      {sidebarBody(open, true, onToggle)}
    </Drawer>
  );
}

function AdminTopbar({ onMenuToggle, sidebarOpen }) {
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
      borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)',
      background: isDark ? 'rgba(13,27,42,0.72)' : 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(32px) saturate(200%)',
      WebkitBackdropFilter: 'blur(32px) saturate(200%)',
    }}>
      <Toolbar sx={{ minHeight: 64 }}>
        <Box sx={{ mr: 1 }}>
          <IconButton onClick={onMenuToggle} size="small">
            {sidebarOpen ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
          Welcome back, {profile?.fullName?.split(' ')[0] || 'Admin'}
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
            <Typography variant="subtitle2" fontWeight={700}>{profile?.fullName || 'Admin'}</Typography>
            {profile?.role && (
              <Chip label={ROLE_LABELS[profile.role] || profile.role} size="small"
                color={ROLE_COLORS[profile.role] || 'primary'}
                sx={{ mt: 0.3, height: 20, '& .MuiChip-label': { fontSize: '0.65rem' } }} />
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>{profile?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/admin/profile'); }}>
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

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const effectiveOpen = isMobile ? false : sidebarOpen;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar
        open={isMobile ? sidebarOpen : effectiveOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        isMobile={isMobile}
      />
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: isMobile ? '100%' : `calc(100% - ${effectiveOpen ? 260 : 72}px)`,
        transition: 'width 0.25s ease',
        minWidth: 0,
      }}>
        <AdminTopbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
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
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Outlet />
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}

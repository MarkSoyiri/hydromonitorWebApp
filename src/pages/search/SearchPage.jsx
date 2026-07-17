import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, InputAdornment, List, ListItemButton,
  ListItemIcon, ListItemText, Chip, Divider, Skeleton,
} from '@mui/material';
import { Search, Business, MeetingRoom, DevicesOther, People, Warning } from '@mui/icons-material';
import { PageHeader, EmptyState } from '@/components/common';
import { buildingService, roomService, deviceService, tenantService, alertService } from '@/services';
import { motion } from 'framer-motion';
import { extractList } from '@/utils/response';

export function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchData, setSearchData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    try {
      const [buildingsRes, roomsRes, devicesRes, tenantsRes, alertsRes] = await Promise.allSettled([
        buildingService.getAll(),
        roomService.getAll(),
        deviceService.getAll(),
        tenantService.getAll(),
        alertService.getAll(),
      ]);

      const items = [];

      if (buildingsRes.status === 'fulfilled' && buildingsRes.value.data?.success) {
        extractList(buildingsRes.value.data.data).forEach((b) => {
          items.push({
            type: 'Building',
            label: b.name || 'Building',
            path: `/super-admin/buildings/${b.buildingId}`,
            icon: <Business color="primary" />,
          });
        });
      }

      if (roomsRes.status === 'fulfilled' && roomsRes.value.data?.success) {
        extractList(roomsRes.value.data.data).forEach((r) => {
          items.push({
            type: 'Room',
            label: `Room ${r.roomNumber || r.roomId}`,
            path: `/super-admin/rooms/${r.roomId}`,
            icon: <MeetingRoom color="info" />,
          });
        });
      }

      if (devicesRes.status === 'fulfilled' && devicesRes.value.data?.success) {
        extractList(devicesRes.value.data.data).forEach((d) => {
          items.push({
            type: 'Device',
            label: d.deviceName || d.serialNumber || 'Device',
            path: `/super-admin/devices/${d.deviceId}`,
            icon: <DevicesOther color="success" />,
          });
        });
      }

      if (tenantsRes.status === 'fulfilled' && tenantsRes.value.data?.success) {
        extractList(tenantsRes.value.data.data).forEach((t) => {
          items.push({
            type: 'Tenant',
            label: t.fullName || t.name || 'Tenant',
            path: `/super-admin/tenants/${t.tenantId || t.uid || t.id}`,
            icon: <People color="warning" />,
          });
        });
      }

      if (alertsRes.status === 'fulfilled' && alertsRes.value.data?.success) {
        extractList(alertsRes.value.data.data).forEach((a) => {
          items.push({
            type: 'Alert',
            label: a.message || `Alert ${a.alertId || ''}`,
            path: '/super-admin/logs',
            icon: <Warning color="error" />,
          });
        });
      }

      setSearchData(items);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const filtered = query
    ? searchData.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.type.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <PageHeader title="Search" subtitle="Search buildings, rooms, devices, tenants, and more" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><Search /></InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: '1.1rem' } }}
            />
          </CardContent>
        </Card>
      </motion.div>

      {loading && (
        <Card>
          <CardContent>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="text" width="100%" height={48} sx={{ my: 0.5 }} />
            ))}
          </CardContent>
        </Card>
      )}

      {!loading && query && filtered.length === 0 && (
        <EmptyState title="No results found" description={`No results match "${query}"`} />
      )}

      {!loading && filtered.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}>
          <Card>
            <List disablePadding>
              {filtered.map((item, i) => (
                <Box key={i}>
                  <ListItemButton onClick={() => navigate(item.path)}>
                    <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.type}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                    <Chip label={item.type} size="small" variant="outlined" />
                  </ListItemButton>
                  {i < filtered.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>
          </Card>
        </motion.div>
      )}
    </Box>
  );
}

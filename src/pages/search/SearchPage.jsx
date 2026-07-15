import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, InputAdornment, List, ListItemButton,
  ListItemIcon, ListItemText, Chip, Divider,
} from '@mui/material';
import { Search, Business, MeetingRoom, DevicesOther, People, Warning } from '@mui/icons-material';
import { PageHeader, EmptyState } from '@/components/common';

const searchData = [
  { type: 'Building', label: 'Building A', path: '/buildings/bld1', icon: <Business color="primary" /> },
  { type: 'Building', label: 'Building B', path: '/buildings/bld2', icon: <Business color="primary" /> },
  { type: 'Room', label: 'Room 101', path: '/rooms/rm1', icon: <MeetingRoom color="info" /> },
  { type: 'Room', label: 'Room 204', path: '/rooms/rm2', icon: <MeetingRoom color="info" /> },
  { type: 'Device', label: 'WM-001', path: '/devices/dev1', icon: <DevicesOther color="success" /> },
  { type: 'Device', label: 'WM-002', path: '/devices/dev2', icon: <DevicesOther color="success" /> },
  { type: 'Tenant', label: 'Mark Soyiri', path: '/tenants/tnt1', icon: <People color="warning" /> },
  { type: 'Tenant', label: 'Theresa Bangniyel', path: '/tenants/tnt2', icon: <People color="warning" /> },
  { type: 'Alert', label: 'Leak detected - Room 105', path: '/alerts', icon: <Warning color="error" /> },
];

export function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filtered = query
    ? searchData.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.type.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <Box>
      <PageHeader title="Search" subtitle="Search buildings, rooms, devices, tenants, and more" />

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

      {query && filtered.length === 0 && (
        <EmptyState title="No results found" description={`No results match "${query}"`} />
      )}

      {filtered.length > 0 && (
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
      )}
    </Box>
  );
}

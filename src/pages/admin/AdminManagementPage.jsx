import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Stack, Avatar, List, ListItem,
  ListItemAvatar, ListItemText, Chip, Divider,
} from '@mui/material';
import { Add, AdminPanelSettings, Shield } from '@mui/icons-material';
import { PageHeader, StatCard, StatusChip } from '@/components/common';

const admins = [
  { id: 'adm1', name: 'Mark Soyiri', email: 'marksoyiri001@gmail.com', role: 'SUPER_ADMIN', status: 'ACTIVE' },
  { id: 'adm2', name: 'Admin User', email: 'admin@hydromonitor.com', role: 'ADMIN', status: 'ACTIVE' },
];

export function AdminManagementPage() {
  return (
    <Box>
      <PageHeader title="Admin Management" subtitle="Manage system administrators" action actionLabel="Add Admin" onAction={() => {}} />

      <Box sx={{ mb: 3 }}>
        <StatCard title="Total Admins" value={admins.length} icon={<AdminPanelSettings />} color="primary" />
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Administrators</Typography>
          <List disablePadding>
            {admins.map((admin, i) => (
              <Box key={admin.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: admin.role === 'SUPER_ADMIN' ? 'error.main' : 'primary.main' }}>
                      <Shield />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="subtitle2">{admin.name}</Typography>}
                    secondary={admin.email}
                  />
                  <Stack direction="row" spacing={1}>
                    <Chip label={admin.role} size="small"
                      color={admin.role === 'SUPER_ADMIN' ? 'error' : 'primary'} variant="outlined" />
                    <StatusChip status={admin.status} />
                  </Stack>
                </ListItem>
                {i < admins.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}

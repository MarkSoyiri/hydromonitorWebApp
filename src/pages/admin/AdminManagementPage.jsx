import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Stack, Avatar, List, ListItem,
  ListItemAvatar, ListItemText, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import { Add, AdminPanelSettings, Shield } from '@mui/icons-material';
import { PageHeader, StatCard, StatusChip } from '@/components/common';
import { apiGet, apiPost } from '@/services/api';
import { ENDPOINTS } from '@/constants';
import { extractList } from '@/utils/response';
import toast from 'react-hot-toast';

export function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', role: 'ADMIN' });

  const fetchAdmins = useCallback(async () => {
    try {
      const { data } = await apiGet(ENDPOINTS.USERS);
      if (data?.success) {
        setAdmins(extractList(data.data));
      }
    } catch {
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const openCreate = () => {
    setForm({ fullName: '', email: '', role: 'ADMIN' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      await apiPost(ENDPOINTS.USERS, form);
      toast.success('Admin created');
      setDialogOpen(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err?.message || 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Admin Management" subtitle="Manage system administrators" action actionLabel="Add Admin" onAction={openCreate} />

      <Box sx={{ mb: 3 }}>
        <StatCard title="Total Admins" value={admins.length} icon={<AdminPanelSettings />} color="primary" loading={loading} />
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Administrators</Typography>
          <List disablePadding>
            {admins.map((admin, i) => (
              <Box key={admin.uid || admin.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: admin.role === 'SUPER_ADMIN' ? 'error.main' : 'primary.main' }}>
                      <Shield />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="subtitle2">{admin.fullName || admin.name}</Typography>}
                    secondary={admin.email}
                  />
                  <Stack direction="row" spacing={1}>
                    <Chip label={admin.role} size="small"
                      color={admin.role === 'SUPER_ADMIN' ? 'error' : 'primary'} variant="outlined" />
                    <StatusChip status={admin.status || 'ACTIVE'} />
                  </Stack>
                </ListItem>
                {i < admins.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Admin</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full Name" fullWidth value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} autoFocus />
            <TextField label="Email" fullWidth type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Role" fullWidth select SelectProps={{ native: true }} value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

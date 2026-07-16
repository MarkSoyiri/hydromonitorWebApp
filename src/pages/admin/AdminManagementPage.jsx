import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Avatar, List,
  Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Tooltip,
} from '@mui/material';
import { Add, AdminPanelSettings, Shield, Edit, Delete } from '@mui/icons-material';
import { PageHeader, StatCard, StatusChip, ConfirmDialog } from '@/components/common';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import { ENDPOINTS } from '@/constants';
import { extractList } from '@/utils/response';
import toast from 'react-hot-toast';

export function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
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
    setEditing(null);
    setForm({ fullName: '', email: '', role: 'ADMIN' });
    setDialogOpen(true);
  };

  const openEdit = (admin) => {
    setEditing(admin);
    setForm({ fullName: admin.fullName || '', email: admin.email || '', role: admin.role || 'ADMIN' });
    setDialogOpen(true);
  };

  const getUserId = (user) => user.uid || user.id;

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await apiPut(`${ENDPOINTS.USERS}/${getUserId(editing)}`, form);
        toast.success('Admin updated');
      } else {
        await apiPost(ENDPOINTS.USERS, form);
        toast.success('Admin created');
      }
      setDialogOpen(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err?.message || `Failed to ${editing ? 'update' : 'create'} admin`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(`${ENDPOINTS.USERS}/${getUserId(deleteTarget)}`);
      toast.success('Admin deleted');
      setDeleteTarget(null);
      fetchAdmins();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete admin');
    }
  };

  return (
    <Box>
      <PageHeader title="Admin Management" subtitle="Manage system administrators" action actionLabel="Add Admin" onAction={openCreate} />

      <Box sx={{ mb: 3 }}>
        <StatCard title="Total Admins" value={admins.length} icon={<AdminPanelSettings />} color="primary" loading={loading} />
      </Box>

      <Card>
        <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Administrators</Typography>
          <List disablePadding>
            {admins.map((admin, i) => (
              <Box key={admin.uid || admin.id}>
                <Box sx={{
                  display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' }, gap: { xs: 1.5, sm: 0 },
                  py: { xs: 1.5, sm: 1 },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                    <Avatar sx={{ bgcolor: admin.role === 'SUPER_ADMIN' ? 'error.main' : 'primary.main', width: 40, height: 40 }}>
                      <Shield />
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle2" noWrap>{admin.fullName || admin.name}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{admin.email}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    flexWrap: 'wrap',
                    pl: { xs: 6.5, sm: 0 },
                  }}>
                    <Chip label={admin.role} size="small"
                      color={admin.role === 'SUPER_ADMIN' ? 'error' : 'primary'} variant="outlined" />
                    <StatusChip status={admin.status || 'ACTIVE'} />
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(admin)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(admin)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                {i < admins.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
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
            {saving ? 'Saving...' : (editing ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} title="Delete Admin"
        message={`Are you sure you want to delete "${deleteTarget?.fullName || deleteTarget?.name}"?`}
        color="error" confirmLabel="Delete" />
    </Box>
  );
}

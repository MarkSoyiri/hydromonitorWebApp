import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Stack, Avatar,
  Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Tooltip,
} from '@mui/material';
import { Add, AdminPanelSettings, Shield, Edit, Delete } from '@mui/icons-material';
import { PageHeader, StatCard, StatusChip, ConfirmDialog } from '@/components/common';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import { ENDPOINTS } from '@/constants';
import { extractList } from '@/utils/response';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phoneNumber: '', role: 'ADMIN' });

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
    setForm({ fullName: '', email: '', password: '', phoneNumber: '', role: 'ADMIN' });
    setDialogOpen(true);
  };

  const openEdit = (admin) => {
    setEditing(admin);
    setForm({ fullName: admin.fullName || '', email: admin.email || '', password: '', phoneNumber: admin.phoneNumber || '', role: admin.role || 'ADMIN' });
    setDialogOpen(true);
  };

  const getUserId = (user) => user.uid || user.id;

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    if (!editing && (!form.password || form.password.length < 6)) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!editing && !/^\+[1-9]\d{6,14}$/.test(form.phoneNumber.trim())) {
      toast.error('Phone number must be in E.164 format (e.g. +233501234567)');
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
      if (err?.errors && Array.isArray(err.errors)) {
        err.errors.forEach((e) => toast.error(e.message));
      } else {
        toast.error(err?.message || `Failed to ${editing ? 'update' : 'create'} admin`);
      }
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <PageHeader title="Admin Management" subtitle="Manage system administrators" action actionLabel="Add Admin" onAction={openCreate} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Box sx={{ mb: 3 }}>
          <StatCard title="Total Admins" value={admins.length} icon={<AdminPanelSettings />} color="primary" loading={loading} />
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Administrators</Typography>
            <Stack spacing={2}>
              {admins.map((admin) => (
                <Box key={admin.uid || admin.id} sx={{
                  p: 2, borderRadius: 2, border: 1, borderColor: 'divider',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Avatar sx={{ bgcolor: admin.role === 'SUPER_ADMIN' ? 'error.main' : 'primary.main' }}>
                      <Shield />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {admin.fullName || admin.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {admin.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                    <Chip label={admin.role} size="small"
                      color={admin.role === 'SUPER_ADMIN' ? 'error' : 'primary'} variant="outlined" />
                    <StatusChip status={admin.status || 'ACTIVE'} />
                    <Box sx={{ flex: 1 }} />
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
              ))}
            </Stack>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full Name" fullWidth value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} autoFocus />
            <TextField label="Email" fullWidth type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {!editing && (
              <TextField label="Password" fullWidth type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                helperText="Minimum 6 characters" />
            )}
            <TextField label="Phone Number" fullWidth value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="+233501234567"
              helperText="E.164 format with country code (e.g. +233501234567)" />
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

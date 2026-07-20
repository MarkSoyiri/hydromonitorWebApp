import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Stack, Avatar,
  Chip, Autocomplete, TextField as MuiTextField,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Tooltip,
} from '@mui/material';
import { Add, AdminPanelSettings, Shield, Edit, Delete, Business } from '@mui/icons-material';
import { PageHeader, StatCard, StatusChip, ConfirmDialog } from '@/components/common';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import { buildingService } from '@/services/buildingService';
import { ENDPOINTS } from '@/constants';
import { extractList } from '@/utils/response';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedBuildings, setSelectedBuildings] = useState([]);
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

  const fetchBuildings = useCallback(async () => {
    try {
      const { data } = await buildingService.getAll();
      if (data?.success) {
        setBuildings(extractList(data.data));
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => { fetchAdmins(); fetchBuildings(); }, [fetchAdmins, fetchBuildings]);

  const getAdminBuildingIds = (admin) => {
    if (admin.buildingIds && typeof admin.buildingIds === 'object') {
      return Object.keys(admin.buildingIds);
    }
    return [];
  };

  const getAdminBuildingNames = (admin) => {
    const ids = getAdminBuildingIds(admin);
    return ids.map((id) => {
      const b = buildings.find((bld) => bld.buildingId === id || bld.id === id);
      return b?.name || id;
    });
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ fullName: '', email: '', password: '', phoneNumber: '', role: 'ADMIN' });
    setSelectedBuildings([]);
    setDialogOpen(true);
  };

  const openEdit = (admin) => {
    setEditing(admin);
    setForm({ fullName: admin.fullName || '', email: admin.email || '', password: '', phoneNumber: admin.phoneNumber || '', role: admin.role || 'ADMIN' });
    const buildingIds = getAdminBuildingIds(admin);
    const matchedBuildings = buildings.filter((b) => buildingIds.includes(b.buildingId) || buildingIds.includes(b.id));
    setSelectedBuildings(matchedBuildings);
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
    if (!editing && !/^\+[1-9]\d{7,14}$/.test(form.phoneNumber.trim())) {
      toast.error('Phone number must be in E.164 format (e.g. +233501234567)');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await apiPut(`${ENDPOINTS.USERS}/${getUserId(editing)}`, form);
        toast.success('Admin updated');
      } else {
        const buildingIds = {};
        selectedBuildings.forEach((b) => {
          buildingIds[b.buildingId || b.id] = true;
        });
        await apiPost(ENDPOINTS.USERS, { ...form, buildingIds });
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
                    {admin.role === 'ADMIN' && getAdminBuildingNames(admin).length > 0 && (
                      <Chip
                        icon={<Business sx={{ fontSize: 14 }} />}
                        label={getAdminBuildingNames(admin).join(', ')}
                        size="small"
                        variant="outlined"
                        color="info"
                      />
                    )}
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
              inputProps={{ maxLength: 16 }}
              helperText="E.164 format with country code (e.g. +233501234567)" />
            <TextField label="Role" fullWidth select SelectProps={{ native: true }} value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </TextField>
            {form.role === 'ADMIN' && !editing && (
              <Autocomplete
                multiple
                options={buildings}
                getOptionLabel={(option) => option.name || option.buildingId}
                isOptionEqualToValue={(option, value) => (option.buildingId || option.id) === (value.buildingId || value.id)}
                value={selectedBuildings}
                onChange={(_, newValue) => setSelectedBuildings(newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.name || option.buildingId}
                      size="small"
                      {...getTagProps({ index })}
                      key={option.buildingId || option.id}
                    />
                  ))
                }
                renderInput={(params) => (
                  <MuiTextField
                    {...params}
                    label="Assign Buildings"
                    placeholder="Search buildings..."
                    helperText="Select one or more buildings for this admin"
                  />
                )}
                fullWidth
              />
            )}
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

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
  TextField, Typography, IconButton, Tooltip,
} from '@mui/material';
import { Add, Edit, Block, Delete } from '@mui/icons-material';
import { PageHeader, DataTable, StatusChip, ConfirmDialog } from '@/components/common';
import { tenantService } from '@/services';
import { extractList } from '@/utils/response';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export function TenantsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin } = useAuth();
  const basePath = isSuperAdmin ? '/super-admin' : '/admin';
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phoneNumber: '', buildingId: '', roomId: '' });
  const [saving, setSaving] = useState(false);

  const fetchTenants = useCallback(async () => {
    try {
      const { data } = await tenantService.getAll();
      if (data?.success) {
        setTenants(extractList(data.data));
      }
    } catch {
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const openCreate = () => {
    setEditing(null);
    setForm({ fullName: '', email: '', password: '', phoneNumber: '', buildingId: '', roomId: '' });
    setDialogOpen(true);
  };

  const openEdit = (tenant) => {
    setEditing(tenant);
    setForm({ fullName: tenant.fullName || '', email: tenant.email || '', password: '', phoneNumber: tenant.phoneNumber || '', buildingId: tenant.buildingId || '', roomId: tenant.roomId || '' });
    setDialogOpen(true);
  };

  const getTenantId = (t) => t.tenantId || t.uid || t.id;

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    if (!editing) {
      if (!form.password || form.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (!/^\+[1-9]\d{7,14}$/.test(form.phoneNumber.trim())) {
        toast.error('Phone number must be in E.164 format (e.g. +233501234567)');
        return;
      }
      if (!form.buildingId.trim()) {
        toast.error('Building ID is required');
        return;
      }
      if (!form.roomId.trim()) {
        toast.error('Room ID is required');
        return;
      }
    }
    setSaving(true);
    try {
      if (editing) {
        await tenantService.update(getTenantId(editing), form);
        toast.success('Tenant updated');
      } else {
        await tenantService.create(form);
        toast.success('Tenant created');
      }
      setDialogOpen(false);
      fetchTenants();
    } catch (err) {
      if (err?.errors && Array.isArray(err.errors)) {
        err.errors.forEach((e) => toast.error(e.message));
      } else {
        toast.error(err?.message || 'Failed to save tenant');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await tenantService.delete(getTenantId(deleteTarget));
      toast.success('Tenant deleted');
      setDeleteTarget(null);
      fetchTenants();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete tenant');
    } finally {
      setDeleting(false);
    }
  };

  const handleDisable = async (tenant) => {
    const newStatus = tenant.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
    try {
      await tenantService.update(getTenantId(tenant), { status: newStatus });
      toast.success(`Tenant ${newStatus === 'DISABLED' ? 'disabled' : 'enabled'}`);
      fetchTenants();
    } catch (err) {
      toast.error(err?.message || 'Failed to update tenant status');
    }
  };

  const columns = [
    { field: 'fullName', label: 'Name', width: 180 },
    { field: 'email', label: 'Email', width: 220 },
    { field: 'phoneNumber', label: 'Phone', width: 140 },
    { field: 'buildingId', label: 'Building', width: 150 },
    { field: 'roomId', label: 'Room', width: 80 },
    { field: 'status', label: 'Status', width: 100, render: (r) => <StatusChip status={r.status} /> },
    {
      field: 'usage', label: 'Usage', width: 100,
      render: (r) => `${(r.usage?.totalUsageMonth || 0).toLocaleString()} L`,
    },
    {
      field: 'actions', label: 'Actions', width: 120, align: 'center',
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={row.status === 'DISABLED' ? 'Enable' : 'Disable'}>
            <IconButton size="small" color={row.status === 'DISABLED' ? 'success' : 'error'}
              onClick={(e) => { e.stopPropagation(); handleDisable(row); }}>
              <Block fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error"
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <PageHeader title="Tenants" subtitle="Manage all tenants" action actionLabel="Add Tenant" onAction={openCreate} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
        <DataTable
          columns={columns}
          rows={tenants}
          loading={loading}
          onRowClick={(row) => navigate(`${basePath}/tenants/${getTenantId(row)}`, { state: { from: location.pathname } })}
          emptyTitle="No tenants found"
          emptyAction={isSuperAdmin && <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Tenant</Button>}
        />
      </motion.div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Tenant' : 'Add Tenant'}</DialogTitle>
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
            <TextField label="Building ID" fullWidth value={form.buildingId}
              onChange={(e) => setForm({ ...form, buildingId: e.target.value })} />
            <TextField label="Room ID" fullWidth value={form.roomId}
              onChange={(e) => setForm({ ...form, roomId: e.target.value })} />
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
        onConfirm={handleDelete} title="Delete Tenant"
        message={`Are you sure you want to delete "${deleteTarget?.fullName}"? This action cannot be undone.`}
        color="error" confirmLabel="Delete" loading={deleting} />
    </Box>
  );
}

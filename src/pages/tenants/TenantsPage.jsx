import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
  TextField, Typography, IconButton, Tooltip,
} from '@mui/material';
import { Add, Edit, Block } from '@mui/icons-material';
import { PageHeader, DataTable, StatusChip, ConfirmDialog } from '@/components/common';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import { ENDPOINTS, tenantPath } from '@/constants';
import { extractList } from '@/utils/response';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export function TenantsPage() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', buildingId: '', roomId: '' });
  const [saving, setSaving] = useState(false);

  const fetchTenants = useCallback(async () => {
    try {
      const { data } = await apiGet(ENDPOINTS.TENANTS);
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
    setForm({ fullName: '', email: '', phoneNumber: '', buildingId: '', roomId: '' });
    setDialogOpen(true);
  };

  const openEdit = (tenant) => {
    setEditing(tenant);
    setForm({ fullName: tenant.fullName || '', email: tenant.email || '', phoneNumber: tenant.phoneNumber || '', buildingId: tenant.buildingId || '', roomId: tenant.roomId || '' });
    setDialogOpen(true);
  };

  const getTenantId = (t) => t.uid || t.id;

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await apiPut(tenantPath(getTenantId(editing)), form);
        toast.success('Tenant updated');
      } else {
        await apiPost(ENDPOINTS.TENANTS, form);
        toast.success('Tenant created');
      }
      setDialogOpen(false);
      fetchTenants();
    } catch (err) {
      toast.error(err?.message || 'Failed to save tenant');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(tenantPath(getTenantId(deleteTarget)));
      toast.success('Tenant deleted');
      setDeleteTarget(null);
      fetchTenants();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete tenant');
    }
  };

  const handleDisable = async (tenant) => {
    const newStatus = tenant.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
    try {
      await apiPut(tenantPath(getTenantId(tenant)), { status: newStatus });
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
      field: 'actions', label: 'Actions', width: 100, align: 'center',
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
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader title="Tenants" subtitle="Manage all tenants" action actionLabel="Add Tenant" onAction={openCreate} />

      <DataTable
        columns={columns}
        rows={tenants}
        loading={loading}
        onRowClick={(row) => navigate(`/tenants/${getTenantId(row)}`)}
        emptyTitle="No tenants found"
        emptyAction={isSuperAdmin && <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Tenant</Button>}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Tenant' : 'Add Tenant'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full Name" fullWidth value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} autoFocus />
            <TextField label="Email" fullWidth type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Phone Number" fullWidth value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
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
        message={`Are you sure you want to delete "${deleteTarget?.fullName}"?`}
        color="error" confirmLabel="Delete" />
    </Box>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack, Chip, Tooltip,
} from '@mui/material';
import {
  Add, Edit, Delete, Business, MeetingRoom, DevicesOther, People, CheckCircle,
} from '@mui/icons-material';
import { PageHeader, StatCard, DataTable, ConfirmDialog, StatusChip } from '@/components/common';
import { buildingService } from '@/services';
import { extractList } from '@/utils/response';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export function BuildingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [enabling, setEnabling] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchBuildings = useCallback(async () => {
    try {
      const { data } = await buildingService.getAll();
      if (data?.success) {
        setBuildings(extractList(data.data));
      }
    } catch {
      toast.error('Failed to load buildings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBuildings(); }, [fetchBuildings]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', address: '', description: '' });
    setDialogOpen(true);
  };

  const openEdit = (building) => {
    setEditing(building);
    setForm({ name: building.name || '', address: building.address || '', description: building.description || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Building name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await buildingService.update(editing.buildingId, form);
        toast.success('Building updated');
      } else {
        await buildingService.create(form);
        toast.success('Building created');
      }
      setDialogOpen(false);
      fetchBuildings();
    } catch (err) {
      toast.error(err?.message || 'Failed to save building');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await buildingService.delete(deleteTarget.buildingId);
      toast.success('Building deleted');
      setDeleteTarget(null);
      fetchBuildings();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete building');
    } finally {
      setDeleting(false);
    }
  };

  const handleEnable = async (building) => {
    setEnabling(building.buildingId);
    try {
      await buildingService.update(building.buildingId, { status: 'ACTIVE' });
      toast.success('Building enabled');
      fetchBuildings();
    } catch (err) {
      toast.error(err?.message || 'Failed to enable building');
    } finally {
      setEnabling(null);
    }
  };

  const columns = [
    { field: 'name', label: 'Name', width: 200 },
    { field: 'address', label: 'Address', width: 250 },
    {
      field: 'status', label: 'Status', width: 100,
      render: (row) => <StatusChip status={row.status} />,
    },
    {
      field: 'occupancy', label: 'Rooms', width: 80, align: 'center',
      render: (row) => row.occupancy?.totalRooms ?? 0,
    },
    {
      field: 'occupancy', label: 'Occupied', width: 80, align: 'center',
      render: (row) => row.occupancy?.occupiedRooms ?? 0,
    },
    {
      field: 'occupancy', label: 'Tenants', width: 80, align: 'center',
      render: (row) => row.occupancy?.totalTenants ?? 0,
    },
    {
      field: 'actions', label: 'Actions', width: 100, align: 'center',
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
          {row.status === 'DISABLED' && (
            <Tooltip title="Enable">
              <IconButton size="small" color="success"
                disabled={enabling === row.buildingId}
                onClick={(e) => { e.stopPropagation(); handleEnable(row); }}>
                <CheckCircle fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>
              <Edit fontSize="small" />
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
        <PageHeader
          title="Buildings"
          subtitle="Manage all buildings in the system"
          action
          actionLabel="Add Building"
          onAction={openCreate}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
        <DataTable
          columns={columns}
          rows={buildings}
          loading={loading}
          onRowClick={(row) => navigate(`/super-admin/buildings/${row.buildingId}`, { state: { from: location.pathname } })}
          emptyTitle="No buildings found"
          emptyDescription="Create your first building to get started."
          emptyAction={isSuperAdmin && (
            <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
              Add Building
            </Button>
          )}
        />
      </motion.div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Building' : 'Add Building'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Building Name" fullWidth value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
            <TextField label="Address" fullWidth value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <TextField label="Description" fullWidth multiline rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : (editing ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Building"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        color="error"
        confirmLabel="Delete"
        loading={deleting}
      />
    </Box>
  );
}

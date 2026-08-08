import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
  TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton, Tooltip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, IdBadge } from '@/components/common';
import { roomService } from '@/services';
import { useRealtimeList, useRealtimeMap, NODES } from '@/services/realtime';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export function RoomsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isSuperAdmin } = useAuth();
  const basePath = isSuperAdmin ? '/super-admin' : '/admin';
  const roomsState = useRealtimeList(NODES.rooms);
  const buildingsState = useRealtimeMap(NODES.buildings);
  // Admins only manage rooms in buildings assigned to them (building.admins /
  // owner); the super admin sees everything. Mirrors the backend ownership check.
  const uid = user?.uid;
  const allBuildings = Object.values(buildingsState.data || {});
  const buildings = isSuperAdmin
    ? allBuildings
    : allBuildings.filter((b) => (b.admins && b.admins[uid]) || b.ownerAdminId === uid);
  const allowedBuildingIds = new Set(buildings.map((b) => b.buildingId));
  const rooms = isSuperAdmin
    ? roomsState.data
    : roomsState.data.filter((r) => allowedBuildingIds.has(r.buildingId));
  const loading = !(roomsState.loaded && buildingsState.loaded);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ roomNumber: '', floor: 1, buildingId: '', description: '' });
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ roomNumber: '', floor: 1, buildingId: buildings[0]?.buildingId || '', description: '' });
    setDialogOpen(true);
  };

  const openEdit = (room) => {
    setEditing(room);
    setForm({ roomNumber: room.roomNumber || '', floor: room.floor || 1, buildingId: room.buildingId || '', description: room.description || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.roomNumber.trim() || !form.buildingId) {
      toast.error('Room number and building are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await roomService.update(editing.roomId, form);
        toast.success('Room updated');
      } else {
        await roomService.create(form);
        toast.success('Room created');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to save room');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await roomService.delete(deleteTarget.roomId);
      toast.success('Room deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete room');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { field: 'roomNumber', label: 'Room', width: 100 },
    { field: 'floor', label: 'Floor', width: 80, align: 'center' },
    { field: 'buildingId', label: 'Building', width: 200, render: (r) => <IdBadge id={r.buildingId} entity="building" /> },
    { field: 'status', label: 'Status', width: 100, render: (r) => <StatusChip status={r.status} /> },
    { field: 'tenantId', label: 'Tenant', width: 180, render: (r) => r.tenantId ? <IdBadge id={r.tenantId} entity="tenant" /> : 'Vacant' },
    {
      field: 'device', label: 'Device', width: 120, render: (r) => r.device ? r.device.deviceName || 'Assigned' : '—',
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
        <PageHeader title="Rooms" subtitle="Manage rooms across all buildings" action actionLabel="Add Room" onAction={openCreate} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
        <DataTable
          columns={columns}
          rows={rooms}
          loading={loading}
          onRowClick={(row) => navigate(`${basePath}/rooms/${row.roomId}`, { state: { from: location.pathname } })}
          emptyTitle="No rooms found"
          emptyAction={isSuperAdmin && <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Room</Button>}
        />
      </motion.div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Room' : 'Add Room'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Room Number" fullWidth value={form.roomNumber}
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} autoFocus />
            <TextField label="Floor" type="number" fullWidth value={form.floor}
              onChange={(e) => setForm({ ...form, floor: parseInt(e.target.value) || 1 })} />
            <FormControl fullWidth>
              <InputLabel>Building</InputLabel>
              <Select value={form.buildingId} label="Building"
                onChange={(e) => setForm({ ...form, buildingId: e.target.value })}>
                {buildings.map((b) => (
                  <MenuItem key={b.buildingId} value={b.buildingId}>{b.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Description" fullWidth multiline rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button onClick={() => setDialogOpen(false)} fullWidth={true}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving} fullWidth={true}>
            {saving ? 'Saving...' : (editing ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Room"
        message={`Are you sure you want to delete Room ${deleteTarget?.roomNumber}? This action cannot be undone.`}
        color="error"
        confirmLabel="Delete"
        loading={deleting}
      />
    </Box>
  );
}

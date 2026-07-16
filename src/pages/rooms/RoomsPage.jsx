import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
  TextField, Select, MenuItem, FormControl, InputLabel, Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { PageHeader, DataTable, StatusChip, ConfirmDialog } from '@/components/common';
import { roomService, buildingService } from '@/services';
import { extractList } from '@/utils/response';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const columns = [
  { field: 'roomNumber', label: 'Room', width: 100 },
  { field: 'floor', label: 'Floor', width: 80, align: 'center' },
  { field: 'buildingId', label: 'Building', width: 200, render: (r) => r.buildingId || '—' },
  { field: 'status', label: 'Status', width: 100, render: (r) => <StatusChip status={r.status} /> },
  { field: 'tenantId', label: 'Tenant', width: 150, render: (r) => r.tenantId || 'Vacant' },
  {
    field: 'device', label: 'Device', width: 120, render: (r) => r.device ? r.device.deviceName || 'Assigned' : '—',
  },
];

export function RoomsPage() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const basePath = isSuperAdmin ? '/super-admin' : '/admin';
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ roomNumber: '', floor: 1, buildingId: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [rRes, bRes] = await Promise.allSettled([
        roomService.getAll(),
        buildingService.getAll(),
      ]);
      if (rRes.status === 'fulfilled' && rRes.value.data?.success) {
        setRooms(extractList(rRes.value.data.data));
      }
      if (bRes.status === 'fulfilled' && bRes.value.data?.success) {
        setBuildings(extractList(bRes.value.data.data));
      }
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
      fetchData();
    } catch (err) {
      toast.error(err?.message || 'Failed to save room');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await roomService.delete(deleteTarget.roomId);
      toast.success('Room deleted');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete room');
    }
  };

  return (
    <Box>
      <PageHeader title="Rooms" subtitle="Manage rooms across all buildings" action actionLabel="Add Room" onAction={openCreate} />

      <DataTable
        columns={columns}
        rows={rooms}
        loading={loading}
        onRowClick={(row) => navigate(`${basePath}/rooms/${row.roomId}`)}
        emptyTitle="No rooms found"
        emptyAction={isSuperAdmin && <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Room</Button>}
      />

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
        title="Delete Room"
        message={`Are you sure you want to delete Room ${deleteTarget?.roomNumber}?`}
        color="error"
        confirmLabel="Delete"
      />
    </Box>
  );
}

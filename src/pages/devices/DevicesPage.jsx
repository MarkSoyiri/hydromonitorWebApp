import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
  TextField, Typography, IconButton, Chip, Tooltip,
} from '@mui/material';
import {
  Add, PowerSettingsNew, SignalCellularAlt, BatteryStd, Router,
} from '@mui/icons-material';
import { PageHeader, DataTable, StatusChip, ConfirmDialog } from '@/components/common';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import { ENDPOINTS, devicePath } from '@/constants';
import { extractList } from '@/utils/response';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const columns = [
  { field: 'deviceName', label: 'Device', width: 160 },
  { field: 'serialNumber', label: 'Serial', width: 140 },
  { field: 'buildingId', label: 'Building', width: 160 },
  { field: 'roomId', label: 'Room', width: 100, render: (r) => r.roomId || '—' },
  {
    field: 'telemetry', label: 'Status', width: 90,
    render: (r) => <StatusChip status={r.telemetry?.status || 'OFFLINE'} />,
  },
  {
    field: 'telemetry', label: 'Valve', width: 80,
    render: (r) => <StatusChip status={r.telemetry?.valveStatus === 'OPEN' ? 'OPEN' : 'CLOSED'} />,
  },
  {
    field: 'telemetry', label: 'Flow', width: 80,
    render: (r) => `${r.telemetry?.currentFlowRate || 0} L/min`,
  },
  {
    field: 'telemetry', label: 'Leak', width: 70,
    render: (r) => r.telemetry?.leakDetected
      ? <Chip label="LEAK" color="error" size="small" />
      : <Chip label="OK" color="success" size="small" />,
  },
  {
    field: 'telemetry', label: 'Signal', width: 70,
    render: (r) => {
      const sig = r.telemetry?.signalStrength;
      return sig !== null && sig !== undefined
        ? <Chip icon={<SignalCellularAlt />} label={sig} size="small" variant="outlined" />
        : '—';
    },
  },
];

export function DevicesPage() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [devices, setDevices] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ deviceName: '', serialNumber: '', buildingId: '', roomId: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [dRes, bRes] = await Promise.all([
        apiGet(ENDPOINTS.DEVICES),
        apiGet(ENDPOINTS.BUILDINGS),
      ]);
      if (dRes.data?.success) {
        setDevices(extractList(dRes.data.data));
      }
      if (bRes.data?.success) {
        setBuildings(extractList(bRes.data.data));
      }
    } catch {
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ deviceName: '', serialNumber: '', buildingId: '', roomId: '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.deviceName.trim() || !form.serialNumber.trim()) {
      toast.error('Device name and serial number are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await apiPut(devicePath(editing.deviceId), form);
        toast.success('Device updated');
      } else {
        await apiPost(ENDPOINTS.DEVICES, form);
        toast.success('Device created');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err?.message || 'Failed to save device');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiDelete(devicePath(deleteTarget.deviceId));
      toast.success('Device deleted');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete device');
    }
  };

  return (
    <Box>
      <PageHeader title="Devices" subtitle="Monitor and manage all IoT devices" action actionLabel="Add Device" onAction={openCreate} />

      <DataTable
        columns={columns}
        rows={devices}
        loading={loading}
        onRowClick={(row) => navigate(`/devices/${row.deviceId}`)}
        emptyTitle="No devices registered"
        emptyAction={isSuperAdmin && <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Device</Button>}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Device' : 'Add Device'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Device Name" fullWidth value={form.deviceName}
              onChange={(e) => setForm({ ...form, deviceName: e.target.value })} autoFocus />
            <TextField label="Serial Number" fullWidth value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
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
        onConfirm={handleDelete} title="Delete Device"
        message={`Are you sure you want to delete "${deleteTarget?.deviceName}"?`}
        color="error" confirmLabel="Delete" />
    </Box>
  );
}

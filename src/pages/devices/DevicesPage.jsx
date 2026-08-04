import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
  TextField, IconButton, Chip, Tooltip, Typography, Alert, InputAdornment,
} from '@mui/material';
import {
  Add, Delete, SignalCellularAlt, ContentCopy, Check,
} from '@mui/icons-material';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, IdBadge, BuildingSelector, RoomSelector } from '@/components/common';
import { deviceService } from '@/services';
import { extractList } from '@/utils/response';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <TextField
      label={label}
      value={value}
      fullWidth
      InputProps={{
        readOnly: true,
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip title={copied ? 'Copied!' : 'Copy'}>
              <IconButton size="small" onClick={handleCopy}>
                {copied ? <Check fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
}

export function DevicesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin } = useAuth();
  const basePath = isSuperAdmin ? '/super-admin' : '/admin';
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ deviceName: '', serialNumber: '', buildingId: '', roomId: '' });
  const [saving, setSaving] = useState(false);
  const [provision, setProvision] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const dRes = await deviceService.getAll();
      if (dRes.data?.success) {
        setDevices(extractList(dRes.data.data));
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
    if (!form.deviceName.trim() || !form.serialNumber.trim() || !form.buildingId || !form.roomId) {
      toast.error('Device name, serial number, building, and room are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await deviceService.update(editing.deviceId, form);
        toast.success('Device updated');
      } else {
        const res = await deviceService.create(form);
        toast.success('Device created');
        const created = res.data?.data;
        if (created?.deviceSecret) {
          setProvision({
            deviceId: created.deviceId,
            deviceName: created.deviceName,
            deviceSecret: created.deviceSecret,
          });
        }
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
    setDeleting(true);
    try {
      await deviceService.delete(deleteTarget.deviceId);
      toast.success('Device deleted');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete device');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { field: 'deviceName', label: 'Device', width: 160 },
    { field: 'serialNumber', label: 'Serial', width: 140 },
    { field: 'buildingId', label: 'Building', width: 200, render: (r) => <IdBadge id={r.buildingId} entity="building" /> },
    { field: 'roomId', label: 'Room', width: 160, render: (r) => <IdBadge id={r.roomId} entity="room" /> },
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
    {
      field: 'actions', label: 'Actions', width: 80, align: 'center',
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
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
        <PageHeader title="Devices" subtitle="Monitor and manage all IoT devices" action actionLabel="Add Device" onAction={openCreate} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
        <DataTable
          columns={columns}
          rows={devices}
          loading={loading}
          onRowClick={(row) => navigate(`${basePath}/devices/${row.deviceId}`, { state: { from: location.pathname } })}
          emptyTitle="No devices registered"
          emptyAction={<Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Device</Button>}
        />
      </motion.div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Device' : 'Add Device'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Device Name" fullWidth value={form.deviceName}
              onChange={(e) => setForm({ ...form, deviceName: e.target.value })} autoFocus />
            <TextField label="Serial Number" fullWidth value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
            <BuildingSelector
              value={form.buildingId}
              onChange={(buildingId) => setForm({ ...form, buildingId, roomId: '' })}
              required
            />
            <RoomSelector
              buildingId={form.buildingId}
              value={form.roomId}
              onChange={(roomId) => setForm({ ...form, roomId })}
              label="Room"
              required
              disabled={!form.buildingId}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button onClick={() => setDialogOpen(false)} fullWidth={true}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving} fullWidth={true}>
            {saving ? 'Saving...' : (editing ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!provision} onClose={() => setProvision(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Device Provisioned</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="warning">
              Save these credentials now. The device secret is shown only once and cannot be recovered later.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Flash these into the ESP32 firmware in <code>config.h</code> as <code>DEVICE_ID</code> and <code>DEVICE_SECRET</code>.
            </Typography>
            <CopyField label="Device ID" value={provision?.deviceId || ''} />
            <CopyField label="Device Secret" value={provision?.deviceSecret || ''} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button onClick={() => setProvision(null)} variant="contained" fullWidth={true}>Done</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} title="Delete Device"
        message={`Are you sure you want to delete "${deleteTarget?.deviceName}"? This action cannot be undone.`}
        color="error" confirmLabel="Delete" loading={deleting} />
    </Box>
  );
}

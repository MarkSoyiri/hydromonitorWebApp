import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
  TextField, IconButton, Chip, Tooltip, Typography, Alert, InputAdornment,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import {
  Add, Delete, SignalCellularAlt, ContentCopy, Check, MeetingRoom,
  Business, SwapHoriz, Construction, Block,
} from '@mui/icons-material';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, IdBadge, BuildingSelector } from '@/components/common';
import { deviceService, roomService } from '@/services';
import { useLiveDevices } from '@/services/realtime';
import { useAuth } from '@/contexts/AuthContext';
import { DEVICE_LIFECYCLE } from '@/constants';
import { extractList } from '@/utils/response';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCallback } from 'react';

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
  const { isSuperAdmin, assignedBuildings } = useAuth();
  const basePath = isSuperAdmin ? '/super-admin' : '/admin';
  const { devices, loaded } = useLiveDevices();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ deviceName: '', macAddress: '', firmwareVersion: '' });
  const [saving, setSaving] = useState(false);

  // Super Admin workflow: pre-register by MAC -> assign to building.
  const [buildingDialog, setBuildingDialog] = useState(null);
  const [buildingForm, setBuildingForm] = useState({ buildingId: '' });
  const [buildingSaving, setBuildingSaving] = useState(false);

  // Admin workflow: assign an AVAILABLE device to a room.
  const [roomDialog, setRoomDialog] = useState(null);
  const [roomForm, setRoomForm] = useState({ roomId: '' });
  const [roomSaving, setRoomSaving] = useState(false);
  const [rooms, setRooms] = useState([]);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [retireTarget, setRetireTarget] = useState(null);
  const [retiring, setRetiring] = useState(false);
  const [transferTarget, setTransferTarget] = useState(null);
  const [transferForm, setTransferForm] = useState({ buildingId: '' });
  const [transferSaving, setTransferSaving] = useState(false);

  const loading = !loaded;

  const openCreate = () => {
    setForm({ deviceName: '', macAddress: '', firmwareVersion: '' });
    setDialogOpen(true);
  };

  const canManageBuilding = (device) =>
    isSuperAdmin ||
    (device.buildingId && assignedBuildings.some((b) => (b.buildingId || b.id) === device.buildingId));

  const loadRooms = useCallback(async (buildingId) => {
    if (!buildingId) return;
    try {
      const { data } = await roomService.getAll(buildingId);
      if (data?.success) {
        const allRooms = extractList(data.data);
        const roomIds = new Set(devices.map((d) => d.roomId).filter(Boolean));
        setRooms(allRooms.filter((r) => !roomIds.has(r.roomId) || r.roomId === (roomDialog?.roomId || '')));
      }
    } catch {
      setRooms([]);
    }
  }, [devices, roomDialog]);

  const handleSave = async () => {
    if (!form.deviceName.trim() || !form.macAddress.trim()) {
      toast.error('Device name and MAC address are required');
      return;
    }
    setSaving(true);
    try {
      await deviceService.create(form);
      toast.success('Device registered. Assign it to a building next.');
      setDialogOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to register device');
    } finally {
      setSaving(false);
    }
  };

  const openAssignBuilding = (row) => {
    setBuildingDialog(row);
    setBuildingForm({ buildingId: '' });
  };

  const handleAssignBuilding = async () => {
    if (!buildingDialog || !buildingForm.buildingId) { toast.error('Select a building'); return; }
    setBuildingSaving(true);
    try {
      await deviceService.assignToBuilding(buildingDialog.deviceId, buildingForm.buildingId);
      toast.success('Device assigned to building');
      setBuildingDialog(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to assign building');
    } finally {
      setBuildingSaving(false);
    }
  };

  const openAssignRoom = (row) => {
    setRoomDialog(row);
    setRoomForm({ roomId: '' });
    loadRooms(row.buildingId);
  };

  const handleAssignRoom = async () => {
    if (!roomDialog || !roomForm.roomId) { toast.error('Select a room'); return; }
    setRoomSaving(true);
    try {
      await deviceService.assignToRoom(roomDialog.deviceId, roomForm.roomId);
      toast.success('Device assigned to room');
      setRoomDialog(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to assign room');
    } finally {
      setRoomSaving(false);
    }
  };

  const handleUnassign = async (row) => {
    try {
      await deviceService.unassignFromRoom(row.deviceId);
      toast.success('Device unassigned from room');
    } catch (err) {
      toast.error(err?.message || 'Failed to unassign device');
    }
  };

  const handleMaintenance = async (row) => {
    const enable = row.status !== DEVICE_LIFECYCLE.MAINTENANCE;
    try {
      await deviceService.setMaintenance(row.deviceId, enable);
      toast.success(enable ? 'Device moved to maintenance' : 'Maintenance ended');
    } catch (err) {
      toast.error(err?.message || 'Failed to update maintenance');
    }
  };

  const openTransfer = (row) => {
    setTransferTarget(row);
    setTransferForm({ buildingId: '' });
  };

  const handleTransfer = async () => {
    if (!transferTarget || !transferForm.buildingId) { toast.error('Select a target building'); return; }
    setTransferSaving(true);
    try {
      await deviceService.transferToBuilding(transferTarget.deviceId, transferForm.buildingId);
      toast.success('Device transferred');
      setTransferTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to transfer device');
    } finally {
      setTransferSaving(false);
    }
  };

  const handleRetire = async () => {
    if (!retireTarget) return;
    setRetiring(true);
    try {
      await deviceService.retire(retireTarget.deviceId);
      toast.success('Device retired');
      setRetireTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to retire device');
    } finally {
      setRetiring(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deviceService.delete(deleteTarget.deviceId);
      toast.success('Device deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete device');
    } finally {
      setDeleting(false);
    }
  };

  const openAssignRoomFor = (row) => {
    if (!canManageBuilding(row)) {
      toast.error('This device is outside your managed buildings');
      return;
    }
    openAssignRoom(row);
  };

  const columns = [
    { field: 'deviceName', label: 'Device', width: 160 },
    { field: 'serialNumber', label: 'Serial', width: 140 },
    {
      field: 'status', label: 'Lifecycle', width: 130,
      render: (r) => <StatusChip status={r.status || DEVICE_LIFECYCLE.PROVISIONING} />,
    },
    { field: 'macAddress', label: 'MAC', width: 150 },
    { field: 'buildingId', label: 'Building', width: 200, render: (r) => r.buildingId ? <IdBadge id={r.buildingId} entity="building" /> : '—' },
    { field: 'roomId', label: 'Room', width: 160, render: (r) => r.roomId ? <IdBadge id={r.roomId} entity="room" /> : '—' },
    {
      field: 'telemetry', label: 'Online', width: 90,
      render: (r) => <StatusChip status={r.online ? 'ONLINE' : 'OFFLINE'} />,
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
      field: 'telemetry', label: 'Signal', width: 70,
      render: (r) => {
        const sig = r.telemetry?.signalStrength;
        return sig !== null && sig !== undefined
          ? <Chip icon={<SignalCellularAlt />} label={sig} size="small" variant="outlined" />
          : '—';
      },
    },
    {
      field: 'actions', label: 'Actions', width: 200, align: 'center',
      render: (row) => {
        const lifecycle = row.status || DEVICE_LIFECYCLE.PROVISIONING;
        const inBuilding = canManageBuilding(row);
        if (lifecycle === DEVICE_LIFECYCLE.RETIRED) {
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
              <Tooltip title="Retired">
                <IconButton size="small" color="error"><Block fontSize="small" /></IconButton>
              </Tooltip>
            </Box>
          );
        }
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
            {lifecycle === DEVICE_LIFECYCLE.AVAILABLE && inBuilding && (
              <Tooltip title="Assign to Room">
                <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); openAssignRoomFor(row); }}>
                  <MeetingRoom fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {lifecycle === DEVICE_LIFECYCLE.ACTIVE && inBuilding && (
              <Tooltip title="Unassign from Room">
                <IconButton size="small" color="warning" onClick={(e) => { e.stopPropagation(); handleUnassign(row); }}>
                  <SwapHoriz fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {!isSuperAdmin && inBuilding && lifecycle !== DEVICE_LIFECYCLE.MAINTENANCE && (
              <Tooltip title="Maintenance">
                <IconButton size="small" color="default" onClick={(e) => { e.stopPropagation(); handleMaintenance(row); }}>
                  <Construction fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {isSuperAdmin && lifecycle === DEVICE_LIFECYCLE.PROVISIONING && (
              <Tooltip title="Assign to Building">
                <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); openAssignBuilding(row); }}>
                  <Business fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {isSuperAdmin && lifecycle !== DEVICE_LIFECYCLE.PROVISIONING && (
              <Tooltip title="Transfer to Building">
                <IconButton size="small" color="info" onClick={(e) => { e.stopPropagation(); openTransfer(row); }}>
                  <SwapHoriz fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {isSuperAdmin && (
              <>
                <Tooltip title="Retire">
                  <IconButton size="small" color="secondary" onClick={(e) => { e.stopPropagation(); setRetireTarget(row); }}>
                    <Block fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <PageHeader
          title="Devices"
          subtitle={isSuperAdmin ? 'Provision devices and assign them to buildings' : 'Assign available devices to rooms in your buildings'}
          action={isSuperAdmin ? 'Register Device' : undefined}
          onAction={isSuperAdmin ? openCreate : undefined}
          actionLabel={isSuperAdmin ? 'Register Device' : undefined}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
        <DataTable
          columns={columns}
          rows={devices}
          loading={loading}
          onRowClick={(row) => navigate(`${basePath}/devices/${row.deviceId}`, { state: { from: location.pathname } })}
          emptyTitle="No devices registered"
          emptyAction={isSuperAdmin ? <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Register Device</Button> : undefined}
        />
      </motion.div>

      {isSuperAdmin && (
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Register Device</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="info">
                Pre-register a device by its MAC address. The firmware claims it at first boot and receives its
                device secret. After it is claimed and the device boots, assign it to a building.
              </Alert>
              <TextField label="Device Name" fullWidth value={form.deviceName}
                onChange={(e) => setForm({ ...form, deviceName: e.target.value })} autoFocus required />
              <TextField label="MAC Address" fullWidth value={form.macAddress}
                onChange={(e) => setForm({ ...form, macAddress: e.target.value })} required
                placeholder="AA:BB:CC:DD:EE:FF" />
              <TextField label="Firmware Version" fullWidth value={form.firmwareVersion}
                onChange={(e) => setForm({ ...form, firmwareVersion: e.target.value })}
                placeholder="optional" />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
            <Button onClick={() => setDialogOpen(false)} fullWidth>Cancel</Button>
            <Button onClick={handleSave} variant="contained" disabled={saving} fullWidth>
              {saving ? 'Registering...' : 'Register'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog open={!!buildingDialog} onClose={() => setBuildingDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Device to Building</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <CopyField label="Device ID" value={buildingDialog?.deviceId || ''} />
            <BuildingSelector
              value={buildingForm.buildingId}
              onChange={(buildingId) => setBuildingForm({ ...buildingForm, buildingId })}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button onClick={() => setBuildingDialog(null)} fullWidth>Cancel</Button>
          <Button onClick={handleAssignBuilding} variant="contained" disabled={buildingSaving} fullWidth>
            {buildingSaving ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!roomDialog} onClose={() => setRoomDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Device to Room</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <CopyField label="Device ID" value={roomDialog?.deviceId || ''} />
            <FormControl fullWidth>
              <InputLabel>Room</InputLabel>
              <Select
                label="Room"
                value={roomForm.roomId}
                onChange={(e) => setRoomForm({ ...roomForm, roomId: e.target.value })}
              >
                {rooms.map((room) => (
                  <MenuItem key={room.roomId} value={room.roomId}>
                    {room.roomNumber || room.roomId}{room.floor != null ? ` — Floor ${room.floor}` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button onClick={() => setRoomDialog(null)} fullWidth>Cancel</Button>
          <Button onClick={handleAssignRoom} variant="contained" disabled={roomSaving || !roomForm.roomId} fullWidth>
            {roomSaving ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!transferTarget} onClose={() => setTransferTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Device to Building</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              The device leaves its current room and building inventory, and lands in the target building as
              AVAILABLE.
            </Typography>
            <BuildingSelector
              value={transferForm.buildingId}
              onChange={(buildingId) => setTransferForm({ ...transferForm, buildingId })}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button onClick={() => setTransferTarget(null)} fullWidth>Cancel</Button>
          <Button onClick={handleTransfer} variant="contained" disabled={transferSaving || !transferForm.buildingId} fullWidth>
            {transferSaving ? 'Transferring...' : 'Transfer'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!retireTarget} onClose={() => setRetireTarget(null)}
        onConfirm={handleRetire} title="Retire Device"
        message={`Retire "${retireTarget?.deviceName}"? Historical telemetry is kept, but the device can no longer authenticate.`}
        confirmLabel="Retire" loading={retiring} />

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} title="Delete Device"
        message={`Are you sure you want to permanently delete "${deleteTarget?.deviceName}"?`}
        color="error" confirmLabel="Delete" loading={deleting} />
    </Box>
  );
}
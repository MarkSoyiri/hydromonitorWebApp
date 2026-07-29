import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, IconButton, Chip, Button, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, TextField,
} from '@mui/material';
import {
  ArrowBack, WaterDrop, MeetingRoom, DevicesOther, Warning, Person,
  PersonOff, PersonAdd, CheckCircle,
} from '@mui/icons-material';
import { StatCard, StatusChip, ConfirmDialog, LoadingScreen } from '@/components/common';
import { roomService, tenantService, usageService } from '@/services';
import { extractList } from '@/utils/response';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useBackNavigation } from '@/hooks/useBackNavigation';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

export function RoomDetailPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, isAdmin, assignedBuildings } = useAuth();
  const basePath = isSuperAdmin ? '/super-admin' : '/admin';
  const goBack = useBackNavigation(`${basePath}/rooms`);
  const [room, setRoom] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [unassigning, setUnassigning] = useState(false);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [loadingTenants, setLoadingTenants] = useState(false);

  const fetchRoom = useCallback(async () => {
    try {
      const { data } = await roomService.getById(roomId);
      if (data?.success) {
        const roomData = { ...data.data, roomId };
        setRoom(roomData);

        if (roomData.tenantId) {
          try {
            const { data: tData } = await tenantService.getById(roomData.tenantId);
            if (tData?.success) {
              setTenant({ ...tData.data, tenantId: roomData.tenantId });
            }
          } catch {
            // tenant fetch failed silently
          }
        } else {
          setTenant(null);
        }

        const deviceId = roomData.device?.deviceId;
        if (deviceId) {
          try {
            const { data: readingsData } = await usageService.getDeviceReadings(deviceId);
            if (readingsData?.success) {
              const list = extractList(readingsData.data);
              setReadings(list.map((r) => ({
                time: r.timestamp ? dayjs(r.timestamp).format('HH:mm') : '',
                flow: r.flowRate || r.flow || r.usage || 0,
              })));
            }
          } catch {
            // readings fetch failed silently
          }
        }
      }
    } catch {
      toast.error('Failed to load room');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => { fetchRoom(); }, [fetchRoom]);

  const canManage = isSuperAdmin || (isAdmin && assignedBuildings?.some((b) => b.buildingId === room?.buildingId));

  const handleUnassign = async () => {
    if (!room?.tenantId) {
      toast.error('This room has no tenant assigned');
      return;
    }
    if (room.status === 'VACANT') {
      toast.error('This room is already vacant');
      return;
    }
    if (!canManage) {
      toast.error('You do not have permission to manage this room');
      return;
    }
    setUnassigning(true);
    try {
      await roomService.unassignTenant(roomId, room.tenantId);
      toast.success(`${tenant?.fullName || 'Tenant'} has been removed from Room ${room.roomNumber}`);
      setUnassignDialogOpen(false);
      setTenant(null);
      await fetchRoom();
    } catch (err) {
      const msg = err?.message || 'Failed to unassign tenant';
      if (err?.isNotFound) {
        toast.error('Room or tenant not found');
      } else if (err?.isForbidden) {
        toast.error('You do not have permission to unassign tenants from this room');
      } else {
        toast.error(msg);
      }
    } finally {
      setUnassigning(false);
    }
  };

  const fetchAvailableTenants = async () => {
    setLoadingTenants(true);
    try {
      const { data } = await tenantService.getAll();
      if (data?.success) {
        const allTenants = extractList(data.data);
        const unassigned = allTenants.filter((t) => !t.roomId && t.status !== 'DISABLED');
        setAvailableTenants(unassigned);
      }
    } catch {
      toast.error('Failed to load tenants');
    } finally {
      setLoadingTenants(false);
    }
  };

  const handleOpenAssign = () => {
    setSelectedTenant(null);
    setAssignDialogOpen(true);
    fetchAvailableTenants();
  };

  const handleAssign = async () => {
    if (!selectedTenant) { toast.error('Please select a tenant'); return; }
    setAssigning(true);
    try {
      const tenantId = selectedTenant.tenantId || selectedTenant.uid || selectedTenant.id;
      await tenantService.update(tenantId, {
        fullName: selectedTenant.fullName || '',
        email: selectedTenant.email || '',
        phoneNumber: selectedTenant.phoneNumber || '',
        buildingId: room.buildingId,
        roomId: roomId,
      });
      await roomService.update(roomId, { tenantId, status: 'OCCUPIED' });
      toast.success(`${selectedTenant.fullName} assigned to Room ${room.roomNumber}`);
      setAssignDialogOpen(false);
      setSelectedTenant(null);
      fetchRoom();
    } catch (err) {
      toast.error(err?.message || 'Failed to assign tenant');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!room) return <Typography>Room not found</Typography>;

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <IconButton onClick={goBack} size="small" sx={{ minWidth: { xs: 44, sm: 'auto' }, minHeight: { xs: 44, sm: 'auto' } }}><ArrowBack /></IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Room {room.roomNumber}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              Floor {room.floor} · {room.buildingId || 'Unknown Building'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <StatusChip status={room.status} />
            {room.device && <StatusChip status={room.device.telemetry?.valveStatus === 'OPEN' ? 'OPEN' : 'CLOSED'} />}
            {canManage && !room.tenantId && (
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAdd />}
                onClick={handleOpenAssign}
                sx={{
                  ml: 0.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #2F80ED, #00B4D8)',
                  boxShadow: '0 2px 8px rgba(47,128,237,0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1a6bc4, #0097b2)',
                    boxShadow: '0 4px 16px rgba(47,128,237,0.35)',
                  },
                }}
              >
                Assign Tenant
              </Button>
            )}
            {canManage && room.tenantId && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<PersonOff />}
                onClick={() => setUnassignDialogOpen(true)}
                sx={{
                  ml: 0.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  borderColor: 'error.main',
                  '&:hover': {
                    borderColor: 'error.dark',
                    bgcolor: 'rgba(229,57,53,0.04)',
                  },
                }}
              >
                Unassign Tenant
              </Button>
            )}
          </Box>
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          <Grid item xs={6} sm={3}>
            <StatCard title="Current Flow" value={`${room.usage?.currentFlowRate || 0} L/min`} icon={<WaterDrop />} color="primary" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Today's Usage" value={`${(room.usage?.totalUsageToday || 0).toLocaleString()} L`} icon={<WaterDrop />} color="info" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Device" value={room.device?.deviceName || 'Not assigned'} icon={<DevicesOther />} color="warning" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Leak Status" value={room.device?.telemetry?.leakDetected ? 'Leak Detected' : 'Normal'} icon={<Warning />}
              color={room.device?.telemetry?.leakDetected ? 'error' : 'success'} />
          </Grid>
        </Grid>
      </motion.div>

      {tenant && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <Card sx={{ mb: { xs: 2, sm: 3 }, overflow: 'hidden', borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
            <CardContent sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
                <Box sx={{
                  width: { xs: 36, sm: 44 }, height: { xs: 36, sm: 44 }, borderRadius: 2.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #2F80ED, #5FA4FF)',
                  color: '#fff', flexShrink: 0,
                }}>
                  <Person />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{tenant.fullName || 'Unnamed Tenant'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {tenant.email} {tenant.phoneNumber ? `· ${tenant.phoneNumber}` : ''}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <StatusChip status={tenant.status || 'ACTIVE'} />
                  <IconButton
                    size="small"
                    onClick={() => navigate(`${basePath}/tenants/${tenant.tenantId}`, { state: { from: location.pathname } })}
                    sx={{ color: 'primary.main' }}
                  >
                    <CheckCircle fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!tenant && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <Card sx={{ mb: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
            <CardContent sx={{ py: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Person sx={{ color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary">No tenant assigned to this room</Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Flow Rate (Today)</Typography>
            {readings.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={readings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#A0AEC0" />
                  <Tooltip />
                  <Line type="monotone" dataKey="flow" stroke="#2F80ED" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250 }}>
                <Typography color="text.secondary">
                  {room.device ? 'No readings data available for this device' : 'No device assigned to this room'}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Unassign Confirmation Dialog */}
      <ConfirmDialog
        open={unassignDialogOpen}
        onClose={() => setUnassignDialogOpen(false)}
        onConfirm={handleUnassign}
        title="Unassign Tenant"
        message={
          tenant
            ? `Are you sure you want to remove ${tenant.fullName || 'this tenant'} from Room ${room.roomNumber}? The tenant account will remain active, but the room will become vacant.`
            : 'Are you sure you want to unassign the tenant from this room?'
        }
        color="error"
        confirmLabel="Unassign"
        loading={unassigning}
      />

      {/* Assign Tenant Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Tenant to Room {room.roomNumber}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select an unassigned tenant to assign to this room.
          </Typography>
          <Autocomplete
            options={availableTenants}
            loading={loadingTenants}
            getOptionLabel={(option) => option.fullName || option.name || 'Unnamed'}
            isOptionEqualToValue={(option, value) =>
              (option.tenantId || option.uid || option.id) === (value.tenantId || value.uid || value.id)
            }
            value={selectedTenant}
            onChange={(_, newValue) => setSelectedTenant(newValue)}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.tenantId || option.uid || option.id}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.fullName || 'Unnamed'}</Typography>
                  <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Tenant"
                placeholder="Search tenants..."
                helperText={loadingTenants ? 'Loading tenants...' : `${availableTenants.length} unassigned tenant(s) available`}
              />
            )}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Button onClick={() => setAssignDialogOpen(false)} fullWidth={true}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained" disabled={assigning || !selectedTenant} fullWidth={true}>
            {assigning ? 'Assigning...' : 'Assign Tenant'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

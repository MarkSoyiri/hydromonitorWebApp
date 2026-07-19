import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, Tabs, Tab,
  TextField, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
  ArrowBack, Edit, MeetingRoom, DevicesOther, People,
  Add, Warning,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { StatCard, PageHeader, StatusChip, DataTable, ConfirmDialog, EmptyState } from '@/components/common';
import { buildingService } from '@/services/buildingService';
import { roomService } from '@/services/roomService';
import { deviceService } from '@/services/deviceService';
import { tenantService } from '@/services/tenantService';
import { alertService } from '@/services/alertService';
import { analyticsService } from '@/services/analyticsService';
import { usageService } from '@/services/usageService';
import { extractList } from '@/utils/response';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useBackNavigation } from '@/hooks/useBackNavigation';

const PIE_COLORS = ['#4caf50', '#f44336', '#ff9800'];

const roomColumns = [
  { field: 'roomNumber', label: 'Room', width: 120 },
  { field: 'floor', label: 'Floor', width: 80, align: 'center' },
  { field: 'status', label: 'Status', width: 110, render: (r) => <StatusChip status={r.status} /> },
  { field: 'tenantId', label: 'Tenant', width: 160, render: (r) => r.tenantId || '—' },
  {
    field: '_actions', label: '', width: 60, align: 'center',
    render: (r, _i, { onEdit, onDelete }) => (
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit?.(r); }}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  },
];

const deviceColumns = [
  { field: 'deviceName', label: 'Device', width: 160 },
  { field: 'serialNumber', label: 'Serial', width: 140 },
  {
    field: 'status', label: 'Status', width: 110,
    render: (d) => <StatusChip status={d.status} />,
  },
  {
    field: 'online', label: 'Online', width: 90, align: 'center',
    render: (d) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: d.online ? '#43a047' : 'grey.400', boxShadow: d.online ? '0 0 6px rgba(67,160,71,0.6)' : 'none' }} />
        <Typography variant="caption">{d.online ? 'Yes' : 'No'}</Typography>
      </Box>
    ),
  },
  {
    field: 'valveState', label: 'Valve', width: 80, align: 'center',
    render: (d) => (
      <Typography variant="caption" sx={{ fontWeight: 600, color: d.valveState === 'OPEN' ? 'success.main' : 'error.main' }}>
        {d.valveState || '—'}
      </Typography>
    ),
  },
  { field: 'roomId', label: 'Room', width: 120, render: (d) => d.roomId || '—' },
];

const tenantColumns = [
  { field: 'fullName', label: 'Name', width: 180 },
  { field: 'email', label: 'Email', width: 200 },
  { field: 'phoneNumber', label: 'Phone', width: 140 },
  { field: 'roomId', label: 'Room', width: 120, render: (t) => t.roomId || '—' },
  { field: 'status', label: 'Status', width: 110, render: (t) => <StatusChip status={t.status} /> },
];

const alertColumns = [
  {
    field: 'severity', label: 'Severity', width: 100,
    render: (a) => (
      <Typography variant="caption" sx={{
        fontWeight: 600,
        color: a.severity === 'CRITICAL' ? 'error.main' : a.severity === 'WARNING' ? 'warning.main' : 'info.main',
      }}>
        {a.severity || '—'}
      </Typography>
    ),
  },
  { field: 'type', label: 'Type', width: 140 },
  { field: 'message', label: 'Message', minWidth: 200 },
  {
    field: 'status', label: 'Status', width: 110,
    render: (a) => <StatusChip status={a.status} />,
  },
  {
    field: 'createdAt', label: 'Time', width: 160,
    render: (a) => a.createdAt ? new Date(a.createdAt).toLocaleString() : '—',
  },
];

export function BuildingDetailPage() {
  const { buildingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = useBackNavigation('/super-admin/buildings');

  const [building, setBuilding] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({ roomNumber: '', floor: '' });
  const [roomSaving, setRoomSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [bRes, rRes, dRes, tRes, aRes] = await Promise.all([
        buildingService.getById(buildingId),
        roomService.getAll(buildingId),
        deviceService.getAll(),
        tenantService.getAll(),
        alertService.getAll({ buildingId }),
      ]);

      if (bRes.data?.success) setBuilding({ ...bRes.data.data, buildingId });
      if (rRes.data?.success) setRooms(extractList(rRes.data.data));
      if (dRes.data?.success) {
        const allDevices = extractList(dRes.data.data);
        setDevices(allDevices.filter((d) => d.buildingId === buildingId));
      }
      if (tRes.data?.success) {
        const allTenants = extractList(tRes.data.data);
        setTenants(allTenants.filter((t) => t.buildingId === buildingId));
      }
      if (aRes.data?.success) setAlerts(extractList(aRes.data.data));

      try {
        const anRes = await analyticsService.getBuildingAnalytics(buildingId);
        if (anRes.data?.success) setAnalytics(anRes.data.data);
      } catch {
        /* analytics may not exist yet */
      }
    } catch {
      toast.error('Failed to load building details');
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (tab === 4 && devices.length > 0 && usageData.length === 0) {
      const primary = devices[0];
      usageService.getDeviceReadings(primary.deviceId, { limit: 50 })
        .then(({ data }) => {
          if (data?.success) setUsageData(extractList(data.data));
        })
        .catch(() => {});
    }
  }, [tab, devices, usageData.length]);

  const openAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({ roomNumber: '', floor: '' });
    setRoomDialogOpen(true);
  };

  const openEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({ roomNumber: room.roomNumber || '', floor: room.floor ?? '' });
    setRoomDialogOpen(true);
  };

  const handleSaveRoom = async () => {
    if (!roomForm.roomNumber.trim()) { toast.error('Room number is required'); return; }
    setRoomSaving(true);
    try {
      if (editingRoom) {
        await roomService.update(editingRoom.roomId, roomForm);
        toast.success('Room updated');
      } else {
        await roomService.create({ ...roomForm, buildingId });
        toast.success('Room added');
      }
      setRoomDialogOpen(false);
      fetchAll();
    } catch (err) {
      toast.error(err?.message || 'Failed to save room');
    } finally {
      setRoomSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteType === 'room') {
        await roomService.delete(deleteTarget.roomId);
        toast.success('Room deleted');
      } else if (deleteType === 'device') {
        await deviceService.delete(deleteTarget.deviceId);
        toast.success('Device deleted');
      } else if (deleteType === 'tenant') {
        await tenantService.delete(deleteTarget.tenantId);
        toast.success('Tenant deleted');
      } else if (deleteType === 'alert') {
        await alertService.resolve(deleteTarget.alertId);
        toast.success('Alert resolved');
      }
      setDeleteTarget(null);
      setDeleteType('');
      fetchAll();
    } catch (err) {
      toast.error(err?.message || 'Failed');
    }
  };

  const occupancy = building?.occupancy || {};
  const vacantRooms = (occupancy.totalRooms || 0) - (occupancy.occupiedRooms || 0);
  const onlineDevices = devices.filter((d) => d.online).length;
  const unresolvedAlerts = alerts.filter((a) => a.status !== 'RESOLVED').length;

  const occupancyPieData = [
    { name: 'Occupied', value: occupancy.occupiedRooms || 0 },
    { name: 'Vacant', value: Math.max(0, vacantRooms) },
  ];

  const usageChartData = usageData.slice(-12).map((r) => ({
    time: r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    liters: r.usageLiters ?? r.usage ?? 0,
  }));

  if (loading) {
    return (
      <Box>
        <PageHeader title="Loading..." />
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} sm={3} key={i}>
              <StatCard title="" value="" loading />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!building) {
    return (
      <Box>
        <PageHeader title="Building not found" />
        <Button startIcon={<ArrowBack />} onClick={goBack}>
          Back to Buildings
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <IconButton onClick={goBack}><ArrowBack /></IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{building.name}</Typography>
            <Typography variant="body2" color="text.secondary">{building.address}</Typography>
            {building.description && (
              <Typography variant="caption" color="text.disabled">{building.description}</Typography>
            )}
          </Box>
          <StatusChip status={building.status} />
          <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate('/super-admin/buildings')}>
            Edit Building
          </Button>
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <StatCard title="Total Rooms" value={occupancy.totalRooms ?? 0} icon={<MeetingRoom />} color="primary" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Occupied" value={occupancy.occupiedRooms ?? 0} icon={<People />} color="success" subtitle={`${vacantRooms} vacant`} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Devices" value={devices.length} icon={<DevicesOther />} color="info" subtitle={`${onlineDevices} online`} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard
              title="Active Alerts"
              value={unresolvedAlerts}
              icon={<Warning />}
              color={unresolvedAlerts > 0 ? 'error' : 'success'}
              subtitle={unresolvedAlerts === 0 ? 'All clear' : 'Needs attention'}
            />
          </Grid>
        </Grid>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
        <Card sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
              <Tab label="Overview" />
              <Tab label={`Rooms (${rooms.length})`} />
              <Tab label={`Devices (${devices.length})`} />
              <Tab label={`Tenants (${tenants.length})`} />
              <Tab label="Analytics" />
              <Tab label={`Alerts (${unresolvedAlerts})`} />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 3 }}>
          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Occupancy</Typography>
                    {occupancyPieData.some((d) => d.value > 0) ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={occupancyPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                            {occupancyPieData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i]} />
                            ))}
                          </Pie>
                          <ReTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Typography color="text.secondary">No occupancy data</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Recent Usage</Typography>
                    {usageChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={usageChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <ReTooltip />
                          <Bar dataKey="liters" fill="#1976d2" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Typography color="text.secondary">No usage data available</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Building Details</Typography>
                    <Grid container spacing={2}>
                      {[
                        { label: 'Name', value: building.name },
                        { label: 'Address', value: building.address },
                        { label: 'Status', value: building.status },
                        { label: 'Water Rate', value: building.billing?.waterRate ? `${building.billing.waterRate} ${building.billing.currency || 'GHS'}/L` : '—' },
                        { label: 'Total Tenants', value: occupancy.totalTenants ?? tenants.length },
                        { label: 'Total Devices', value: occupancy.totalDevices ?? devices.length },
                      ].map((item) => (
                        <Grid item xs={6} sm={4} key={item.label}>
                          <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{item.value || '—'}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {tab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" startIcon={<Add />} onClick={openAddRoom}>
                  Add Room
                </Button>
              </Box>
              <DataTable
                columns={roomColumns.map((c) =>
                  c.field === '_actions'
                    ? { ...c, render: (r) => roomColumns.find((x) => x.field === '_actions').render(r, 0, { onEdit: openEditRoom, onDelete: (r) => { setDeleteTarget(r); setDeleteType('room'); } }) }
                    : c
                )}
                rows={rooms}
                onRowClick={(row) => navigate(`/super-admin/rooms/${row.roomId}`, { state: { from: location.pathname } })}
                emptyTitle="No rooms"
                emptyDescription="Add a room to this building."
                emptyAction={<Button variant="contained" startIcon={<Add />} onClick={openAddRoom}>Add Room</Button>}
              />
            </Box>
          )}

          {tab === 2 && (
            <DataTable
              columns={deviceColumns}
              rows={devices}
              onRowClick={(row) => navigate(`/super-admin/devices/${row.deviceId}`, { state: { from: location.pathname } })}
              emptyTitle="No devices"
              emptyDescription="No devices are assigned to this building."
            />
          )}

          {tab === 3 && (
            <DataTable
              columns={tenantColumns}
              rows={tenants}
              onRowClick={(row) => navigate(`/super-admin/tenants/${row.tenantId}`, { state: { from: location.pathname } })}
              emptyTitle="No tenants"
              emptyDescription="No tenants are assigned to this building."
            />
          )}

          {tab === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Consumption Trend</Typography>
                    {usageChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={usageChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <ReTooltip />
                          <Line type="monotone" dataKey="liters" stroke="#1976d2" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyState title="No analytics data" description="Usage data will appear here once devices start reporting." />
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Summary</Typography>
                    <Stack spacing={2}>
                      {analytics && [
                        { label: 'Avg Daily Usage', value: `${analytics.avgDailyUsage?.toFixed(1) ?? '—'} L` },
                        { label: 'Total Usage', value: `${analytics.totalUsage?.toFixed(1) ?? '—'} L` },
                        { label: 'Peak Usage', value: `${analytics.peakUsage?.toFixed(1) ?? '—'} L` },
                      ].map((item) => (
                        <Box key={item.label}>
                          <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{item.value}</Typography>
                        </Box>
                      ))}
                      {!analytics && (
                        <Typography color="text.secondary">No analytics summary available</Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {tab === 5 && (
            <DataTable
              columns={alertColumns}
              rows={alerts}
              onRowClick={(row) => {
                if (row.status !== 'RESOLVED') {
                  setDeleteTarget(row);
                  setDeleteType('alert');
                }
              }}
              emptyTitle="No alerts"
              emptyDescription="No alerts for this building."
            />
          )}
        </CardContent>
      </Card>
      </motion.div>

      <Dialog open={roomDialogOpen} onClose={() => setRoomDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRoom ? 'Edit Room' : 'Add Room'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Room Number"
              fullWidth
              value={roomForm.roomNumber}
              onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
              autoFocus
            />
            <TextField
              label="Floor"
              fullWidth
              type="number"
              value={roomForm.floor}
              onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoomDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveRoom} variant="contained" disabled={roomSaving}>
            {roomSaving ? 'Saving...' : editingRoom ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteType(''); }}
        onConfirm={handleDelete}
        title={deleteType === 'alert' ? 'Resolve Alert' : `Delete ${deleteType.charAt(0).toUpperCase() + deleteType.slice(1)}`}
        message={
          deleteType === 'alert'
            ? `Resolve alert: "${deleteTarget?.message || deleteTarget?.type}"?`
            : `Are you sure you want to delete this ${deleteType}? This action cannot be undone.`
        }
        color={deleteType === 'alert' ? 'warning' : 'error'}
        confirmLabel={deleteType === 'alert' ? 'Resolve' : 'Delete'}
      />
    </Box>
  );
}

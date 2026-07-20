import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, useMatch } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, Tabs, Tab,
  TextField, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip, Select, MenuItem, FormControl, InputLabel, Avatar, Autocomplete,
  Divider,
} from '@mui/material';
import {
  ArrowBack, Edit, MeetingRoom, DevicesOther, People,
  Add, Warning, CheckCircle, Shield, PersonRemove, Business,
  WaterDrop, DoorFront, OnlinePrediction,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { StatCard, PageHeader, StatusChip, DataTable, ConfirmDialog, EmptyState, IdBadge } from '@/components/common';
import { buildingService } from '@/services/buildingService';
import { roomService } from '@/services/roomService';
import { deviceService } from '@/services/deviceService';
import { tenantService } from '@/services/tenantService';
import { alertService } from '@/services/alertService';
import { analyticsService } from '@/services/analyticsService';
import { usageService } from '@/services/usageService';
import { apiGet } from '@/services/api';
import { ENDPOINTS } from '@/constants';
import { extractList } from '@/utils/response';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useBackNavigation } from '@/hooks/useBackNavigation';

const PIE_COLORS = ['#4caf50', '#f44336', '#ff9800'];

const roomColumns = [
  { field: 'roomNumber', label: 'Room', width: 120 },
  { field: 'floor', label: 'Floor', width: 80, align: 'center' },
  { field: 'status', label: 'Status', width: 110, render: (r) => <StatusChip status={r.status} /> },
  { field: 'tenantId', label: 'Tenant', width: 200, render: (r) => r.tenantId ? <IdBadge id={r.tenantId} entity="tenant" /> : '—' },
  {
    field: '_actions', label: '', width: 120, align: 'center',
    render: (r, _i, { onEdit, onDelete }) => (
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit?.(r); }}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete?.(r); }}>
            <DoorFront fontSize="small" />
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
  { field: 'roomId', label: 'Room', width: 200, render: (d) => <IdBadge id={d.roomId} entity="room" /> },
];

const tenantColumns = [
  { field: 'fullName', label: 'Name', width: 180 },
  { field: 'email', label: 'Email', width: 200 },
  { field: 'phoneNumber', label: 'Phone', width: 140 },
  { field: 'roomId', label: 'Room', width: 200, render: (t) => <IdBadge id={t.roomId} entity="room" /> },
  { field: 'status', label: 'Status', width: 110, render: (t) => <StatusChip status={t.status} /> },
];

const alertColumns = [
  {
    field: 'severity', label: 'Severity', width: 100,
    render: (a) => (
      <Typography variant="caption" sx={{
        fontWeight: 600,
        color: a.severity === 'CRITICAL' ? 'error.main' : a.severity === 'HIGH' ? 'warning.main' : 'info.main',
      }}>
        {a.severity || '—'}
      </Typography>
    ),
  },
  { field: 'type', label: 'Type', width: 140 },
  { field: 'message', label: 'Message', minWidth: 200 },
  {
    field: 'resolved', label: 'Status', width: 110,
    render: (a) => <StatusChip status={a.resolved ? 'RESOLVED' : 'ACTIVE'} />,
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
  const { isSuperAdmin, isAdmin } = useAuth();
  const basePath = isSuperAdmin ? '/super-admin' : '/admin';
  const goBack = useBackNavigation(`${basePath}/buildings`);

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
  const [roomForm, setRoomForm] = useState({ roomNumber: '', floor: '', roomType: '', capacity: '', status: 'VACANT' });
  const [roomSaving, setRoomSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [enabling, setEnabling] = useState(false);

  const [buildingAdmins, setBuildingAdmins] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminSaving, setAdminSaving] = useState(false);

  const handleEnable = async () => {
    if (!building) return;
    setEnabling(true);
    try {
      await buildingService.update(building.buildingId, { status: 'ACTIVE' });
      toast.success('Building enabled');
      setBuilding({ ...building, status: 'ACTIVE' });
    } catch (err) {
      toast.error(err?.message || 'Failed to enable building');
    } finally {
      setEnabling(false);
    }
  };

  const fetchBuildingAdmins = useCallback(async () => {
    try {
      const { data } = await buildingService.getAdmins(buildingId);
      if (data?.success) {
        const adminList = extractList(data.data);
        setBuildingAdmins(adminList);
      }
    } catch {
      // silently fail
    }
  }, [buildingId]);

  const fetchAllAdmins = useCallback(async () => {
    try {
      const { data } = await apiGet(ENDPOINTS.USERS);
      if (data?.success) {
        const admins = extractList(data.data).filter((u) => u.role === 'ADMIN');
        setAllAdmins(admins);
      }
    } catch {
      // silently fail
    }
  }, []);

  const handleAssignAdmin = async () => {
    if (!selectedAdmin) { toast.error('Please select an admin'); return; }
    const adminId = selectedAdmin.uid || selectedAdmin.id;
    setAdminSaving(true);
    try {
      await buildingService.assignAdmin(buildingId, adminId);
      toast.success('Admin assigned to building');
      setAdminDialogOpen(false);
      setSelectedAdmin(null);
      fetchBuildingAdmins();
    } catch (err) {
      toast.error(err?.message || 'Failed to assign admin');
    } finally {
      setAdminSaving(false);
    }
  };

  const handleUnassignAdmin = async (admin) => {
    const adminId = admin.uid || admin.id;
    try {
      await buildingService.unassignAdmin(buildingId, adminId);
      toast.success('Admin removed from building');
      fetchBuildingAdmins();
    } catch (err) {
      toast.error(err?.message || 'Failed to remove admin');
    }
  };

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

      fetchBuildingAdmins();
    } catch {
      toast.error('Failed to load building details');
    } finally {
      setLoading(false);
    }
  }, [buildingId, fetchBuildingAdmins]);

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

  useEffect(() => {
    if (tab === 6 && allAdmins.length === 0 && isSuperAdmin) {
      fetchAllAdmins();
    }
  }, [tab, allAdmins.length, fetchAllAdmins, isSuperAdmin]);

  const openAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({ roomNumber: '', floor: '', roomType: '', capacity: '', status: 'VACANT' });
    setRoomDialogOpen(true);
  };

  const openEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      roomNumber: room.roomNumber || '',
      floor: room.floor ?? '',
      roomType: room.roomType || '',
      capacity: room.capacity ?? '',
      status: room.status || 'VACANT',
    });
    setRoomDialogOpen(true);
  };

  const handleSaveRoom = async () => {
    if (!roomForm.roomNumber.trim()) { toast.error('Room number is required'); return; }
    setRoomSaving(true);
    try {
      const payload = {
        roomNumber: roomForm.roomNumber,
        buildingId,
      };
      if (roomForm.floor) payload.floor = parseInt(roomForm.floor) || 0;
      if (roomForm.roomType) payload.roomType = roomForm.roomType;
      if (roomForm.capacity) payload.capacity = parseInt(roomForm.capacity) || 0;
      if (roomForm.status) payload.status = roomForm.status;

      if (editingRoom) {
        await roomService.update(editingRoom.roomId, payload);
        toast.success('Room updated');
      } else {
        await roomService.create(payload);
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

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const vacantRooms = Math.max(0, totalRooms - occupiedRooms);
  const totalTenants = tenants.length;
  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.online).length;
  const unresolvedAlerts = alerts.filter((a) => !a.resolved).length;
  const monthlyUsage = building?.usage?.totalUsageMonth ?? analytics?.usage?.totalUsageMonth ?? 0;

  const occupancyPieData = [
    { name: 'Occupied', value: occupiedRooms },
    { name: 'Vacant', value: vacantRooms },
    { name: 'Maintenance', value: rooms.filter((r) => r.status === 'MAINTENANCE').length },
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
          <IconButton onClick={goBack} size="small"><ArrowBack /></IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>{building.name}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>{building.address}</Typography>
            {building.description && (
              <Typography variant="caption" color="text.disabled" noWrap>{building.description}</Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <StatusChip status={building.status} />
            {building.status === 'DISABLED' && (
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={handleEnable}
              disabled={enabling}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #43a047, #66BB6A)',
                boxShadow: '0 4px 16px rgba(67,160,71,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                px: 2.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #388E3C, #4CAF50)',
                  boxShadow: '0 6px 24px rgba(67,160,71,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
                  transform: 'translateY(-1px)',
                },
                '&:active': { transform: 'translateY(0)' },
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            >
              {enabling ? 'Enabling...' : 'Enable'}
            </Button>
            )}
          </Box>
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <StatCard title="Total Rooms" value={totalRooms} icon={<MeetingRoom />} color="primary" subtitle={`${vacantRooms} vacant`} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Occupied" value={occupiedRooms} icon={<People />} color="success" subtitle={`${totalTenants} tenants`} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Devices" value={totalDevices} icon={<DevicesOther />} color="info" subtitle={`${onlineDevices} online`} />
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
          <Grid item xs={6} sm={3}>
            <StatCard title="Monthly Usage" value={`${monthlyUsage.toLocaleString()} L`} icon={<WaterDrop />} color="secondary" subtitle="This month" />
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
              {isSuperAdmin && <Tab label={`Admins (${buildingAdmins.length})`} />}
            </Tabs>
          </Box>

          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Occupancy</Typography>
                    {occupancyPieData.some((d) => d.value > 0) ? (
                      <Box>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie data={occupancyPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                              {occupancyPieData.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i]} />
                              ))}
                            </Pie>
                            <ReTooltip formatter={(value, name) => [`${value} rooms`, name]} />
                          </PieChart>
                        </ResponsiveContainer>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1, flexWrap: 'wrap' }}>
                          {occupancyPieData.map((entry, i) => (
                            <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 12, height: 12, borderRadius: '3px', background: PIE_COLORS[i], flexShrink: 0 }} />
                              <Typography variant="body2" sx={{ fontSize: 13 }}>
                                {entry.name}: <strong>{entry.value}</strong>
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
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
                        { label: 'Total Tenants', value: totalTenants },
                        { label: 'Total Devices', value: totalDevices },
                        { label: 'Total Rooms', value: totalRooms },
                        { label: 'Online Devices', value: onlineDevices },
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
                onRowClick={(row) => navigate(`${basePath}/rooms/${row.roomId}`, { state: { from: location.pathname } })}
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
              onRowClick={(row) => navigate(`${basePath}/devices/${row.deviceId}`, { state: { from: location.pathname } })}
              emptyTitle="No devices"
              emptyDescription="No devices are assigned to this building."
            />
          )}

          {tab === 3 && (
            <DataTable
              columns={tenantColumns}
              rows={tenants}
              onRowClick={(row) => navigate(`${basePath}/tenants/${row.tenantId}`, { state: { from: location.pathname } })}
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
                if (!row.resolved) {
                  setDeleteTarget(row);
                  setDeleteType('alert');
                }
              }}
              emptyTitle="No alerts"
              emptyDescription="No alerts for this building."
            />
          )}

          {tab === 6 && isSuperAdmin && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" startIcon={<Add />} onClick={() => { fetchAllAdmins(); setAdminDialogOpen(true); }}>
                  Assign Admin
                </Button>
              </Box>
              <Stack spacing={2}>
                {buildingAdmins.map((admin) => (
                  <Box key={admin.uid || admin.id} sx={{
                    p: 2, borderRadius: 2, border: 1, borderColor: 'divider',
                    display: 'flex', alignItems: 'center', gap: 1.5,
                  }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Shield />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {admin.fullName || admin.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {admin.email}
                      </Typography>
                    </Box>
                    <StatusChip status={admin.status || 'ACTIVE'} />
                    <Tooltip title="Remove from building">
                      <IconButton size="small" color="error" onClick={() => handleUnassignAdmin(admin)}>
                        <PersonRemove fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
                {buildingAdmins.length === 0 && (
                  <EmptyState
                    title="No admins assigned"
                    description="No administrators are assigned to this building."
                    action={<Button variant="contained" startIcon={<Add />} onClick={() => { fetchAllAdmins(); setAdminDialogOpen(true); }}>Assign Admin</Button>}
                  />
                )}
              </Stack>
            </Box>
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
              required
            />
            <TextField
              label="Floor"
              fullWidth
              type="number"
              value={roomForm.floor}
              onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
              placeholder="e.g. 1"
            />
            <FormControl fullWidth>
              <InputLabel>Room Type</InputLabel>
              <Select
                value={roomForm.roomType}
                label="Room Type"
                onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="SINGLE">Single</MenuItem>
                <MenuItem value="DOUBLE">Double</MenuItem>
                <MenuItem value="SUITE">Suite</MenuItem>
                <MenuItem value="DORMITORY">Dormitory</MenuItem>
                <MenuItem value="STUDIO">Studio</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Capacity"
              fullWidth
              type="number"
              value={roomForm.capacity}
              onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
              placeholder="Max occupants"
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={roomForm.status}
                label="Status"
                onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
              >
                <MenuItem value="VACANT">Vacant</MenuItem>
                <MenuItem value="OCCUPIED">Occupied</MenuItem>
                <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
              </Select>
            </FormControl>
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

      {isSuperAdmin && (
        <Dialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Assign Admin to {building?.name}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Autocomplete
                options={allAdmins.filter((a) => !buildingAdmins.some((ba) => (ba.uid || ba.id) === (a.uid || a.id)))}
                getOptionLabel={(option) => `${option.fullName || option.name} (${option.email})`}
                isOptionEqualToValue={(option, value) => (option.uid || option.id) === (value.uid || value.id)}
                value={selectedAdmin}
                onChange={(_, newValue) => setSelectedAdmin(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Select Admin" placeholder="Search admins..." />
                )}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdminDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignAdmin} variant="contained" disabled={adminSaving || !selectedAdmin}>
              {adminSaving ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

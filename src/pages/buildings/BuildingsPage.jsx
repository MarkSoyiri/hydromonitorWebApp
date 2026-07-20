import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useMatch } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack, Chip, Tooltip,
  Avatar, Divider,
} from '@mui/material';
import {
  Add, Edit, Delete, Business, MeetingRoom, DevicesOther, People, CheckCircle,
  Warning, DoorFront, OnlinePrediction, ChevronRight,
} from '@mui/icons-material';
import { PageHeader, StatCard, DataTable, ConfirmDialog, StatusChip, EmptyState } from '@/components/common';
import { buildingService, roomService, deviceService, tenantService, alertService } from '@/services';
import { extractList } from '@/utils/response';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function AdminBuildingCard({ building, stats, index, onClick }) {
  const occupancy = building.occupancy || {};
  const totalRooms = occupancy.totalRooms ?? stats.totalRooms ?? 0;
  const occupiedRooms = occupancy.occupiedRooms ?? stats.occupiedRooms ?? 0;
  const vacantRooms = Math.max(0, totalRooms - occupiedRooms);
  const totalTenants = occupancy.totalTenants ?? stats.totalTenants ?? 0;
  const totalDevices = occupancy.totalDevices ?? stats.totalDevices ?? 0;
  const onlineDevices = stats.onlineDevices ?? 0;
  const activeAlerts = stats.activeAlerts ?? 0;

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={index}>
      <Card
        onClick={onClick}
        sx={{
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(135deg, #2F80ED, #00B4D8)',
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 12px 40px rgba(0,0,0,0.3)'
              : '0 12px 40px rgba(0,0,0,0.08)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #2F80ED 0%, #00B4D8 100%)',
                  boxShadow: '0 4px 12px rgba(47,128,237,0.25)',
                }}
              >
                <Business />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {building.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {building.address || 'No address'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StatusChip status={building.status} />
              <ChevronRight sx={{ color: 'text.disabled', fontSize: 18 }} />
            </Box>
          </Box>

          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {[
              { label: 'Rooms', value: totalRooms, icon: <MeetingRoom sx={{ fontSize: 14 }} />, color: '#2F80ED' },
              { label: 'Tenants', value: totalTenants, icon: <People sx={{ fontSize: 14 }} />, color: '#4CAF50' },
              { label: 'Devices', value: totalDevices, icon: <DevicesOther sx={{ fontSize: 14 }} />, color: '#FB8C00' },
              { label: 'Alerts', value: activeAlerts, icon: <Warning sx={{ fontSize: 14 }} />, color: activeAlerts > 0 ? '#E53935' : '#4CAF50' },
            ].map((item) => (
              <Grid item xs={6} key={item.label}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1, py: 0.5,
                  px: 1.5, borderRadius: 1.5,
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(0,0,0,0.02)',
                }}>
                  <Box sx={{
                    width: 24, height: 24, borderRadius: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${item.color}15`,
                    color: item.color,
                  }}>
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', lineHeight: 1 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.2 }}>
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label={`${occupiedRooms} occupied`}
              sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600, bgcolor: 'rgba(76,175,80,0.1)', color: 'success.main' }}
            />
            <Chip
              size="small"
              label={`${vacantRooms} vacant`}
              sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600, bgcolor: 'rgba(47,128,237,0.1)', color: 'primary.main' }}
            />
            <Chip
              size="small"
              label={`${onlineDevices} online`}
              sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600, bgcolor: onlineDevices > 0 ? 'rgba(76,175,80,0.1)' : 'rgba(0,0,0,0.05)', color: onlineDevices > 0 ? 'success.main' : 'text.secondary' }}
            />
          </Box>

          <Button
            variant="contained"
            fullWidth
            endIcon={<ChevronRight />}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            sx={{
              mt: 2,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              py: 1,
              background: 'linear-gradient(135deg, #2F80ED, #00B4D8)',
              boxShadow: '0 4px 12px rgba(47,128,237,0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1a6bc4, #0097b2)',
                boxShadow: '0 6px 20px rgba(47,128,237,0.35)',
              },
            }}
          >
            Manage Building
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function BuildingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, isAdmin, assignedBuildings } = useAuth();
  const basePath = isSuperAdmin ? '/super-admin' : '/admin';

  const [buildings, setBuildings] = useState([]);
  const [buildingStats, setBuildingStats] = useState({});
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

  const fetchBuildingStats = useCallback(async (buildingList) => {
    if (!buildingList.length) return;
    try {
      const [roomsRes, devicesRes, tenantsRes, alertsRes] = await Promise.allSettled([
        roomService.getAll(),
        deviceService.getAll(),
        tenantService.getAll(),
        alertService.getAll(),
      ]);

      const rooms = roomsRes.status === 'fulfilled' ? extractList(roomsRes.value.data?.data) : [];
      const devices = devicesRes.status === 'fulfilled' ? extractList(devicesRes.value.data?.data) : [];
      const tenants = tenantsRes.status === 'fulfilled' ? extractList(tenantsRes.value.data?.data) : [];
      const alerts = alertsRes.status === 'fulfilled' ? extractList(alertsRes.value.data?.data) : [];

      const stats = {};
      for (const b of buildingList) {
        const bid = b.buildingId;
        const bRooms = rooms.filter((r) => r.buildingId === bid);
        const bDevices = devices.filter((d) => d.buildingId === bid);
        const bTenants = tenants.filter((t) => t.buildingId === bid);
        const bAlerts = alerts.filter((a) => a.buildingId === bid);

        stats[bid] = {
          totalRooms: bRooms.length,
          occupiedRooms: bRooms.filter((r) => r.status === 'OCCUPIED').length,
          totalTenants: bTenants.filter((t) => t.status === 'ACTIVE').length,
          totalDevices: bDevices.length,
          onlineDevices: bDevices.filter((d) => d.online).length,
          activeAlerts: bAlerts.filter((a) => !a.resolved).length,
        };
      }
      setBuildingStats(stats);
    } catch {
      // Stats are optional
    }
  }, []);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  useEffect(() => {
    if (buildings.length > 0) {
      fetchBuildingStats(buildings);
    }
  }, [buildings, fetchBuildingStats]);

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

  const handleBuildingClick = (building) => {
    navigate(`${basePath}/buildings/${building.buildingId}`, { state: { from: location.pathname } });
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
              <IconButton
                size="small"
                disabled={enabling === row.buildingId}
                onClick={(e) => { e.stopPropagation(); handleEnable(row); }}
                sx={{
                  background: 'linear-gradient(135deg, rgba(67,160,71,0.1), rgba(102,187,106,0.05))',
                  color: 'success.main',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(67,160,71,0.2), rgba(102,187,106,0.1))',
                    boxShadow: '0 2px 8px rgba(67,160,71,0.2)',
                  },
                  '&.Mui-disabled': {
                    background: 'action.disabledBackground',
                    color: 'action.disabled',
                  },
                }}
              >
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

  if (isAdmin) {
    return (
      <Box>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <PageHeader
            title="My Buildings"
            subtitle="Manage the buildings assigned to you"
            action={isSuperAdmin}
            actionLabel="Add Building"
            onAction={openCreate}
          />
        </motion.div>

        {loading ? (
          <Grid container spacing={2.5}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card sx={{ height: 320 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'action.hover' }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ height: 20, width: '60%', bgcolor: 'action.hover', borderRadius: 1, mb: 0.5 }} />
                        <Box sx={{ height: 14, width: '40%', bgcolor: 'action.hover', borderRadius: 1 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : buildings.length === 0 ? (
          <EmptyState
            title="No buildings assigned"
            description="No buildings have been assigned to your account yet. Contact your Super Admin to get started."
            icon={<Business sx={{ fontSize: 56 }} />}
          />
        ) : (
          <Grid container spacing={2.5}>
            {buildings.map((building, index) => (
              <Grid item xs={12} sm={6} md={4} key={building.buildingId}>
                <AdminBuildingCard
                  building={building}
                  stats={buildingStats[building.buildingId] || {}}
                  index={index}
                  onClick={() => handleBuildingClick(building)}
                />
              </Grid>
            ))}
          </Grid>
        )}

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
          onRowClick={(row) => navigate(`${basePath}/buildings/${row.buildingId}`, { state: { from: location.pathname } })}
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

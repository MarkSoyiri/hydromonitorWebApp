import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, Tabs, Tab, Chip,
} from '@mui/material';
import { Edit, ArrowBack, MeetingRoom, DevicesOther, People, WaterDrop } from '@mui/icons-material';
import { StatCard, PageHeader, StatusChip, DataTable } from '@/components/common';
import { apiGet } from '@/services/api';
import { ENDPOINTS, buildingPath } from '@/constants';
import { extractList } from '@/utils/response';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const roomColumns = [
  { field: 'roomNumber', label: 'Room', width: 100 },
  { field: 'floor', label: 'Floor', width: 80, align: 'center' },
  { field: 'status', label: 'Status', width: 100, render: (r) => <StatusChip status={r.status} /> },
  { field: 'tenantId', label: 'Tenant', width: 150, render: (r) => r.tenantId || '—' },
];

export function BuildingDetailPage() {
  const { buildingId } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const fetchBuilding = useCallback(async () => {
    try {
      const [bRes, rRes] = await Promise.all([
        apiGet(buildingPath(buildingId)),
        apiGet(ENDPOINTS.ROOMS, { buildingId }),
      ]);
      if (bRes.data?.success) {
        setBuilding({ ...bRes.data.data, buildingId });
      }
      if (rRes.data?.success) {
        setRooms(extractList(rRes.data.data));
      }
    } catch {
      toast.error('Failed to load building details');
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  useEffect(() => { fetchBuilding(); }, [fetchBuilding]);

  if (loading) return <PageHeader title="Loading..." />;
  if (!building) return <PageHeader title="Building not found" />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/buildings')}><ArrowBack /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{building.name}</Typography>
          <Typography variant="body2" color="text.secondary">{building.address}</Typography>
        </Box>
        <StatusChip status={building.status} />
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard title="Rooms" value={building.occupancy?.totalRooms ?? 0} icon={<MeetingRoom />} color="primary" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Occupied" value={building.occupancy?.occupiedRooms ?? 0} icon={<People />} color="success" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Devices" value={building.occupancy?.totalDevices ?? 0} icon={<DevicesOther />} color="info" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Usage Today" value={`${(building.usage?.totalUsageToday || 0).toLocaleString()} L`} icon={<WaterDrop />} color="warning" />
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Rooms</Typography>
          <DataTable
            columns={roomColumns}
            rows={rooms}
            onRowClick={(row) => navigate(`/rooms/${row.roomId}`)}
            emptyTitle="No rooms"
          />
        </CardContent>
      </Card>
    </Box>
  );
}

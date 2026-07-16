import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, IconButton, Stack,
} from '@mui/material';
import { ArrowBack, WaterDrop, MeetingRoom, Receipt, People } from '@mui/icons-material';
import { StatCard, StatusChip, LoadingScreen } from '@/components/common';
import { tenantService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export function TenantDetailPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const basePath = isSuperAdmin ? '/super-admin' : '/admin';
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTenant = useCallback(async () => {
    try {
      const { data } = await tenantService.getById(tenantId);
      if (data?.success) {
        setTenant({ ...data.data, uid: tenantId });
      }
    } catch {
      toast.error('Failed to load tenant');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchTenant(); }, [fetchTenant]);

  if (loading) return <LoadingScreen />;
  if (!tenant) return <Typography>Tenant not found</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <IconButton onClick={() => navigate(`${basePath}/tenants`)}><ArrowBack /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{tenant.fullName}</Typography>
          <Typography variant="body2" color="text.secondary">{tenant.email} · {tenant.phoneNumber || 'No phone'}</Typography>
        </Box>
        <StatusChip status={tenant.status} />
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={6} sm={3}>
          <StatCard title="Monthly Usage" value={`${(tenant.usage?.totalUsageMonth || 0).toLocaleString()} L`} icon={<WaterDrop />} color="primary" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Current Bill" value={`GHS ${(tenant.billing?.currentBill || 0).toLocaleString()}`} icon={<Receipt />} color="warning" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Room" value={tenant.roomId || 'Not assigned'} icon={<MeetingRoom />} color="info" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Building" value={tenant.buildingId || '—'} icon={<People />} color="success" />
        </Grid>
      </Grid>
    </Box>
  );
}

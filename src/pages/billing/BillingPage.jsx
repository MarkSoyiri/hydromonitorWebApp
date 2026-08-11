import { useState, useEffect, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, Stack, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { Download, Print, Description } from '@mui/icons-material';
import { PageHeader, StatCard } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { NODES, useRealtimeValue, useRealtimeMap } from '@/services/realtime';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const statusColors = { PAID: 'success', PENDING: 'warning', OVERDUE: 'error' };

export function BillingPage() {
  const { profile, isSuperAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  const usersState = useRealtimeMap(NODES.users);
  const billingState = useRealtimeMap(NODES.billingHistory);
  const rateLive = useRealtimeValue(`${NODES.rates}/current`);
  const pricePerUnit = rateLive.value?.pricePerUnit ?? 0;

  const scopedBuildingIds = useMemo(() => {
    if (isSuperAdmin || !profile?.buildingIds) return null;
    return new Set(Object.keys(profile.buildingIds));
  }, [isSuperAdmin, profile?.buildingIds]);

  const tenants = useMemo(
    () => Object.values(usersState.data || {}).filter((u) => u?.role === 'TENANT'),
    [usersState.data]
  );

  const scopedTenants = useMemo(
    () => (scopedBuildingIds ? tenants.filter((t) => scopedBuildingIds.has(t.buildingId)) : tenants),
    [scopedBuildingIds, tenants]
  );

  // billingHistory is keyed by tenant UID (not building ID), so scope it by
  // the tenant UIDs that belong to this admin's buildings.
  const scopedTenantUids = useMemo(() => {
    if (isSuperAdmin) return null;
    const buildings = new Set(Object.keys(profile?.buildingIds || {}));
    return new Set(
      Object.entries(usersState.data || {})
        .filter(([, u]) => u?.role === 'TENANT' && buildings.has(u.buildingId))
        .map(([uid]) => uid)
    );
  }, [isSuperAdmin, profile?.buildingIds, usersState.data]);

  const tenantNameByUid = useMemo(() => {
    const map = {};
    Object.entries(usersState.data || {}).forEach(([uid, u]) => {
      const name = u?.fullName || (u?.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : '');
      map[uid] = name || u?.email || uid;
    });
    return map;
  }, [usersState.data]);

  const billingHistory = useMemo(() => {
    const rows = [];
    Object.entries(billingState.data || {}).forEach(([tenantId, entries]) => {
      if (scopedTenantUids && !scopedTenantUids.has(tenantId)) return;
      Object.values(entries || {}).forEach((p) => {
        if (!p || typeof p !== 'object') return;
        const at = p.recordedAt || 0;
        rows.push({
          ...p,
          tenantId,
          tenantName: tenantNameByUid[tenantId],
          status: 'PAID',
          amount: p.amount || 0,
          period: at ? dayjs(at).format('MMM YYYY') : '',
          date: at ? dayjs(at).format('MMM D, YYYY') : '',
        });
      });
    });
    return rows.sort((a, b) => (b.recordedAt || 0) - (a.recordedAt || 0));
  }, [billingState.data, scopedTenantUids, tenantNameByUid]);

  const stats = useMemo(() => {
    const total = billingHistory.reduce((s, i) => s + (i.amount || 0), 0);
    return {
      total,
      paid: billingHistory.filter((i) => i.status === 'PAID').reduce((s, i) => s + (i.amount || 0), 0),
      pending: 0,
      overdue: 0,
    };
  }, [billingHistory]);

  const monthUsage = scopedTenants.reduce((s, t) => s + (t.usage?.totalUsageMonth || t.billing?.monthUsage || 0), 0);
  const storedBills = scopedTenants.reduce((s, t) => s + (t.billing?.currentBill || 0), 0);
  const billAmount = storedBills > 0 ? storedBills : monthUsage * pricePerUnit;
  const currentBill = {
    amount: billAmount,
    status: billAmount > 0 ? 'PENDING' : 'PAID',
  };

  const exportCsv = () => {
    const header = ['Tenant', 'Period', 'Amount (GHS)', 'Status', 'Method', 'Date'];
    const rows = billingHistory.map((p) => [
      p.tenantName || p.tenantId || '',
      p.period || '',
      p.amount || 0,
      p.status || 'PAID',
      p.method || '',
      p.date || '',
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'billing_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (profile && usersState.loaded && billingState.loaded && rateLive.loaded) setLoading(false);
  }, [profile, usersState.loaded, billingState.loaded, rateLive.loaded, authLoading]);

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <PageHeader title="Billing" subtitle="Invoice and payment management" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          <Grid item xs={6} sm={3}>
            <StatCard title="Total Revenue" value={`GHS ${stats.total.toLocaleString()}`} icon={<Description />} color="primary" loading={loading} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Paid" value={`GHS ${stats.paid.toLocaleString()}`} icon={<Description />} color="success" loading={loading} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Pending" value={`GHS ${stats.pending.toLocaleString()}`} icon={<Description />} color="warning" loading={loading} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Overdue" value={`GHS ${stats.overdue.toLocaleString()}`} icon={<Description />} color="error" loading={loading} />
          </Grid>
        </Grid>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
        {currentBill && (
          <Card sx={{ mb: { xs: 2, sm: 2.5 } }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>Current Bill</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                GHS {(currentBill.amount || currentBill.totalAmount || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: <Chip label={currentBill.status || 'PENDING'} color={statusColors[currentBill.status] || 'default'} size="small" sx={{ ml: 0.5 }} />
              </Typography>
            </CardContent>
          </Card>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.3 }}>
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>Billing History</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" startIcon={<Description />} fullWidth={true} onClick={exportCsv}>Export CSV</Button>
              </Stack>
            </Box>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">Loading billing data...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : billingHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No billing records found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : billingHistory.map((item, idx) => (
                    <TableRow key={item.id || item.period || idx} hover>
                      <TableCell><Typography variant="body2" fontWeight={500}>{item.tenantName || item.tenantId || '—'}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={500}>{item.period || item.month || '—'}</Typography></TableCell>
                      <TableCell align="right">GHS {(item.amount || item.totalAmount || 0).toLocaleString()}</TableCell>
                      <TableCell><Chip label={item.status || 'PENDING'} color={statusColors[item.status] || 'default'} size="small" /></TableCell>
                      <TableCell>{item.date || item.createdAt ? dayjs(item.date || item.createdAt).format('MMM D, YYYY') : '—'}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small"><Download /></IconButton>
                        <IconButton size="small"><Print /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

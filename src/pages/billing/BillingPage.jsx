import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, Stack, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert,
} from '@mui/material';
import { Download, Print, Description } from '@mui/icons-material';
import { PageHeader, StatCard } from '@/components/common';
import { billingService } from '@/services';
import { extractList } from '@/utils/response';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const statusColors = { PAID: 'success', PENDING: 'warning', OVERDUE: 'error' };

export function BillingPage() {
  const [billingHistory, setBillingHistory] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const [historyRes, billRes] = await Promise.allSettled([
          billingService.getHistory(),
          billingService.getCurrentBill(),
        ]);

        if (!mounted) return;

        if (historyRes.status === 'fulfilled') {
          const data = historyRes.value.data;
          if (data?.success) {
            const list = extractList(data.data);
            setBillingHistory(list);
            setStats({
              total: list.reduce((s, i) => s + (i.amount || 0), 0),
              paid: list.filter((i) => i.status === 'PAID').reduce((s, i) => s + (i.amount || 0), 0),
              pending: list.filter((i) => i.status === 'PENDING').reduce((s, i) => s + (i.amount || 0), 0),
              overdue: list.filter((i) => i.status === 'OVERDUE').reduce((s, i) => s + (i.amount || 0), 0),
            });
          }
        } else {
          setError(historyRes.reason?.message || 'Failed to load billing history');
        }

        if (billRes.status === 'fulfilled' && billRes.value.data?.success) {
          setCurrentBill(billRes.value.data.data);
        }
      } catch (err) {
        if (mounted) setError(err?.message || 'Failed to load billing data');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <PageHeader title="Billing" subtitle="Invoice and payment management" />
      </motion.div>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
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
          <Card sx={{ mb: 2.5 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Current Bill</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Billing History</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" startIcon={<Description />}>Export CSV</Button>
              </Stack>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
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
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">Loading billing data...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : billingHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No billing records found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : billingHistory.map((item, idx) => (
                    <TableRow key={item.id || item.period || idx} hover>
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

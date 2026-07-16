import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip, List, ListItem, ListItemText, ListItemIcon, Divider, Skeleton } from '@mui/material';
import { Payment, CheckCircle, Schedule } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { billingService } from '@/services';
import { extractList } from '@/utils/response';

export function PaymentsPage() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await billingService.getHistory();
        if (!cancelled && data?.success) {
          setPayments(extractList(data.data));
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const totalPaid = profile?.billing?.totalPaid ?? 0;
  const outstandingBalance = profile?.billing?.outstandingBalance ?? 0;
  const successfulPayments = payments.filter((p) => p.status === 'PAID' || p.status === 'Paid').length;

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={36} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={250} height={20} sx={{ mb: 3 }} />
        <Grid container spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Card sx={{ borderRadius: 3 }}><CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Skeleton variant="circular" width={32} height={32} sx={{ mx: 'auto', mb: 1 }} />
                <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
              </CardContent></Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Payment History</Typography>
          <Typography variant="body2" color="text.secondary">Track all your water bill payments</Typography>
        </Box>
      </motion.div>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{successfulPayments}</Typography>
              <Typography variant="body2" color="text.secondary">Successful Payments</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
              <Payment sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>GHS {totalPaid.toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">Total Paid (YTD)</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>GHS {outstandingBalance.toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">Pending Payment</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>All Payments</Typography>
          {payments.length > 0 ? (
            <List sx={{ p: 0 }}>
              {payments.map((p, i) => (
                <Box key={i}>
                  <ListItem sx={{ px: 0, py: 1.2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Payment sx={{ color: (p.status === 'PAID' || p.status === 'Paid') ? 'success.main' : 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{p.date || p.billDate || ''}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>GHS {(p.amount || p.totalAmount || 0).toFixed(2)}</Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {(p.status === 'PAID' || p.status === 'Paid') ? `${p.method || 'Paid'}` : 'Awaiting payment'}
                          </Typography>
                          <Chip label={p.status || 'PENDING'} size="small" color={(p.status === 'PAID' || p.status === 'Paid') ? 'success' : 'warning'} sx={{ height: 18, fontSize: '0.6rem' }} />
                        </Box>
                      }
                    />
                  </ListItem>
                  {i < payments.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No payments found</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

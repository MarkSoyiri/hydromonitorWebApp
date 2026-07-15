import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Chip, List, ListItem, ListItemText, ListItemIcon, Divider, Skeleton } from '@mui/material';
import { Receipt, Payment as PaymentIcon, Download } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { billingService } from '@/services';

const fallbackBills = [
  { id: 'INV-2026-06', period: '1 - 30 Jun 2026', amount: 128.50, usage: 2340, status: 'Pending', dueDate: '15 Jun 2026', tariff: 0.055 },
  { id: 'INV-2026-05', period: '1 - 31 May 2026', amount: 142.00, usage: 2580, status: 'Paid', dueDate: '15 May 2026', paidOn: '05 May 2026' },
  { id: 'INV-2026-04', period: '1 - 30 Apr 2026', amount: 115.80, usage: 2105, status: 'Paid', dueDate: '15 Apr 2026', paidOn: '04 Apr 2026' },
  { id: 'INV-2026-03', period: '1 - 31 Mar 2026', amount: 98.40, usage: 1790, status: 'Paid', dueDate: '15 Mar 2026', paidOn: '03 Mar 2026' },
];

export function BillsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [currentRes, historyRes] = await Promise.allSettled([
          billingService.getCurrentBill(),
          billingService.getHistory(),
        ]);
        if (!cancelled) {
          const current = currentRes.status === 'fulfilled' ? currentRes.value?.data?.data : null;
          const history = historyRes.status === 'fulfilled' ? (historyRes.value?.data?.data || []) : [];
          const billList = Array.isArray(history) ? history : [];
          if (current) {
            billList.unshift(current);
          }
          setBills(billList.length > 0 ? billList : fallbackBills);
        }
      } catch {
        if (!cancelled) setBills(fallbackBills);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const currentBill = profile?.billing?.currentBill ?? 128.50;
  const totalPaid = profile?.billing?.totalPaid ?? 356.20;

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={36} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={250} height={20} sx={{ mb: 3 }} />
        <Grid container spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Card sx={{ borderRadius: 3 }}><CardContent sx={{ p: 2.5 }}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="60%" sx={{ mt: 1 }} />
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
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Bills & Payments</Typography>
          <Typography variant="body2" color="text.secondary">View and manage your water bills</Typography>
        </Box>
      </motion.div>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #2F80ED 0%, #00B4D8 100%)', color: '#fff' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>CURRENT BILL</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>GHS {currentBill.toFixed(2)}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Current period</Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" fullWidth sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }} endIcon={<PaymentIcon />}>
                  Pay Now
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>LAST PAYMENT</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>GHS {totalPaid.toFixed(2)}</Typography>
              <Typography variant="caption" color="text.secondary">Total paid (YTD)</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>OUTSTANDING</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: (profile?.billing?.outstandingBalance ?? 0) > 0 ? 'error.main' : 'success.main' }}>
                GHS {(profile?.billing?.outstandingBalance ?? 0).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">{profile?.billing?.outstandingBalance > 0 ? 'Due for payment' : 'All paid'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Bill History</Typography>
          {bills.length > 0 ? (
            <List sx={{ p: 0 }}>
              {bills.map((bill, i) => (
                <Box key={bill.id || i}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Receipt sx={{ color: bill.status === 'Paid' ? 'success.main' : 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{bill.id || `Bill #${i + 1}`}</Typography>
                            <Typography variant="caption" color="text.secondary">{bill.period || bill.date || ''}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>GHS {bill.amount?.toFixed(2) || '0.00'}</Typography>
                            {bill.usage && <Typography variant="caption" color="text.secondary">{bill.usage.toLocaleString()} L used</Typography>}
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <Chip label={bill.status} size="small" color={bill.status === 'Paid' ? 'success' : 'warning'} sx={{ height: 20, fontSize: '0.6rem' }} />
                            <Typography variant="caption" color="text.secondary">Due: {bill.dueDate || ''}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Button size="small" variant="outlined" startIcon={<Download />} sx={{ fontSize: '0.7rem' }}>
                              Invoice
                            </Button>
                            {bill.status === 'Pending' && (
                              <Button size="small" variant="contained" startIcon={<PaymentIcon />} sx={{ fontSize: '0.7rem' }}>
                                Pay
                              </Button>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {i < bills.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No bills found</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

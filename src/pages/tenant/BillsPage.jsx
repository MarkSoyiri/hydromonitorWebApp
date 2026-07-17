import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Chip, List, ListItem, ListItemText, ListItemIcon, Divider, Skeleton } from '@mui/material';
import { Receipt, Payment as PaymentIcon, Download } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { billingService } from '@/services';
import { extractList } from '@/utils/response';

export function BillsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [bills, setBills] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);
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
          const current = currentRes.status === 'fulfilled' && currentRes.value?.data?.success
            ? currentRes.value.data.data : null;
          const history = historyRes.status === 'fulfilled' && historyRes.value?.data?.success
            ? extractList(historyRes.value.data.data) : [];
          if (current) {
            setCurrentBill(current);
            setBills([current, ...history]);
          } else {
            setBills(history);
          }
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

  const currentBillAmount = currentBill?.amount ?? profile?.billing?.currentBill ?? 0;
  const totalPaid = profile?.billing?.totalPaid ?? 0;
  const outstandingBalance = currentBill?.outstandingBalance ?? profile?.billing?.outstandingBalance ?? 0;

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

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #2F80ED 0%, #00B4D8 100%)', color: '#fff' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>CURRENT BILL</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>GHS {currentBillAmount.toFixed(2)}</Typography>
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
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: outstandingBalance > 0 ? 'error.main' : 'success.main' }}>
                  GHS {outstandingBalance.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">{outstandingBalance > 0 ? 'Due for payment' : 'All paid'}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Bill History</Typography>
          {bills.length > 0 ? (
            <List sx={{ p: 0 }}>
              {bills.map((bill, i) => (
                <Box key={bill.billId || bill.id || i}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Receipt sx={{ color: bill.status === 'PAID' ? 'success.main' : 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{bill.billId || bill.id || `Bill #${i + 1}`}</Typography>
                            <Typography variant="caption" color="text.secondary">{bill.period || bill.billDate || ''}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>GHS {(bill.amount || bill.totalAmount || 0).toFixed(2)}</Typography>
                            {bill.usage && <Typography variant="caption" color="text.secondary">{bill.usage.toLocaleString()} L used</Typography>}
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <Chip label={bill.status || 'PENDING'} size="small" color={bill.status === 'PAID' ? 'success' : 'warning'} sx={{ height: 20, fontSize: '0.6rem' }} />
                            <Typography variant="caption" color="text.secondary">Due: {bill.dueDate || ''}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Button size="small" variant="outlined" startIcon={<Download />} sx={{ fontSize: '0.7rem' }}>
                              Invoice
                            </Button>
                            {bill.status !== 'PAID' && (
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
      </motion.div>
    </Box>
  );
}

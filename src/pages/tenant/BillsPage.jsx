import { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Chip, List, ListItem, ListItemText, ListItemIcon, Divider, Skeleton } from '@mui/material';
import { Receipt, Payment as PaymentIcon, Download, Verified } from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  NODES, useRealtimeValue, useRealtimeMap,
} from '@/services/realtime';
import { paymentService } from '@/services/paymentService';
import dayjs from 'dayjs';

export function BillsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pendingRef, setPendingRef] = useState(null);

  const tenantUid = profile?.uid || profile?.currentUser?.uid;

  const userLive = useRealtimeValue(tenantUid ? `${NODES.users}/${tenantUid}` : null);
  const liveUser = userLive.value;
  const liveProfile = liveUser ? { ...profile, ...liveUser, uid: tenantUid } : profile;

  const rateLive = useRealtimeValue(`${NODES.rates}/current`);
  const pricePerUnit = rateLive.value?.pricePerUnit ?? 0;

  const billingMap = useRealtimeMap(tenantUid ? `${NODES.billingHistory}/${tenantUid}` : null);
  const paymentList = (Object.values(billingMap.data || {}) || [])
    .filter((p) => p && typeof p === 'object')
    .map((p) => ({
      ...p,
      billId: p.paymentId,
      id: p.paymentId,
      status: 'PAID',
      amount: p.amount || 0,
      period: p.recordedAt ? dayjs(p.recordedAt).format('MMM D, YYYY') : '',
      billDate: p.recordedAt ? dayjs(p.recordedAt).format('MMM D, YYYY') : '',
    }))
    .sort((a, b) => (b.recordedAt || 0) - (a.recordedAt || 0));

  // Mirrors the backend's getTenantBillData: usage falls back to
  // billing.monthUsage, the billed amount prefers billing.currentBill when
  // present, and outstanding prefers the stored value.
  const currentUsage = liveProfile?.usage?.totalUsageMonth ?? liveProfile?.billing?.monthUsage ?? 0;
  const currentBillAmount = liveProfile?.billing?.currentBill > 0
    ? liveProfile?.billing?.currentBill
    : currentUsage * pricePerUnit;
  const totalPaid = liveProfile?.billing?.totalPaid ?? 0;
  const storedOutstanding = liveProfile?.billing?.outstandingBalance ?? 0;
  const outstandingBalance = storedOutstanding > 0
    ? storedOutstanding
    : Math.max(currentBillAmount - totalPaid, 0);

  const currentBill = {
    billId: 'current',
    id: 'current',
    status: outstandingBalance > 0 ? 'PENDING' : 'PAID',
    amount: currentBillAmount,
    period: 'Current period',
    billDate: 'Current period',
    usage: currentUsage,
  };

  const bills = [currentBill, ...paymentList];

  useEffect(() => {
    if (profile && userLive.loaded) setLoading(false);
  }, [profile, userLive.loaded]);

  const verifyPending = useCallback(async (reference, quiet = false) => {
    if (!reference) return;
    setVerifying(true);
    try {
      const res = await paymentService.verify(reference);
      const status = res?.data?.data?.status;
      if (status === 'PAID') {
        setPendingRef(null);
        toast.success('Payment received. Thank you!');
      } else if (!quiet) {
        toast(status === 'PENDING'
          ? 'Payment is still being confirmed. It will appear shortly.'
          : `Payment status: ${status || 'UNKNOWN'}`);
      }
    } catch (err) {
      if (!quiet) toast.error(err?.message || 'Could not verify payment.');
    } finally {
      setVerifying(false);
    }
  }, []);

  const handlePay = useCallback(async () => {
    if (paying) return;
    setPaying(true);
    let checkoutWindow = null;
    try {
      checkoutWindow = window.open('', '_blank');
      const res = await paymentService.initialize();
      const data = res?.data?.data;
      const reference = data?.payment?.reference;
      const url = data?.authorizationUrl;
      if (!reference || !url) {
        checkoutWindow?.close();
        toast.error('Payment could not be initialized.');
        return;
      }
      setPendingRef(reference);
      toast('Complete payment in the new tab, then come back here to confirm.', { duration: 5000 });
      if (checkoutWindow) {
        checkoutWindow.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      checkoutWindow?.close();
      toast.error(err?.message || 'Payment unavailable right now.');
    } finally {
      setPaying(false);
    }
  }, [paying]);

  useEffect(() => {
    if (!pendingRef) return undefined;
    const onFocus = () => verifyPending(pendingRef, true);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [pendingRef, verifyPending]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('reference') || params.get('trxref');
    if (ref) {
      verifyPending(ref, true);
      params.delete('reference');
      params.delete('trxref');
      const qs = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''));
    }
  }, [verifyPending]);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={36} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={250} height={20} sx={{ mb: 3 }} />
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Card sx={{ borderRadius: 3 }}><CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
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
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Bills & Payments</Typography>
          <Typography variant="body2" color="text.secondary">View and manage your water bills</Typography>
        </Box>
      </motion.div>

      {pendingRef && (
        <Card sx={{ borderRadius: 3, mb: 3, bgcolor: 'warning.light', color: 'warning.dark' }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Payment {pendingRef} started in a new tab. Finished there? Confirm below.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" color="warning" startIcon={verifying ? null : <Verified />} onClick={() => verifyPending(pendingRef)} disabled={verifying}>
                {verifying ? 'Checking…' : "I've paid — confirm"}
              </Button>
              <Button size="small" variant="outlined" onClick={() => setPendingRef(null)}>Dismiss</Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #2F80ED 0%, #00B4D8 100%)', color: '#fff' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>CURRENT BILL</Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, fontSize: { xs: '1.75rem', sm: '3rem' } }}>GHS {currentBillAmount.toFixed(2)}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Current period</Typography>
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" fullWidth sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }} endIcon={<PaymentIcon />} onClick={handlePay} disabled={paying || outstandingBalance <= 0}>
                    {paying ? 'Starting…' : 'Pay Now'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>LAST PAYMENT</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>GHS {totalPaid.toFixed(2)}</Typography>
                <Typography variant="caption" color="text.secondary">Total paid (YTD)</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>OUTSTANDING</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, fontSize: { xs: '1.5rem', sm: '2.125rem' }, color: outstandingBalance > 0 ? 'error.main' : 'success.main' }}>
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
          <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Bill History</Typography>
          {bills.length > 0 ? (
            <List sx={{ p: 0 }}>
              {bills.map((bill, i) => (
                <Box key={bill.billId || bill.id || i}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                      <Receipt sx={{ color: bill.status === 'PAID' ? 'success.main' : 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, minWidth: 0 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>{bill.billId || bill.id || `Bill #${i + 1}`}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>{bill.period || bill.billDate || ''}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>GHS {(bill.amount || bill.totalAmount || 0).toFixed(2)}</Typography>
                            {bill.usage && <Typography variant="caption" color="text.secondary">{bill.usage.toLocaleString()} L used</Typography>}
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mt: 0.5, gap: { xs: 1, sm: 0 } }}>
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap', minWidth: 0 }}>
                            <Chip label={bill.status || 'PENDING'} size="small" color={bill.status === 'PAID' ? 'success' : 'warning'} sx={{ height: 20, fontSize: '0.6rem' }} />
                            <Typography variant="caption" color="text.secondary">Due: {bill.dueDate || ''}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            <Button size="small" variant="outlined" startIcon={<Download />} sx={{ fontSize: '0.7rem', width: { xs: '100%', sm: 'auto' } }}>
                              Invoice
                            </Button>
                            {bill.status !== 'PAID' && (
                              <Button size="small" variant="contained" startIcon={<PaymentIcon />} sx={{ fontSize: '0.7rem', width: { xs: '100%', sm: 'auto' } }} onClick={handlePay} disabled={paying}>
                                {paying ? 'Starting…' : 'Pay'}
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

import { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Chip, Button, List, ListItem, ListItemText, ListItemIcon, Divider, Skeleton } from '@mui/material';
import { Description, Download } from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  NODES, useRealtimeMap,
} from '@/services/realtime';
import { billingService } from '@/services/billingService';
import { saveBlob } from '@/services/download';
import dayjs from 'dayjs';

export function InvoicesPage() {
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  const tenantUid = profile?.uid || profile?.currentUser?.uid;
  const billingMap = useRealtimeMap(tenantUid ? `${NODES.billingHistory}/${tenantUid}` : null);

  const invoices = (Object.entries(billingMap.data || {}) || [])
    .filter(([, p]) => p && typeof p === 'object')
    .map(([key, p]) => ({
      ...p,
      billId: p.paymentId || key,
      id: p.paymentId || key,
      paymentId: p.paymentId || key,
      status: 'PAID',
      amount: p.amount || 0,
      date: p.recordedAt ? dayjs(p.recordedAt).format('MMM D, YYYY') : '',
      billDate: p.recordedAt ? dayjs(p.recordedAt).format('MMM D, YYYY') : '',
    }))
    .sort((a, b) => (b.recordedAt || 0) - (a.recordedAt || 0));

  useEffect(() => {
    if (profile && billingMap.loaded) setLoading(false);
  }, [profile, billingMap.loaded, authLoading]);

  const handleDownload = useCallback(async (paymentId) => {
    setDownloading(paymentId);
    try {
      const res = await billingService.downloadPaymentInvoice(paymentId);
      saveBlob(res, paymentId);
      toast.success('Receipt downloaded.');
    } catch (err) {
      toast.error(err?.message || 'Could not download the receipt.');
    } finally {
      setDownloading(null);
    }
  }, []);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={36} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={250} height={20} sx={{ mb: 3 }} />
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i}>
                <Skeleton variant="text" width="100%" height={40} sx={{ my: 1 }} />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Invoices</Typography>
          <Typography variant="body2" color="text.secondary">Download your water usage invoices</Typography>
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Invoice History</Typography>
          {invoices.length > 0 ? (
            <List sx={{ p: 0 }}>
              {invoices.map((inv, i) => (
                <Box key={inv.billId || inv.id || i}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Description sx={{ color: (inv.status === 'PAID' || inv.status === 'Paid') ? 'success.main' : 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{inv.billId || inv.id || `Invoice #${i + 1}`}</Typography>
                            <Typography variant="caption" color="text.secondary">{inv.billDate || inv.date || ''}{inv.usage ? ` · ${inv.usage.toLocaleString()} L` : ''}</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>GHS {(inv.amount || inv.totalAmount || 0).toFixed(2)}</Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip label={inv.status || 'PENDING'} size="small" color={(inv.status === 'PAID' || inv.status === 'Paid') ? 'success' : 'warning'} sx={{ height: 20, fontSize: '0.6rem' }} />
                            <Typography variant="caption" color="text.secondary">Due: {inv.dueDate || ''}</Typography>
                          </Box>
                          <Button size="small" startIcon={<Download />} variant="outlined" sx={{ fontSize: '0.7rem' }} onClick={() => handleDownload(inv.paymentId)} disabled={downloading === inv.paymentId}>
                            {downloading === inv.paymentId ? '…' : 'PDF'}
                          </Button>
                        </Box>
                      }
                    />
                  </ListItem>
                  {i < invoices.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Description sx={{ color: 'text.disabled', fontSize: 40, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">No invoices found</Typography>
            </Box>
          )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

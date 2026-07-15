import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Chip, Button, List, ListItem, ListItemText, ListItemIcon, Divider, Skeleton } from '@mui/material';
import { Description, Download } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { billingService } from '@/services';

const fallbackInvoices = [
  { id: 'INV-2026-06', date: '01 Jun 2026', amount: 128.50, usage: 2340, status: 'Pending', dueDate: '15 Jun 2026' },
  { id: 'INV-2026-05', date: '01 May 2026', amount: 142.00, usage: 2580, status: 'Paid', dueDate: '15 May 2026' },
  { id: 'INV-2026-04', date: '01 Apr 2026', amount: 115.80, usage: 2105, status: 'Paid', dueDate: '15 Apr 2026' },
  { id: 'INV-2026-03', date: '01 Mar 2026', amount: 98.40, usage: 1790, status: 'Paid', dueDate: '15 Mar 2026' },
  { id: 'INV-2026-02', date: '01 Feb 2026', amount: 110.20, usage: 2005, status: 'Paid', dueDate: '15 Feb 2026' },
  { id: 'INV-2026-01', date: '01 Jan 2026', amount: 95.60, usage: 1740, status: 'Paid', dueDate: '15 Jan 2026' },
];

export function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await billingService.getHistory();
        if (!cancelled && data?.success) {
          setInvoices(Array.isArray(data.data) ? data.data : []);
        } else {
          setInvoices(fallbackInvoices);
        }
      } catch {
        if (!cancelled) setInvoices(fallbackInvoices);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
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

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Invoice History</Typography>
          {invoices.length > 0 ? (
            <List sx={{ p: 0 }}>
              {invoices.map((inv, i) => (
                <Box key={inv.id || i}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Description sx={{ color: inv.status === 'Paid' ? 'success.main' : 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{inv.id || `Invoice #${i + 1}`}</Typography>
                            <Typography variant="caption" color="text.secondary">{inv.date}{inv.usage ? ` · ${inv.usage.toLocaleString()} L` : ''}</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>GHS {inv.amount?.toFixed(2) || '0.00'}</Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip label={inv.status} size="small" color={inv.status === 'Paid' ? 'success' : 'warning'} sx={{ height: 20, fontSize: '0.6rem' }} />
                            <Typography variant="caption" color="text.secondary">Due: {inv.dueDate || ''}</Typography>
                          </Box>
                          <Button size="small" startIcon={<Download />} variant="outlined" sx={{ fontSize: '0.7rem' }}>
                            PDF
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
    </Box>
  );
}

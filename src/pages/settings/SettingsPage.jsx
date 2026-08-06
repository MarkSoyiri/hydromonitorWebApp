import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button, Switch,
  FormControlLabel, Stack, Alert, Select, MenuItem, FormControl, InputLabel,
  Skeleton,
} from '@mui/material';
import { PageHeader } from '@/components/common';
import { ratesService } from '@/services';
import { NODES, useRealtimeValue } from '@/services/realtime';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const [waterRate, setWaterRate] = useState(0.05);
  const [currency, setCurrency] = useState('GHS');
  const [leakThreshold, setLeakThreshold] = useState(10);
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dirty, setDirty] = useState(false);

  const rateLive = useRealtimeValue(`${NODES.rates}/current`);
  const liveRate = rateLive.value;

  useEffect(() => {
    if (!rateLive.loaded || dirty || !liveRate) return;
    if (liveRate.pricePerUnit !== undefined) setWaterRate(liveRate.pricePerUnit);
    if (liveRate.currency) setCurrency(liveRate.currency);
    if (liveRate.leakThreshold !== undefined) setLeakThreshold(liveRate.leakThreshold);
    setLoading(false);
  }, [rateLive.loaded, liveRate, dirty]);

  const markDirty = (updater) => {
    setDirty(true);
    updater();
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await ratesService.update({
        pricePerUnit: waterRate,
        currency,
        leakThreshold,
      });
      setDirty(false);
      toast.success('Settings saved');
    } catch (err) {
      setError(err?.message || 'Failed to save settings');
      toast.error(err?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Settings" subtitle="System configuration" />
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <Card>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Skeleton variant="text" width={120} height={30} />
                  <Skeleton variant="rounded" width="100%" height={120} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: 0, wordBreak: 'break-word' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <PageHeader title="Settings" subtitle="System configuration" />
      </motion.div>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Water Rates</Typography>
                <Stack spacing={2}>
                  <TextField label="Rate per Liter" type="number" value={waterRate}
                    onChange={(e) => markDirty(() => setWaterRate(parseFloat(e.target.value) || 0))}
                    InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>{currency}</Typography> }} />
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select value={currency} label="Currency" onChange={(e) => markDirty(() => setCurrency(e.target.value))}>
                      <MenuItem value="GHS">GHS (Ghanaian Cedi)</MenuItem>
                      <MenuItem value="USD">USD (US Dollar)</MenuItem>
                      <MenuItem value="EUR">EUR (Euro)</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Leak Detection</Typography>
                <Stack spacing={2}>
                  <TextField label="Leak Threshold (L/min)" type="number" value={leakThreshold}
                    onChange={(e) => markDirty(() => setLeakThreshold(parseInt(e.target.value) || 0))} />
                  <Typography variant="caption" color="text.secondary">
                    Flow rates above this threshold will trigger leak alerts.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Notifications</Typography>
                <Stack spacing={2}>
                  <FormControlLabel control={<Switch checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />}
                    label="Enable push notifications" />
                  <FormControlLabel control={<Switch checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />}
                    label="Email alerts for critical events" />
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" size="large" onClick={handleSave} disabled={saving}
              sx={{ width: { xs: '100%', sm: 'auto' } }}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

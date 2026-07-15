import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button, Switch,
  FormControlLabel, Stack, Alert, Select, MenuItem, FormControl, InputLabel,
  Skeleton,
} from '@mui/material';
import { PageHeader } from '@/components/common';
import { ratesService } from '@/services';
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

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    ratesService.getCurrent()
      .then((response) => {
        if (!mounted) return;
        const apiData = response?.data;
        if (apiData?.success && apiData?.data) {
          const rate = apiData.data;
          if (rate.pricePerUnit !== undefined) setWaterRate(rate.pricePerUnit);
          if (rate.currency) setCurrency(rate.currency);
          if (rate.leakThreshold !== undefined) setLeakThreshold(rate.leakThreshold);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || 'Failed to load settings');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await ratesService.update({
        pricePerUnit: waterRate,
        currency,
        leakThreshold,
      });
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
        <Grid container spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <Card>
                <CardContent>
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
    <Box>
      <PageHeader title="Settings" subtitle="System configuration" />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Water Rates</Typography>
              <Stack spacing={2}>
                <TextField label="Rate per Liter" type="number" value={waterRate}
                  onChange={(e) => setWaterRate(parseFloat(e.target.value) || 0)}
                  InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>{currency}</Typography> }} />
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select value={currency} label="Currency" onChange={(e) => setCurrency(e.target.value)}>
                    <MenuItem value="GHS">GHS (Ghanaian Cedi)</MenuItem>
                    <MenuItem value="USD">USD (US Dollar)</MenuItem>
                    <MenuItem value="EUR">EUR (Euro)</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Leak Detection</Typography>
              <Stack spacing={2}>
                <TextField label="Leak Threshold (L/min)" type="number" value={leakThreshold}
                  onChange={(e) => setLeakThreshold(parseInt(e.target.value) || 0)} />
                <Typography variant="caption" color="text.secondary">
                  Flow rates above this threshold will trigger leak alerts.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Notifications</Typography>
              <Stack spacing={2}>
                <FormControlLabel control={<Switch checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />}
                  label="Enable push notifications" />
                <FormControlLabel control={<Switch checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />}
                  label="Email alerts for critical events" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" size="large" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

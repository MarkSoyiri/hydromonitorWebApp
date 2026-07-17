import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button, Avatar, Stack, Divider, Chip,
} from '@mui/material';
import { PageHeader, StatusChip } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

export function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phoneNumber || '');
  const [saving, setSaving] = useState(false);

  const initials = profile?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ fullName: name, phoneNumber: phone });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <PageHeader title="Profile" subtitle="Manage your account" />
      </motion.div>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Avatar sx={{ width: 96, height: 96, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}>
                  {initials || 'U'}
                </Avatar>
                <Typography variant="h6">{profile?.fullName || 'User'}</Typography>
                <Typography variant="body2" color="text.secondary">{profile?.email}</Typography>
                <Box sx={{ mt: 1 }}>
                  <StatusChip status={profile?.status || 'ACTIVE'} />
                </Box>
                {profile?.role && (
                  <Chip label={profile.role} color="primary" variant="outlined" size="small" sx={{ mt: 1 }} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={8}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Account Information</Typography>
                <Stack spacing={2.5}>
                  <TextField label="Full Name" fullWidth value={name}
                    onChange={(e) => setName(e.target.value)} />
                  <TextField label="Email" fullWidth value={profile?.email || ''} disabled />
                  <TextField label="Phone Number" fullWidth value={phone}
                    onChange={(e) => setPhone(e.target.value)} />
                  <TextField label="User ID" fullWidth value={profile?.uid || ''} disabled />
                  <TextField label="Member Since" fullWidth
                    value={profile?.createdAt ? dayjs(profile.createdAt).format('MMMM D, YYYY') : '—'} disabled />
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}

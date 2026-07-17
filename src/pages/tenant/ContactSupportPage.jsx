import { Box, Grid, Card, CardContent, Typography, Button, TextField, Paper } from '@mui/material';
import { HeadsetMic, Email, Phone, Chat, Send } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';

const supportOptions = [
  { icon: <Phone />, label: 'Call Support', detail: '030 234 5678', color: '#2F80ED' },
  { icon: <Email />, label: 'Email Us', detail: 'support@hydromonitor.com', color: '#10B981' },
  { icon: <Chat />, label: 'Live Chat', detail: 'Available 24/7', color: '#8B5CF6' },
];

export function ContactSupportPage() {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message.trim()) return;
    toast.success('Message sent! We will get back to you soon.');
    setMessage('');
  };

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Contact Support</Typography>
          <Typography variant="body2" color="text.secondary">We're here to help you</Typography>
        </Box>
      </motion.div>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {supportOptions.map((opt, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: 4 } }} elevation={0}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5, bgcolor: `${opt.color}15`, color: opt.color }}>
                  {opt.icon}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{opt.label}</Typography>
                <Typography variant="body2" color="text.secondary">{opt.detail}</Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Report an Issue</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Describe your issue or question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" endIcon={<Send />} onClick={handleSubmit} disabled={!message.trim()}>
                Send Message
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

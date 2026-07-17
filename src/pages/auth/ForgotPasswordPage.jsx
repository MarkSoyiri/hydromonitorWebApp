import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Typography, Button, Alert, IconButton,
} from '@mui/material';
import { ArrowBack, WaterDrop } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setError(err?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-30%',
          width: '60%',
          height: '100%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(47,128,237,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <Card>
          <CardContent sx={{ p: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, #2F80ED 0%, #00B4D8 100%)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    boxShadow: '0 8px 24px rgba(47,128,237,0.25)',
                  }}
                >
                  <WaterDrop sx={{ color: '#fff', fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Reset Password
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Enter your email to receive a password reset link
                </Typography>
              </Box>
            </motion.div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>
              </motion.div>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3 }}
                autoComplete="email"
                autoFocus
              />
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !!success}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 4px 16px rgba(47,128,237,0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 24px rgba(47,128,237,0.4)',
                    },
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </motion.div>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link to="/login" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                <ArrowBack fontSize="small" />
                <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                  Back to Sign In
                </Typography>
              </Link>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

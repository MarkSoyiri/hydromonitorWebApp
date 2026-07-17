import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box, Typography,
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import { motion } from 'framer-motion';

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  color = 'primary',
  loading,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.2 },
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}.light`,
            color: `${color}.main`,
          }}
        >
          <Warning />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontSize: '0.9rem' }}>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={color}
          disabled={loading}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

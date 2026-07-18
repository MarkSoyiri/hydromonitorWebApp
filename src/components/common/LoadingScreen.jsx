import { Box, Typography } from '@mui/material';
import { WaterDrop } from '@mui/icons-material';
import { motion } from 'framer-motion';

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 3,
        bgcolor: 'background.default',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(47,128,237,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <WaterDrop
          sx={{
            fontSize: 56,
            color: 'primary.main',
            filter: 'drop-shadow(0 4px 16px rgba(47,128,237,0.35))',
          }}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: '0.02em' }}>
          {message}
        </Typography>
      </motion.div>
    </Box>
  );
}

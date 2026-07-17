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
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <WaterDrop
          sx={{
            fontSize: 56,
            color: 'primary.main',
            filter: 'drop-shadow(0 4px 12px rgba(47,128,237,0.3))',
          }}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {message}
        </Typography>
      </motion.div>
    </Box>
  );
}

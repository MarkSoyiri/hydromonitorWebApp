import { Box, CircularProgress, Typography } from '@mui/material';
import { WaterDrop } from '@mui/icons-material';

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
        bgcolor: 'background.default',
      }}
    >
      <WaterDrop sx={{ fontSize: 48, color: 'primary.main', animation: 'pulse 2s infinite' }} />
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

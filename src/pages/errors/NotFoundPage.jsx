import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { WaterDrop } from '@mui/icons-material';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <WaterDrop sx={{ fontSize: 80, color: 'primary.main', mb: 2, opacity: 0.5 }} />
      <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>404</Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
        Page not found
      </Typography>
      <Button variant="contained" onClick={() => window.history.back()}>
        Go Back
      </Button>
    </Box>
  );
}

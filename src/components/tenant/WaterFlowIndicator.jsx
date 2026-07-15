import { Box, Typography } from '@mui/material';
import { WaterDrop } from '@mui/icons-material';
import { keyframes } from '@mui/system';

const flow = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 0.8; }
  50% { transform: translateY(-6px) scale(1.1); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 0.8; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(47, 128, 237, 0.4); }
  70% { box-shadow: 0 0 0 12px rgba(47, 128, 237, 0); }
  100% { box-shadow: 0 0 0 0 rgba(47, 128, 237, 0); }
`;

export function WaterFlowIndicator({ flowRate = 0, isFlowing = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{
        width: 44, height: 44, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isFlowing
          ? 'linear-gradient(135deg, #2F80ED, #00B4D8)'
          : 'rgba(255,255,255,0.1)',
        animation: isFlowing ? `${pulse} 2s infinite` : 'none',
        color: isFlowing ? '#fff' : 'text.disabled',
      }}>
        <WaterDrop sx={{
          fontSize: 24,
          animation: isFlowing ? `${flow} 1.5s ease-in-out infinite` : 'none',
        }} />
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {flowRate.toFixed(1)}
          <Typography component="span" variant="body2" sx={{ ml: 0.5, fontWeight: 400, color: 'text.secondary' }}>
            L/min
          </Typography>
        </Typography>
        <Typography variant="caption" color={isFlowing ? 'primary.main' : 'text.secondary'} sx={{ fontWeight: 500 }}>
          {isFlowing ? 'Water is flowing' : 'No flow detected'}
        </Typography>
      </Box>
    </Box>
  );
}

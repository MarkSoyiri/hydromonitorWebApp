import { Chip } from '@mui/material';
import {
  CheckCircle, Cancel, Warning, HourglassEmpty, OfflineBolt, Circle,
} from '@mui/icons-material';
import { STATUS_COLORS } from '@/constants';

const statusIcons = {
  ACTIVE: <CheckCircle sx={{ fontSize: 14 }} />,
  DISABLED: <Cancel sx={{ fontSize: 14 }} />,
  ONLINE: <CheckCircle sx={{ fontSize: 14 }} />,
  OFFLINE: <OfflineBolt sx={{ fontSize: 14 }} />,
  VACANT: <HourglassEmpty sx={{ fontSize: 14 }} />,
  OCCUPIED: <CheckCircle sx={{ fontSize: 14 }} />,
  PENDING: <HourglassEmpty sx={{ fontSize: 14 }} />,
  RESOLVED: <CheckCircle sx={{ fontSize: 14 }} />,
  OPEN: <Circle sx={{ fontSize: 14 }} />,
  CLOSED: <Cancel sx={{ fontSize: 14 }} />,
};

export function StatusChip({ status, size = 'small' }) {
  const color = STATUS_COLORS[status] || 'default';
  const icon = statusIcons[status] || null;

  return (
    <Chip
      label={status}
      size={size}
      color={color}
      icon={icon}
      variant="filled"
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        '& .MuiChip-icon': { fontSize: 14, ml: 0.5 },
      }}
    />
  );
}

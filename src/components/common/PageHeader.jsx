import { Box, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';

export function PageHeader({ title, subtitle, action, onAction, actionLabel, actionIcon }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && onAction && (
        <Button
          variant="contained"
          startIcon={actionIcon || <Add />}
          onClick={onAction}
          size="medium"
        >
          {actionLabel || action}
        </Button>
      )}
    </Box>
  );
}

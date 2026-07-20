import { useState, useCallback } from 'react';
import { Chip, Tooltip, IconButton, Snackbar, Box } from '@mui/material';
import { ContentCopy, Business, MeetingRoom, DevicesOther, Person, AdminPanelSettings } from '@mui/icons-material';

const ENTITY_CONFIG = {
  building: { icon: <Business sx={{ fontSize: 14 }} />, label: 'Building', color: '#2F80ED' },
  room: { icon: <MeetingRoom sx={{ fontSize: 14 }} />, label: 'Room', color: '#00B4D8' },
  device: { icon: <DevicesOther sx={{ fontSize: 14 }} />, label: 'Device', color: '#FB8C00' },
  tenant: { icon: <Person sx={{ fontSize: 14 }} />, label: 'Tenant', color: '#4CAF50' },
  admin: { icon: <AdminPanelSettings sx={{ fontSize: 14 }} />, label: 'Admin', color: '#9C27B0' },
};

function truncateId(id, chars = 6) {
  if (!id || typeof id !== 'string') return '—';
  if (id.length <= chars) return id;
  return `...${id.slice(-chars)}`;
}

export function IdBadge({ id, entity = 'building', chars = 6, sx }) {
  const [copied, setCopied] = useState(false);
  const config = ENTITY_CONFIG[entity] || ENTITY_CONFIG.building;

  const handleCopy = useCallback((e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [id]);

  if (!id) {
    return <Chip label="—" size="small" variant="outlined" sx={{ opacity: 0.5, ...sx }} />;
  }

  return (
    <Box
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, ...sx }}
      onClick={(e) => e.stopPropagation()}
    >
      <Tooltip
        title={
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Box sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{config.label} ID</Box>
            <Box sx={{ fontFamily: 'monospace', fontSize: '0.7rem', wordBreak: 'break-all' }}>{id}</Box>
          </Box>
        }
        arrow
        placement="top"
      >
        <Chip
          icon={config.icon}
          label={truncateId(id, chars)}
          size="small"
          variant="outlined"
          sx={{
            fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
            fontWeight: 500,
            fontSize: '0.7rem',
            height: 24,
            cursor: 'default',
            borderColor: `${config.color}30`,
            bgcolor: `${config.color}08`,
            color: 'text.primary',
            '& .MuiChip-icon': { color: config.color, fontSize: 14, ml: 0.5 },
            '&:hover': {
              borderColor: `${config.color}60`,
              bgcolor: `${config.color}12`,
            },
          }}
        />
      </Tooltip>
      <Tooltip title={copied ? 'Copied!' : 'Copy full ID'} arrow placement="top">
        <IconButton
          size="small"
          onClick={handleCopy}
          sx={{
            width: 20,
            height: 20,
            color: 'text.secondary',
            '&:hover': { color: config.color },
          }}
        >
          <ContentCopy sx={{ fontSize: 12 }} />
        </IconButton>
      </Tooltip>
      <Snackbar
        open={copied}
        autoHideDuration={1500}
        onClose={() => setCopied(false)}
        message="ID copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

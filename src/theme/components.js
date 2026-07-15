export const getComponents = (mode) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
        scrollbarColor: mode === 'dark' ? '#1E3A5F transparent' : '#CBD5E0 transparent',
        '&::-webkit-scrollbar': { width: 6, height: 6 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': {
          borderRadius: 3,
          background: mode === 'dark' ? '#1E3A5F' : '#CBD5E0',
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '8px 20px',
        fontWeight: 600,
        fontSize: '0.875rem',
      },
      contained: {
        boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
        '&:hover': { boxShadow: '0px 2px 6px rgba(0,0,0,0.12)' },
      },
      sizeSmall: { padding: '6px 16px', fontSize: '0.8125rem' },
      sizeLarge: { padding: '10px 24px', fontSize: '1rem' },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: mode === 'dark'
          ? '0px 2px 8px rgba(0,0,0,0.2)'
          : '0px 1px 3px rgba(0,0,0,0.04), 0px 1px 2px rgba(0,0,0,0.06)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { borderRadius: 12 },
      elevation1: {
        boxShadow: mode === 'dark'
          ? '0px 2px 8px rgba(0,0,0,0.2)'
          : '0px 1px 3px rgba(0,0,0,0.04), 0px 1px 2px rgba(0,0,0,0.06)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          '& fieldset': { borderColor: mode === 'dark' ? '#1E3A5F' : '#E2E8F0' },
          '&:hover fieldset': { borderColor: '#2F80ED' },
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: 6, fontWeight: 500 },
      filled: { backgroundColor: mode === 'dark' ? '#1a2633' : '#EDF2F7' },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-head': {
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: mode === 'dark' ? '#A0AEC0' : '#6B7C8F',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          backgroundColor: mode === 'dark' ? '#0A1A2B' : '#F8FAFC',
          borderBottom: `1px solid ${mode === 'dark' ? '#1E3A5F' : '#E2E8F0'}`,
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${mode === 'dark' ? '#1E3A5F' : '#E2E8F0'}`,
        padding: '12px 16px',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:hover': { backgroundColor: mode === 'dark' ? 'rgba(95,164,255,0.04)' : 'rgba(47,128,237,0.02)' },
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: `1px solid ${mode === 'dark' ? '#1E3A5F' : '#E2E8F0'}`,
        backgroundColor: mode === 'dark' ? '#0A1A2B' : '#FFFFFF',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: mode === 'dark'
          ? '0px 1px 3px rgba(0,0,0,0.3)'
          : '0px 1px 3px rgba(0,0,0,0.04)',
        borderBottom: `1px solid ${mode === 'dark' ? '#1E3A5F' : '#E2E8F0'}`,
        backgroundColor: mode === 'dark' ? '#0A1A2B' : '#FFFFFF',
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 6,
        padding: '6px 12px',
        fontSize: '0.8125rem',
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: { fontWeight: 600, fontSize: '1rem' },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        width: 42,
        height: 26,
        padding: 0,
        '& .MuiSwitch-switchBase': {
          padding: 0,
          margin: 2,
          transitionDuration: '300ms',
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': { opacity: 1, backgroundColor: '#2F80ED' },
          },
        },
        '& .MuiSwitch-thumb': { boxSizing: 'border-box', width: 22, height: 22 },
        '& .MuiSwitch-track': {
          borderRadius: 13,
          opacity: 1,
          backgroundColor: mode === 'dark' ? '#1E3A5F' : '#E2E8F0',
        },
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        margin: '2px 8px',
        '&.Mui-selected': {
          backgroundColor: mode === 'dark' ? 'rgba(95,164,255,0.12)' : 'rgba(47,128,237,0.08)',
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(95,164,255,0.18)' : 'rgba(47,128,237,0.12)',
          },
        },
      },
    },
  },
});

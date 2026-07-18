export const getComponents = (mode) => {
  const isDark = mode === 'dark';

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: isDark ? 'rgba(95,164,255,0.2) transparent' : 'rgba(47,128,237,0.15) transparent',
          '&::-webkit-scrollbar': { width: 6, height: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 3,
            background: isDark ? 'rgba(95,164,255,0.2)' : 'rgba(47,128,237,0.15)',
            '&:hover': { background: isDark ? 'rgba(95,164,255,0.35)' : 'rgba(47,128,237,0.25)' },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '8px 20px',
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        },
        contained: {
          boxShadow: isDark
            ? '0 4px 16px rgba(95,164,255,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 4px 16px rgba(47,128,237,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
          '&:hover': {
            boxShadow: isDark
              ? '0 6px 24px rgba(95,164,255,0.25), inset 0 1px 0 rgba(255,255,255,0.08)'
              : '0 6px 24px rgba(47,128,237,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
            transform: 'translateY(-1px)',
          },
          '&:active': { transform: 'translateY(0)' },
        },
        outlined: {
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(47,128,237,0.3)',
          '&:hover': {
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(47,128,237,0.5)',
            boxShadow: isDark
              ? '0 4px 16px rgba(95,164,255,0.1)'
              : '0 4px 16px rgba(47,128,237,0.12)',
          },
        },
        text: {
          '&:hover': {
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            backgroundColor: isDark ? 'rgba(95,164,255,0.08)' : 'rgba(47,128,237,0.06)',
          },
        },
        sizeSmall: { padding: '6px 16px', fontSize: '0.8125rem' },
        sizeLarge: { padding: '10px 24px', fontSize: '1rem' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: isDark
            ? 'rgba(17, 25, 33, 0.6)'
            : 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.06)'
            : '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: isDark
            ? '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)'
            : '0 4px 24px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.6)',
          transition: 'box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.3s ease',
          '&:hover': {
            boxShadow: isDark
              ? '0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 12px 40px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.7)',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: isDark
            ? '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)'
            : '0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)',
        },
        elevation2: {
          boxShadow: isDark
            ? '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)'
            : '0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)',
        },
        elevation4: {
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              transition: 'border-color 0.3s ease',
            },
            '&:hover fieldset': { borderColor: isDark ? 'rgba(95,164,255,0.4)' : 'rgba(47,128,237,0.4)' },
            '&.Mui-focused fieldset': {
              borderColor: isDark ? '#5FA4FF' : '#2F80ED',
              boxShadow: isDark ? '0 0 0 2px rgba(95,164,255,0.1)' : '0 0 0 2px rgba(47,128,237,0.08)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
        },
        filled: {
          backgroundColor: isDark ? 'rgba(95,164,255,0.1)' : 'rgba(47,128,237,0.06)',
        },
        outlined: {
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          background: isDark
            ? 'rgba(17, 25, 33, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: isDark
            ? '0 24px 80px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 24px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          background: isDark
            ? 'rgba(17, 25, 33, 0.85)'
            : 'rgba(255, 255, 255, 0.85)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: isDark
            ? '0 16px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)'
            : '0 16px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: isDark ? '#A0AEC0' : '#6B7C8F',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(248,250,252,0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          padding: '12px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: isDark ? 'rgba(95,164,255,0.04)' : 'rgba(47,128,237,0.02)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 10,
          padding: '8px 14px',
          fontSize: '0.8125rem',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: isDark ? 'rgba(17,25,33,0.9)' : 'rgba(255,255,255,0.9)',
          color: isDark ? '#fff' : '#111921',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
        },
        arrow: {
          color: isDark ? 'rgba(17,25,33,0.9)' : 'rgba(255,255,255,0.9)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '1rem',
          boxShadow: isDark
            ? '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.3)',
        },
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
              '& + .MuiSwitch-track': {
                opacity: 1,
                background: 'linear-gradient(135deg, #2F80ED, #00B4D8)',
              },
            },
          },
          '& .MuiSwitch-thumb': {
            boxSizing: 'border-box',
            width: 22,
            height: 22,
            boxShadow: isDark
              ? '0 2px 4px rgba(0,0,0,0.3)'
              : '0 2px 4px rgba(0,0,0,0.1)',
          },
          '& .MuiSwitch-track': {
            borderRadius: 13,
            opacity: 1,
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '2px 8px',
          transition: 'all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:hover': {
            backgroundColor: isDark ? 'rgba(95,164,255,0.06)' : 'rgba(47,128,237,0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: isDark ? 'rgba(95,164,255,0.12)' : 'rgba(47,128,237,0.08)',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(95,164,255,0.18)' : 'rgba(47,128,237,0.12)',
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '12px 12px 0 0',
          transition: 'all 0.25s ease',
          '&.Mui-selected': {
            backgroundColor: isDark ? 'rgba(95,164,255,0.08)' : 'rgba(47,128,237,0.04)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  };
};

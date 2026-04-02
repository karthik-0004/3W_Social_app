import { createTheme } from '@mui/material/styles'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7C3AED' },
    secondary: { main: '#EC4899' },
    info: { main: '#06B6D4' },
    warning: { main: '#F59E0B' },
    background: {
      default: '#03050A',
      paper: '#080C14',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      disabled: '#475569',
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 20 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--glow-purple': '0 0 40px rgba(124,58,237,0.4)',
          '--glow-pink': '0 0 40px rgba(236,72,153,0.4)',
          '--glow-cyan': '0 0 40px rgba(6,182,212,0.4)',
          '--gradient-main': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #06B6D4 100%)',
          '--gradient-card': 'linear-gradient(145deg, rgba(15,22,35,0.9), rgba(8,12,20,0.95))',
          '--border-glow': '1px solid rgba(124,58,237,0.2)',
        },
        body: {
          background: 'radial-gradient(ellipse at top left, #0D0521 0%, #03050A 40%, #000D1A 100%)',
          minHeight: '100vh',
          position: 'relative',
          scrollbarWidth: 'thin',
          scrollbarColor: '#7C3AED transparent',
          '&::-webkit-scrollbar': { width: '4px', height: '4px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: 'var(--gradient-main)',
            borderRadius: '3px',
          },
          '&::before': {
            content: '""',
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage:
              'radial-gradient(circle at 5% 90%, rgba(124,58,237,0.28) 0 2px, transparent 3px), radial-gradient(circle at 18% 72%, rgba(124,58,237,0.18) 0 2px, transparent 3px), radial-gradient(circle at 32% 86%, rgba(124,58,237,0.24) 0 2px, transparent 3px), radial-gradient(circle at 44% 66%, rgba(124,58,237,0.2) 0 2px, transparent 3px), radial-gradient(circle at 57% 79%, rgba(124,58,237,0.22) 0 2px, transparent 3px), radial-gradient(circle at 71% 91%, rgba(124,58,237,0.2) 0 2px, transparent 3px), radial-gradient(circle at 83% 74%, rgba(124,58,237,0.22) 0 2px, transparent 3px), radial-gradient(circle at 94% 82%, rgba(124,58,237,0.24) 0 2px, transparent 3px), radial-gradient(circle at 10% 52%, rgba(124,58,237,0.2) 0 2px, transparent 3px), radial-gradient(circle at 22% 45%, rgba(124,58,237,0.24) 0 2px, transparent 3px), radial-gradient(circle at 36% 54%, rgba(124,58,237,0.18) 0 2px, transparent 3px), radial-gradient(circle at 48% 42%, rgba(124,58,237,0.25) 0 2px, transparent 3px), radial-gradient(circle at 61% 57%, rgba(124,58,237,0.2) 0 2px, transparent 3px), radial-gradient(circle at 73% 48%, rgba(124,58,237,0.22) 0 2px, transparent 3px), radial-gradient(circle at 86% 53%, rgba(124,58,237,0.24) 0 2px, transparent 3px), radial-gradient(circle at 95% 43%, rgba(124,58,237,0.18) 0 2px, transparent 3px), radial-gradient(circle at 15% 24%, rgba(124,58,237,0.24) 0 2px, transparent 3px), radial-gradient(circle at 38% 28%, rgba(124,58,237,0.2) 0 2px, transparent 3px), radial-gradient(circle at 62% 20%, rgba(124,58,237,0.24) 0 2px, transparent 3px), radial-gradient(circle at 87% 22%, rgba(124,58,237,0.2) 0 2px, transparent 3px)',
            animation: 'particleFloat 18s linear infinite',
            opacity: 0.3,
          },
          '@keyframes particleFloat': {
            from: { transform: 'translateY(40px)' },
            to: { transform: 'translateY(-40px)' },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, rgba(15,22,35,0.8), rgba(8,12,20,0.9))',
          backdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: '24px',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          '&:hover': {
            boxShadow: '0 25px 50px rgba(124,58,237,0.15), 0 0 0 1px rgba(124,58,237,0.2)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          textTransform: 'none',
          fontWeight: 700,
          letterSpacing: '0.3px',
          position: 'relative',
          overflow: 'hidden',
        },
        contained: {
          background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
          boxShadow: '0 4px 24px rgba(124,58,237,0.35)',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-120%',
            width: '55%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'left 0.45s ease',
          },
          '&:hover': {
            boxShadow: '0 8px 40px rgba(124,58,237,0.6), 0 0 0 1px rgba(236,72,153,0.3)',
            transform: 'translateY(-2px) scale(1.02)',
            '&::after': { left: '130%' },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            background: 'rgba(15,22,35,0.55)',
            '& fieldset': { borderColor: 'rgba(124,58,237,0.2)' },
            '&:hover fieldset': { borderColor: 'rgba(124,58,237,0.4)' },
            '&.Mui-focused fieldset': { borderColor: '#7C3AED' },
          },
        },
      },
    },
  },
})

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3D2DB5', light: '#6C5CE7', dark: '#2D1FA8', contrastText: '#FFFFFF' },
    secondary: { main: '#7B6FF0' },
    info: { main: '#6C5CE7' },
    warning: { main: '#FDCB6E' },
    success: { main: '#00B894' },
    error: { main: '#FF6B6B' },
    background: {
      default: '#F0EFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1035',
      secondary: '#6B6B8A',
      disabled: '#9898B3',
    },
    divider: '#E8E6FF',
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 20 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--glow-purple': '0 0 40px rgba(61,45,181,0.35)',
          '--glow-pink': '0 0 40px rgba(108,92,231,0.25)',
          '--glow-cyan': '0 0 40px rgba(123,111,240,0.2)',
          '--gradient-main': 'linear-gradient(135deg, #6C5CE7 0%, #3D2DB5 100%)',
          '--gradient-card': 'linear-gradient(145deg, #FFFFFF, #F7F6FF)',
          '--border-glow': '1px solid #E8E6FF',
        },
        body: {
          background: 'linear-gradient(160deg, #F0EFFF 0%, #E8E6FF 50%, #F5F4FF 100%)',
          minHeight: '100vh',
          position: 'relative',
          scrollbarWidth: 'thin',
          scrollbarColor: '#C5BFFF transparent',
          '&::-webkit-scrollbar': { width: '6px', height: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: '#C5BFFF',
            borderRadius: '999px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#FFFFFF',
          border: '1px solid #E8E6FF',
          borderRadius: '24px',
          boxShadow: '0 2px 16px rgba(61,45,181,0.08)',
          transition: 'all 0.28s ease',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(61,45,181,0.15)',
            transform: 'translateY(-2px)',
            borderColor: 'rgba(61,45,181,0.28)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          textTransform: 'none',
          fontWeight: 700,
          letterSpacing: '0.2px',
        },
        contained: {
          background: 'linear-gradient(135deg, #6C5CE7 0%, #3D2DB5 100%)',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(61,45,181,0.2)',
          '&:hover': {
            background: '#2D1FA8',
            boxShadow: '0 8px 24px rgba(61,45,181,0.35)',
          },
        },
        outlined: {
          background: '#FFFFFF',
          borderColor: '#3D2DB5',
          color: '#3D2DB5',
          '&:hover': {
            background: '#EEF0FF',
            borderColor: '#3D2DB5',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            background: '#F7F6FF',
            '& fieldset': { borderColor: '#DDD9FF' },
            '&:hover fieldset': { borderColor: '#C9C3FF' },
            '&.Mui-focused fieldset': {
              borderColor: '#3D2DB5',
              boxShadow: '0 0 0 3px rgba(61,45,181,0.16)',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#FFFFFF',
          color: '#1A1035',
          borderBottom: '1px solid #E8E6FF',
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: '#EEF0FF',
          color: '#3D2DB5',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: '#FFFFFF',
          border: '1px solid #E8E6FF',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E8E6FF',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #6C5CE7 0%, #3D2DB5 100%)',
          color: '#FFFFFF',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            background: '#EEF0FF',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#6B6B8A',
          '&.Mui-selected': {
            color: '#3D2DB5',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#3D2DB5',
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          backgroundColor: '#3D2DB5',
          color: '#FFFFFF',
        },
      },
    },
  },
})

export function getTheme(mode) {
  return mode === 'light' ? lightTheme : darkTheme
}

export { darkTheme, lightTheme }

import { createTheme } from '@mui/material/styles'

const theme = createTheme({
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

export default theme

import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#A78BFA' },
    secondary: { main: '#F472B6' },
    background: {
      default: '#070B14',
      paper: '#0D1117',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #070B14 0%, #0D1117 50%, #070B14 100%)',
          minHeight: '100vh',
          scrollbarWidth: 'thin',
          scrollbarColor: '#A78BFA33 transparent',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(180deg, #A78BFA, #F472B6)',
            borderRadius: '3px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(167,139,250,0.12)',
          borderRadius: '20px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            border: '1px solid rgba(167,139,250,0.3)',
            transform: 'translateY(-2px)',
            boxShadow: '0 20px 40px rgba(167,139,250,0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.3px',
        },
        contained: {
          background: 'linear-gradient(135deg, #A78BFA, #F472B6)',
          boxShadow: '0 4px 20px rgba(167,139,250,0.3)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(167,139,250,0.5)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
            '& fieldset': { borderColor: 'rgba(167,139,250,0.2)' },
            '&:hover fieldset': { borderColor: 'rgba(167,139,250,0.4)' },
            '&.Mui-focused fieldset': { borderColor: '#A78BFA' },
          },
        },
      },
    },
  },
})

export default theme

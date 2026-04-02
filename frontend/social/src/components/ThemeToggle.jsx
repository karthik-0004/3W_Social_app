import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import { Box, IconButton, useTheme as useMuiTheme } from '@mui/material'
import { motion } from 'framer-motion'

import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const muiTheme = useMuiTheme()
  const { mode, toggleTheme } = useTheme()
  const isLight = mode === 'light'

  return (
    <IconButton
      onClick={toggleTheme}
      aria-label="Toggle theme"
      sx={{
        width: 56,
        height: 28,
        p: '2px',
        borderRadius: '999px',
        border: `1px solid ${muiTheme.palette.divider}`,
        background: isLight
          ? 'linear-gradient(135deg, #C5BFFF 0%, #E8E6FF 100%)'
          : 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {!isLight && (
        <Box
          component={motion.div}
          animate={{ opacity: [0.4, 0.95, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          sx={{
            position: 'absolute',
            top: 4,
            right: 10,
            width: 3,
            height: 3,
            borderRadius: '50%',
            bgcolor: '#C4B5FD',
          }}
        />
      )}

      <Box
        component={motion.div}
        layout
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        sx={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          ml: isLight ? 'auto' : 0,
          mr: isLight ? 0 : 'auto',
          color: '#fff',
          background: isLight
            ? 'linear-gradient(135deg, #FDCB6E 0%, #F59E0B 100%)'
            : 'linear-gradient(135deg, #6366F1 0%, #312E81 100%)',
          boxShadow: isLight ? '0 0 0 2px rgba(255,255,255,0.7)' : '0 0 0 2px rgba(17,24,39,0.65)',
        }}
      >
        {isLight ? (
          <Box
            component={motion.div}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            sx={{ display: 'grid', placeItems: 'center' }}
          >
            <LightModeRoundedIcon sx={{ fontSize: 14 }} />
          </Box>
        ) : (
          <DarkModeRoundedIcon sx={{ fontSize: 14 }} />
        )}
      </Box>
    </IconButton>
  )
}

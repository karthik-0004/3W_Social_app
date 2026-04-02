import { Button, CircularProgress } from '@mui/material'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'

const MotionButton = motion(Button)

const variantStyles = {
  primary: {
    color: '#fff',
    background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
    boxShadow: '0 4px 24px rgba(124,58,237,0.35)',
  },
  secondary: {
    color: '#F8FAFC',
    background: 'linear-gradient(var(--gradient-card), var(--gradient-card)) padding-box, linear-gradient(135deg, #7C3AED, #06B6D4) border-box',
    border: '1px solid transparent',
  },
  danger: {
    color: '#fff',
    background: 'linear-gradient(135deg, #EF4444, #F43F5E)',
    boxShadow: '0 4px 20px rgba(239,68,68,0.35)',
  },
  ghost: {
    color: '#A5B4FC',
    background: 'transparent',
    border: '1px solid rgba(124,58,237,0.25)',
  },
}

export default function GlowButton({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  glow = false,
  sx,
  ...props
}) {
  const theme = useTheme()
  const isLight = theme.palette.mode === 'light'

  const dynamicVariantStyles = {
    ...variantStyles,
    secondary: {
      color: isLight ? '#1A1035' : '#F8FAFC',
      background: isLight
        ? '#FFFFFF'
        : 'linear-gradient(var(--gradient-card), var(--gradient-card)) padding-box, linear-gradient(135deg, #7C3AED, #06B6D4) border-box',
      border: isLight ? '1px solid #DDD9FF' : '1px solid transparent',
    },
    ghost: {
      color: isLight ? '#3D2DB5' : '#A5B4FC',
      background: 'transparent',
      border: isLight ? '1px solid #DDD9FF' : '1px solid rgba(124,58,237,0.25)',
    },
  }

  return (
    <MotionButton
      onClick={onClick}
      size={size}
      startIcon={!loading ? icon : null}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      sx={{
        borderRadius: 999,
        textTransform: 'none',
        fontWeight: 700,
        overflow: 'hidden',
        position: 'relative',
        ...dynamicVariantStyles[variant],
        '&.Mui-disabled': {
          color: 'rgba(255,255,255,0.76)',
          background:
            variant === 'secondary'
              ? isLight
                ? '#F4F3FF'
                : 'rgba(71,85,105,0.45)'
              : 'linear-gradient(135deg, rgba(124,58,237,0.55), rgba(236,72,153,0.55))',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-120%',
          width: '50%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
          transition: 'left 0.45s ease',
        },
        '&:hover::after': { left: '130%' },
        ...(glow
          ? {
              animation: 'glowPulse 2s ease-in-out infinite',
              '@keyframes glowPulse': {
                '0%, 100%': { boxShadow: '0 0 0 rgba(124,58,237,0)' },
                '50%': { boxShadow: '0 0 24px rgba(124,58,237,0.55)' },
              },
            }
          : {}),
        ...sx,
      }}
      {...props}
    >
      {loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : children}
    </MotionButton>
  )
}

import { Box, useTheme } from '@mui/material'
import { motion } from 'framer-motion'

import FloatingParticles from './FloatingParticles'

function Orb({ sx, animate, duration, isRouteTransitioning }) {
  return (
    <Box
      component={motion.div}
      animate={isRouteTransitioning ? { x: 0, y: 0 } : animate}
      transition={
        isRouteTransitioning
          ? { duration: 0.12, ease: 'linear' }
          : { duration, repeat: Infinity, ease: 'easeInOut' }
      }
      sx={{
        position: 'fixed',
        width: 600,
        height: 600,
        borderRadius: '50%',
        filter: 'blur(120px)',
        pointerEvents: 'none',
        zIndex: -1,
        willChange: 'transform',
        ...sx,
      }}
    />
  )
}

export default function AnimatedBackground({ isRouteTransitioning = false }) {
  const theme = useTheme()
  const isLight = theme.palette.mode === 'light'

  return (
    <>
      <Orb
        sx={{
          top: -200,
          left: -120,
          background: isLight ? 'rgba(197,191,255,0.35)' : 'rgba(124,58,237,0.08)',
        }}
        animate={{ y: [0, -60, 0], x: [0, 40, 0] }}
        duration={20}
        isRouteTransitioning={isRouteTransitioning}
      />
      <Orb
        sx={{
          top: -220,
          right: -140,
          background: isLight ? 'rgba(255,179,217,0.25)' : 'rgba(236,72,153,0.06)',
        }}
        animate={{ y: [0, 80, 0], x: [0, -50, 0] }}
        duration={25}
        isRouteTransitioning={isRouteTransitioning}
      />
      <Orb
        sx={{
          bottom: -260,
          left: '35%',
          background: isLight ? 'rgba(179,229,252,0.2)' : 'rgba(6,182,212,0.05)',
        }}
        animate={{ y: [0, -40, 0], x: [0, 60, 0] }}
        duration={30}
        isRouteTransitioning={isRouteTransitioning}
      />
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          backgroundImage: isLight
            ? 'linear-gradient(rgba(61,45,181,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(61,45,181,0.02) 1px, transparent 1px)'
            : 'linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: isRouteTransitioning ? 0.55 : 1,
          transition: 'opacity 0.18s ease',
        }}
      />
      <FloatingParticles isRouteTransitioning={isRouteTransitioning} />
    </>
  )
}

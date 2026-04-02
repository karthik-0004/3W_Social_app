import { Box } from '@mui/material'
import { motion } from 'framer-motion'

import FloatingParticles from './FloatingParticles'

function Orb({ sx, animate, duration }) {
  return (
    <Box
      component={motion.div}
      animate={animate}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
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

export default function AnimatedBackground() {
  return (
    <>
      <Orb
        sx={{ top: -200, left: -120, background: 'rgba(124,58,237,0.08)' }}
        animate={{ y: [0, -60, 0], x: [0, 40, 0] }}
        duration={20}
      />
      <Orb
        sx={{ top: -220, right: -140, background: 'rgba(236,72,153,0.06)' }}
        animate={{ y: [0, 80, 0], x: [0, -50, 0] }}
        duration={25}
      />
      <Orb
        sx={{ bottom: -260, left: '35%', background: 'rgba(6,182,212,0.05)' }}
        animate={{ y: [0, -40, 0], x: [0, 60, 0] }}
        duration={30}
      />
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
      <FloatingParticles />
    </>
  )
}

import SyncRoundedIcon from '@mui/icons-material/SyncRounded'
import { Box, Typography } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'

export default function NetworkRetryBanner({ open }) {
  return (
    <AnimatePresence>
      {open && (
        <Box
          component={motion.div}
          initial={{ y: -54, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -54, opacity: 0 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          sx={{
            position: 'fixed',
            top: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2100,
            px: 1.5,
            py: 0.7,
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
            background: 'linear-gradient(135deg, rgba(13,148,136,0.96), rgba(20,184,166,0.96))',
            color: '#FFFFFF',
            boxShadow: '0 12px 30px rgba(13,148,136,0.35)',
            border: '1px solid rgba(255,255,255,0.35)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <SyncRoundedIcon
            fontSize="small"
            sx={{
              animation: 'spin 0.95s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, lineHeight: 1 }}>
            Reconnecting...
          </Typography>
        </Box>
      )}
    </AnimatePresence>
  )
}

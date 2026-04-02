import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import RemoveRedEyeRoundedIcon from '@mui/icons-material/RemoveRedEyeRounded'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Avatar,
  Box,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useMemo, useRef, useState } from 'react'

import { viewVibe } from '../api/axios'

const VIBE_DURATION_MS = 5000

export default function VibeViewerModal({
  open,
  onClose,
  vibeGroup,
  currentUserId,
}) {
  const vibes = useMemo(() => vibeGroup?.vibes || [], [vibeGroup])
  const [index, setIndex] = useState(0)
  const [progressSeed, setProgressSeed] = useState(0)
  const [direction, setDirection] = useState(1)
  const [floatingEmoji, setFloatingEmoji] = useState(null)
  const touchStartX = useRef(null)

  const currentVibe = vibes[index]
  const isOwnVibe = String(vibeGroup?.user?.id) === String(currentUserId)

  useEffect(() => {
    if (!open) return
    setIndex(0)
    setProgressSeed((value) => value + 1)
  }, [open, vibeGroup?.user?.id])

  useEffect(() => {
    if (!open || !currentVibe) return

    viewVibe(currentVibe.id).catch(() => {
      // Viewer tracking should not block playback.
    })

    setProgressSeed((value) => value + 1)

    const timer = window.setTimeout(() => {
      if (index < vibes.length - 1) {
        setIndex((value) => value + 1)
      } else {
        onClose?.()
      }
    }, VIBE_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [open, currentVibe?.id, index, vibes.length, onClose])

  const goNext = () => {
    if (index < vibes.length - 1) {
      setDirection(1)
      setIndex((value) => value + 1)
    } else {
      onClose?.()
    }
  }

  const goPrev = () => {
    if (index > 0) {
      setDirection(-1)
      setIndex((value) => value - 1)
    }
  }

  const reactWithEmoji = (emoji) => {
    setFloatingEmoji({ id: Date.now(), emoji })
    window.setTimeout(() => setFloatingEmoji(null), 900)
  }

  const onTouchStart = (event) => {
    touchStartX.current = event.changedTouches?.[0]?.clientX ?? null
  }

  const onTouchEnd = (event) => {
    if (touchStartX.current === null) return
    const endX = event.changedTouches?.[0]?.clientX ?? touchStartX.current
    const delta = endX - touchStartX.current
    if (Math.abs(delta) > 45) {
      if (delta < 0) goNext()
      if (delta > 0) goPrev()
    }
    touchStartX.current = null
  }

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        sx={{
          height: '100%',
          bgcolor: '#000',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Stack spacing={1.1} sx={{ position: 'absolute', top: 10, left: 12, right: 12, zIndex: 3 }}>
          <Stack direction="row" spacing={0.8}>
            {vibes.map((item, itemIndex) => {
              const isPast = itemIndex < index
              const isActive = itemIndex === index
              return (
                <Box
                  key={item.id}
                  sx={{
                    flex: 1,
                    height: 3,
                    borderRadius: 999,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    key={`${item.id}-${progressSeed}`}
                    component={motion.div}
                    sx={{
                      width: isPast ? '100%' : isActive ? '100%' : '0%',
                      height: '100%',
                      bgcolor: '#fff',
                      transformOrigin: 'left center',
                      ...(isActive
                        ? {
                            animation: 'none',
                          }
                        : {}),
                    }}
                    animate={isActive ? { width: '100%' } : {}}
                    transition={isActive ? { duration: 5, ease: 'linear' } : {}}
                  />
                </Box>
              )
            })}
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.1} alignItems="center">
              <Avatar src={vibeGroup?.user?.profile_pic || ''} sx={{ width: 34, height: 34 }}>
                {(vibeGroup?.user?.username || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 700 }}>{vibeGroup?.user?.username}</Typography>
                {currentVibe?.created_at && (
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {formatDistanceToNow(new Date(currentVibe.created_at), { addSuffix: true })}
                  </Typography>
                )}
              </Stack>
            </Stack>
            <IconButton onClick={onClose} sx={{ color: '#fff' }}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pt: 10,
            pb: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <Box
              key={currentVibe?.id || 'none'}
              component={motion.div}
              custom={direction}
              initial={{ x: direction > 0 ? 120 : -120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -120 : 120, opacity: 0 }}
              transition={{ duration: 0.3 }}
              sx={{ width: '100%', height: '100%' }}
            >
              {currentVibe?.media_type === 'image' && currentVibe?.media && (
                <Box component="img" src={currentVibe.media} alt="Vibe" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              )}

              {currentVibe?.media_type === 'video' && currentVibe?.media && (
                <Box
                  component="video"
                  src={currentVibe.media}
                  autoPlay
                  muted
                  loop
                  playsInline
                  sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}

              {currentVibe?.media_type === 'note' && (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #7C3AED, #EC4899, #06B6D4)',
                    display: 'grid',
                    placeItems: 'center',
                    px: 3,
                    textAlign: 'center',
                  }}
                >
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                    {(currentVibe?.note || 'Daily vibe').split(' ').map((word, idx) => (
                      <Typography
                        key={`${word}-${idx}`}
                        component={motion.span}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        sx={{ fontSize: { xs: 28, md: 42 }, fontWeight: 800, textShadow: '0 6px 24px rgba(0,0,0,0.3)' }}
                      >
                        {word}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          </AnimatePresence>
        </Box>

        {currentVibe?.note && currentVibe?.media_type !== 'note' && (
          <Typography
            sx={{
              position: 'absolute',
              left: '50%',
              bottom: 24,
              transform: 'translateX(-50%)',
              px: 2,
              py: 0.9,
              borderRadius: 999,
              bgcolor: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(6px)',
              fontWeight: 600,
            }}
          >
            {currentVibe.note}
          </Typography>
        )}

        <Box
          sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', zIndex: 2 }}
          onClick={goPrev}
        />
        <Box
          sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', zIndex: 2 }}
          onClick={goNext}
        />

        {isOwnVibe && (
          <Stack
            direction="row"
            spacing={0.6}
            alignItems="center"
            sx={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              color: 'rgba(255,255,255,0.9)',
              zIndex: 3,
            }}
          >
            <RemoveRedEyeRoundedIcon fontSize="small" />
            <Typography variant="body2">{currentVibe?.viewer_count || 0}</Typography>
          </Stack>
        )}

        <Stack
          direction="row"
          spacing={1}
          sx={{ position: 'absolute', bottom: 12, left: 12, zIndex: 4, bgcolor: 'rgba(0,0,0,0.35)', borderRadius: 999, p: 0.6 }}
        >
          {['❤️', '🔥', '😂', '😍', '👏', '😮'].map((emoji) => (
            <Box
              key={emoji}
              component={motion.div}
              whileHover={{ y: -8, scale: 1.3 }}
              sx={{ cursor: 'pointer', fontSize: 20 }}
              onClick={() => reactWithEmoji(emoji)}
            >
              {emoji}
            </Box>
          ))}
        </Stack>

        <AnimatePresence>
          {floatingEmoji && (
            <Box
              component={motion.div}
              key={floatingEmoji.id}
              initial={{ y: 0, opacity: 1, scale: 1 }}
              animate={{ y: -400, opacity: 0, scale: 2 }}
              exit={{ opacity: 0 }}
              sx={{ position: 'absolute', left: '50%', bottom: 70, transform: 'translateX(-50%)', fontSize: 30, zIndex: 5 }}
            >
              {floatingEmoji.emoji}
            </Box>
          )}
        </AnimatePresence>
      </Box>
    </Dialog>
  )
}

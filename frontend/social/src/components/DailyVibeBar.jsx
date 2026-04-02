import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { motion } from 'framer-motion'
import { Avatar, Box, IconButton, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { getFeedVibes } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import CreateVibeModal from './CreateVibeModal'
import VibeViewerModal from './VibeViewerModal'

function StoryCircle({ item, label, hasUnseen, onClick, isAdd }) {
  return (
    <Box component={motion.div} whileTap={{ scale: 0.9 }} sx={{ width: 76, flex: '0 0 auto', textAlign: 'center' }}>
      <Box
        onClick={onClick}
        sx={{
          mx: 'auto',
          width: 66,
          height: 66,
          borderRadius: '50%',
          p: '2.5px',
          cursor: 'pointer',
          '--angle': '0deg',
          background: hasUnseen
            ? 'conic-gradient(from var(--angle), #7C3AED, #EC4899, #06B6D4, #7C3AED)'
            : 'rgba(148,163,184,0.6)',
          animation: hasUnseen ? 'vibeRing 2.8s linear infinite' : 'none',
          '@property --angle': {
            syntax: '"<angle>"',
            inherits: false,
            initialValue: '0deg',
          },
          '@keyframes vibeRing': {
            from: { '--angle': '0deg' },
            to: { '--angle': '360deg' },
          },
          willChange: 'transform',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            bgcolor: '#0F172A',
            p: '2px',
            position: 'relative',
          }}
        >
          <Avatar src={item?.user?.profile_pic || ''} sx={{ width: '100%', height: '100%' }}>
            {(item?.user?.username || 'Y').charAt(0).toUpperCase()}
          </Avatar>
          {isAdd && (
            <Box
              sx={{
                position: 'absolute',
                right: -2,
                bottom: -2,
                width: 22,
                height: 22,
                borderRadius: '50%',
                bgcolor: '#fff',
                color: '#0F172A',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 0 0 rgba(124,58,237,0)',
                animation: 'plusPulse 1.6s ease-in-out infinite',
                '@keyframes plusPulse': {
                  '0%,100%': { boxShadow: '0 0 0 rgba(124,58,237,0)' },
                  '50%': { boxShadow: '0 0 14px rgba(124,58,237,0.65)' },
                },
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 17 }} />
            </Box>
          )}
        </Box>
      </Box>
      <Typography variant="caption" sx={{ mt: 0.7, display: 'block', color: '#E2E8F0', fontWeight: 600 }}>
        {label.length > 8 ? `${label.slice(0, 8)}...` : label}
      </Typography>
    </Box>
  )
}

export default function DailyVibeBar({ refreshSignal = 0, onRefresh }) {
  const { user } = useAuth()
  const scrollRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [activeGroup, setActiveGroup] = useState(null)

  const loadVibes = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getFeedVibes()
      setGroups(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Could not load daily vibes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadVibes()
  }, [loadVibes, refreshSignal])

  const ownGroup = useMemo(
    () => groups.find((item) => String(item.user.id) === String(user?.id)) || null,
    [groups, user?.id],
  )

  const friendGroups = useMemo(
    () => groups.filter((item) => String(item.user.id) !== String(user?.id)),
    [groups, user?.id],
  )

  const openViewer = (group) => {
    setActiveGroup(group)
    setViewerOpen(true)
  }

  const scrollByAmount = (amount) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <>
      <Box
        component={motion.div}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        sx={{
          mb: 1.8,
          p: 1.4,
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.85))',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography sx={{ fontWeight: 800, color: '#fff' }}>Daily Vibes</Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => scrollByAmount(-240)}>
              <ChevronLeftRoundedIcon />
            </IconButton>
            <IconButton size="small" onClick={() => scrollByAmount(240)}>
              <ChevronRightRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Box
          ref={scrollRef}
          component={motion.div}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          initial="hidden"
          animate="show"
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            minHeight: 94,
          }}
        >
          <StoryCircle
            item={ownGroup || { user: user || {} }}
            label="Your Vibe"
            hasUnseen={Boolean(ownGroup?.has_unseen)}
            onClick={() => {
              if (ownGroup?.vibes?.length) {
                openViewer(ownGroup)
              } else {
                setCreateOpen(true)
              }
            }}
            isAdd={!ownGroup?.vibes?.length}
          />

          {loading && (
            <Typography variant="caption" sx={{ color: 'text.secondary', py: 3, px: 2 }}>
              Loading vibes...
            </Typography>
          )}

          {friendGroups.map((item) => (
            <StoryCircle
              key={item.user.id}
              item={item}
              label={item.user.username || 'Friend'}
              hasUnseen={Boolean(item.has_unseen)}
              onClick={() => openViewer(item)}
            />
          ))}
        </Box>
      </Box>

      <CreateVibeModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          loadVibes()
          onRefresh?.()
        }}
      />

      <VibeViewerModal
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false)
          setActiveGroup(null)
          loadVibes()
        }}
        vibeGroup={activeGroup}
        currentUserId={user?.id}
      />
    </>
  )
}

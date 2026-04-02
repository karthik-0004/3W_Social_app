import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import MessageRoundedIcon from '@mui/icons-material/MessageRounded'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Avatar,
  Box,
  Chip,
  Container,
  Dialog,
  Divider,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'

import {
  acceptFriendRequest,
  cancelFriendRequest,
  deleteVibe,
  getUserProfile,
  rejectFriendRequest,
  sendFriendRequest,
  unfriend,
} from '../api/axios'
import CreatePostModal from '../components/CreatePostModal'
import GlowButton from '../components/GlowButton'
import PostCard from '../components/PostCard'
import VibeViewerModal from '../components/VibeViewerModal'
import { useAuth } from '../context/AuthContext'
import useCountUp from '../hooks/useCountUp'

const TAB_MAP = {
  posts: 0,
  vibes: 1,
  tagged: 2,
}

export default function UserProfilePage() {
  const theme = useTheme()
  const isLight = theme.palette.mode === 'light'
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [vibes, setVibes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState(null)
  const [postComposerOpen, setPostComposerOpen] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerGroup, setViewerGroup] = useState(null)

  const tabName = searchParams.get('tab') || 'posts'
  const tabValue = TAB_MAP[tabName] ?? 0
  const { ref: gridRef, inView: gridInView } = useInView({ triggerOnce: true, rootMargin: '-40px' })

  const isOwnProfile = useMemo(() => String(user?.id) === String(userId), [user?.id, userId])
  const activeVibes = useMemo(() => vibes.filter((item) => !item.is_expired), [vibes])
  const hasActiveVibes = activeVibes.length > 0
  const postsCount = useCountUp(posts.length, 900)
  const friendsCount = useCountUp(profile?.friends_count || 0, 900)
  const vibesCount = useCountUp(activeVibes.length, 900)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getUserProfile(userId)
      setProfile(data.user)
      setPosts(Array.isArray(data.posts) ? data.posts : [])
      setVibes(Array.isArray(data.vibes) ? data.vibes : [])
    } catch {
      toast.error('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const updateProfileStatus = (status, requestId = null) => {
    setProfile((prev) => (prev ? { ...prev, friendship_status: status, request_id: requestId } : prev))
  }

  const onSendRequest = async () => {
    if (!profile) return
    const previousStatus = profile.friendship_status || 'none'
    const previousRequestId = profile.request_id || null
    updateProfileStatus('request_sent', previousRequestId)
    try {
      const response = await sendFriendRequest(userId)
      if (response?.status === 'friends') {
        updateProfileStatus('friends', null)
      } else {
        updateProfileStatus('request_sent', response?.id || previousRequestId)
      }
    } catch {
      updateProfileStatus(previousStatus, previousRequestId)
      toast.error('Could not send friend request.')
    }
  }

  const onCancelRequest = async () => {
    if (!profile) return
    const previousStatus = profile.friendship_status
    const previousRequestId = profile.request_id || null
    updateProfileStatus('none', null)
    try {
      await cancelFriendRequest(userId)
    } catch {
      updateProfileStatus(previousStatus, previousRequestId)
      toast.error('Could not cancel friend request.')
    }
  }

  const onAcceptRequest = async () => {
    if (!profile?.request_id) return
    const previousStatus = profile.friendship_status
    const previousRequestId = profile.request_id
    updateProfileStatus('friends', null)
    try {
      await acceptFriendRequest(profile.request_id)
    } catch {
      updateProfileStatus(previousStatus, previousRequestId)
      toast.error('Could not accept friend request.')
    }
  }

  const onDeclineRequest = async () => {
    if (!profile?.request_id) return
    const previousStatus = profile.friendship_status
    const previousRequestId = profile.request_id
    updateProfileStatus('none', null)
    try {
      await rejectFriendRequest(profile.request_id)
    } catch {
      updateProfileStatus(previousStatus, previousRequestId)
      toast.error('Could not decline friend request.')
    }
  }

  const onUnfriend = async () => {
    const ok = window.confirm('Unfriend this user?')
    if (!ok) return
    const previousStatus = profile.friendship_status
    const previousRequestId = profile.request_id || null
    updateProfileStatus('none', null)
    try {
      await unfriend(userId)
    } catch {
      updateProfileStatus(previousStatus, previousRequestId)
      toast.error('Could not unfriend user.')
    }
  }

  const openVibeViewer = (startVibeId = null, source = activeVibes) => {
    if (!source.length) return
    const ordered = [...source].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    let vibesForView = ordered
    if (startVibeId) {
      const startIndex = ordered.findIndex((item) => item.id === startVibeId)
      if (startIndex > 0) {
        vibesForView = [...ordered.slice(startIndex), ...ordered.slice(0, startIndex)]
      }
    }

    setViewerGroup({
      user: {
        id: profile.id,
        username: profile.username,
        profile_pic: profile.profile_pic,
      },
      vibes: vibesForView,
      has_unseen: false,
    })
    setViewerOpen(true)
  }

  const onDeleteVibe = async (vibeId) => {
    try {
      await deleteVibe(vibeId)
      setVibes((prev) => prev.filter((item) => item.id !== vibeId))
      toast.success('Vibe deleted.')
    } catch {
      toast.error('Could not delete vibe.')
    }
  }

  const onPostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev])
    setSearchParams({})
    toast.success('Post created successfully!')
  }

  const onPostDeleted = (postId) => {
    setPosts((prev) => prev.filter((item) => item.id !== postId))
    setSelectedPost((prev) => (prev && prev.id === postId ? null : prev))
  }

  const renderActions = () => {
    const status = profile?.friendship_status || 'none'

    if (status === 'self' || isOwnProfile) {
      return (
        <GlowButton variant="secondary" onClick={() => navigate('/profile/edit')}>
          Edit Profile
        </GlowButton>
      )
    }

    if (status === 'friends') {
      return (
        <Stack direction="row" spacing={1}>
          <GlowButton variant="secondary" icon={<MessageRoundedIcon />} onClick={() => navigate(`/chat/${userId}`)}>
            Message
          </GlowButton>
          <Chip label="Friends ✓" color="success" onClick={onUnfriend} sx={{ cursor: 'pointer' }} />
        </Stack>
      )
    }

    if (status === 'request_sent') {
      return (
        <GlowButton variant="secondary" onClick={onCancelRequest}>
          Request Sent
        </GlowButton>
      )
    }

    if (status === 'request_received') {
      return (
        <Stack direction="row" spacing={1}>
          <GlowButton variant="primary" onClick={onAcceptRequest} sx={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            Accept
          </GlowButton>
          <GlowButton variant="danger" onClick={onDeclineRequest}>
            Decline
          </GlowButton>
        </Stack>
      )
    }

    return (
      <GlowButton
        variant="primary"
        icon={<PersonAddAlt1RoundedIcon />}
        onClick={onSendRequest}
      >
        Add Friend
      </GlowButton>
    )
  }

  return (
    <Container maxWidth={false} sx={{ maxWidth: 980, py: 3, bgcolor: isLight ? '#F0EFFF' : 'transparent', borderRadius: 3 }}>
      {loading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={140} />
          <Skeleton variant="rounded" height={280} />
        </Stack>
      ) : (
        <>
          <Stack
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            sx={{
              mb: 2.2,
              willChange: 'transform',
              p: 2,
              borderRadius: 3,
              bgcolor: isLight ? '#FFFFFF' : 'transparent',
              border: isLight ? '1px solid #E8E6FF' : 'none',
            }}
          >
            <Box
              onClick={() => hasActiveVibes && openVibeViewer()}
              sx={{
                p: hasActiveVibes ? '3px' : 0,
                borderRadius: '50%',
                width: 96,
                height: 96,
                minWidth: 96,
                minHeight: 96,
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                '--ring-angle': '0deg',
                background: hasActiveVibes
                  ? 'conic-gradient(from var(--ring-angle), #7C3AED, #EC4899, #06B6D4, #7C3AED)'
                  : 'transparent',
                animation: hasActiveVibes ? 'profileRingPulse 2.2s ease-in-out infinite' : 'none',
                cursor: hasActiveVibes ? 'pointer' : 'default',
                '@property --ring-angle': {
                  syntax: '"<angle>"',
                  inherits: false,
                  initialValue: '0deg',
                },
                '@keyframes profileRingPulse': {
                  '0%,100%': { '--ring-angle': '0deg', boxShadow: '0 0 0 rgba(124,58,237,0)' },
                  '50%': { '--ring-angle': '180deg', boxShadow: '0 0 18px rgba(124,58,237,0.6)' },
                },
              }}
            >
              <Avatar src={profile?.profile_pic || ''} sx={{ width: '100%', height: '100%' }}>
                {profile?.username?.[0]?.toUpperCase()}
              </Avatar>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={3} sx={{ mb: 1.2 }}>
                <Typography sx={{ color: isLight ? '#6B6B8A' : undefined }}><strong style={{ color: isLight ? '#1A1035' : undefined }}>{postsCount}</strong> Posts</Typography>
                <Typography sx={{ color: isLight ? '#6B6B8A' : undefined }}><strong style={{ color: isLight ? '#1A1035' : undefined }}>{friendsCount}</strong> Friends</Typography>
                <Typography sx={{ color: isLight ? '#6B6B8A' : undefined }}><strong style={{ color: isLight ? '#1A1035' : undefined }}>{vibesCount}</strong> Vibes</Typography>
              </Stack>

              <Typography sx={{ fontWeight: 800, color: isLight ? '#1A1035' : '#fff', mb: 0.4 }}>{profile?.username}</Typography>
              {profile?.bio && (
                <Typography sx={{ color: isLight ? '#6B6B8A' : 'text.secondary', mb: 1.2 }}>{profile.bio}</Typography>
              )}

              {renderActions()}
            </Box>
          </Stack>

          <Divider sx={{ borderColor: isLight ? '#E8E6FF' : 'rgba(255,255,255,0.12)', mb: 1.2 }} />

          <Tabs
            value={tabValue}
            onChange={(_, value) => {
              const nextTab = value === 1 ? 'vibes' : value === 2 ? 'tagged' : 'posts'
              setSearchParams(nextTab === 'posts' ? {} : { tab: nextTab })
            }}
            sx={{ mb: 1.4, bgcolor: isLight ? '#FFFFFF' : 'transparent', borderRadius: 2, px: 1, border: isLight ? '1px solid #E8E6FF' : 'none' }}
          >
            <Tab label="Posts" />
            <Tab label="Vibes" />
            <Tab label="Tagged" />
          </Tabs>

          {isOwnProfile && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              sx={{ mb: 1.4 }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Share something new from your profile.
              </Typography>
              <GlowButton
                variant="primary"
                icon={<AddRoundedIcon />}
                onClick={() => setPostComposerOpen(true)}
                sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}
              >
                Add Post
              </GlowButton>
            </Stack>
          )}

          <AnimatePresence mode="wait">
            {tabValue === 0 && (
            <Box
              key="posts"
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              ref={gridRef}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 1,
              }}
            >
              {posts.length === 0 && (
                <Box
                  sx={{
                    gridColumn: '1 / -1',
                    border: isLight ? '1px dashed #DDD9FF' : '1px dashed rgba(255,255,255,0.2)',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    bgcolor: isLight ? '#FFFFFF' : 'transparent',
                  }}
                >
                  <Typography sx={{ color: isLight ? '#1A1035' : '#fff', fontWeight: 700, mb: 1.2 }}>
                    No posts yet
                  </Typography>
                  {isOwnProfile ? (
                    <GlowButton variant="primary" icon={<AddRoundedIcon />} onClick={() => setPostComposerOpen(true)}>
                      Add Post
                    </GlowButton>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      This user has not posted yet.
                    </Typography>
                  )}
                </Box>
              )}

              {posts.map((post, index) => (
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 18 }}
                  animate={gridInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.05 }}
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  sx={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    cursor: 'pointer',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    bgcolor: isLight ? '#FFFFFF' : '#1E293B',
                    border: isLight ? '1px solid #E8E6FF' : 'none',
                    '&:hover .post-overlay': { opacity: 1 },
                  }}
                >
                  {post.image ? (
                    <Box component="img" src={post.image} alt="post" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        p: 1.1,
                        background: 'linear-gradient(135deg, rgba(167,139,250,0.6), rgba(244,114,182,0.5))',
                        display: 'grid',
                        placeItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.35 }}>
                        {post.content || 'Post'}
                      </Typography>
                    </Box>
                  )}

                  <Stack
                    className="post-overlay"
                    direction="row"
                    spacing={2}
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: isLight ? 'rgba(61,45,181,0.45)' : 'rgba(0,0,0,0.45)',
                      color: '#fff',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>❤ {post.likes_count || 0}</Typography>
                    <Typography sx={{ fontWeight: 700 }}>💬 {post.comments_count || 0}</Typography>
                  </Stack>
                </Box>
              ))}
            </Box>
          )}

          {tabValue === 1 && (
            <Box
              key="vibes"
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 1,
              }}
            >
              {vibes.length === 0 && (
                <Box
                  sx={{
                    gridColumn: '1 / -1',
                    border: isLight ? '1px dashed #DDD9FF' : '1px dashed rgba(255,255,255,0.2)',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    bgcolor: isLight ? '#FFFFFF' : 'transparent',
                  }}
                >
                  <Typography sx={{ color: isLight ? '#1A1035' : '#fff', fontWeight: 700, mb: 1.2 }}>
                    No vibes yet
                  </Typography>
                  {isOwnProfile ? (
                    <GlowButton variant="primary" icon={<AddRoundedIcon />} onClick={() => setPostComposerOpen(true)}>
                      Add Post
                    </GlowButton>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      This user has no vibes yet.
                    </Typography>
                  )}
                </Box>
              )}

              {vibes.map((vibe) => (
                <Box
                  key={vibe.id}
                  onClick={() => openVibeViewer(vibe.id, vibes)}
                  sx={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    bgcolor: isLight ? '#FFFFFF' : '#111827',
                    border: isLight ? '1px solid #E8E6FF' : 'none',
                  }}
                >
                  {vibe.media_type === 'image' && vibe.media && (
                    <Box component="img" src={vibe.media} alt="vibe" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}

                  {vibe.media_type === 'video' && vibe.media && (
                    <Box component="video" src={vibe.media} muted sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}

                  {vibe.media_type === 'note' && (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        p: 1,
                        background: 'linear-gradient(135deg, #A78BFA, #F472B6, #FBBF24)',
                        display: 'grid',
                        placeItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{vibe.note || 'Daily vibe'}</Typography>
                    </Box>
                  )}

                  {vibe.is_expired && (
                    <Chip
                      size="small"
                      label="Expired"
                      sx={{ position: 'absolute', top: 6, left: 6, bgcolor: 'rgba(15,23,42,0.75)', color: '#fff' }}
                    />
                  )}

                  {isOwnProfile && (
                    <GlowButton
                      size="small"
                      variant="danger"
                      onClick={(event) => {
                        event.stopPropagation()
                        onDeleteVibe(vibe.id)
                      }}
                      sx={{
                        position: 'absolute',
                        right: 6,
                        top: 6,
                        minWidth: 0,
                        p: 0.5,
                        bgcolor: 'rgba(15,23,42,0.75)',
                      }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </GlowButton>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {tabValue === 2 && (
            <Box
              key="tagged"
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              sx={{
                border: isLight ? '1px dashed #DDD9FF' : '1px dashed rgba(255,255,255,0.2)',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: isLight ? '#FFFFFF' : 'transparent',
              }}
            >
              <Typography sx={{ color: isLight ? '#1A1035' : '#fff', fontWeight: 700 }}>Tagged posts coming soon</Typography>
            </Box>
          )}
          </AnimatePresence>
        </>
      )}

      <Dialog open={Boolean(selectedPost)} onClose={() => setSelectedPost(null)} maxWidth="md" fullWidth>
        <Box sx={{ p: 2 }}>
          {selectedPost && <PostCard post={selectedPost} onChange={setSelectedPost} onDelete={onPostDeleted} />}
        </Box>
      </Dialog>

      <VibeViewerModal
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false)
          setViewerGroup(null)
          loadProfile()
        }}
        vibeGroup={viewerGroup}
        currentUserId={user?.id}
      />

      <CreatePostModal
        open={postComposerOpen}
        onClose={() => setPostComposerOpen(false)}
        onPostCreated={onPostCreated}
        hideFab
      />
    </Container>
  )
}

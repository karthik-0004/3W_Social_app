import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import MessageRoundedIcon from '@mui/icons-material/MessageRounded'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  Divider,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import {
  acceptFriendRequest,
  cancelFriendRequest,
  deleteVibe,
  getUserProfile,
  rejectFriendRequest,
  sendFriendRequest,
  unfriend,
} from '../api/axios'
import PostCard from '../components/PostCard'
import VibeViewerModal from '../components/VibeViewerModal'
import { useAuth } from '../context/AuthContext'

const TAB_MAP = {
  posts: 0,
  vibes: 1,
  tagged: 2,
}

export default function UserProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [vibes, setVibes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerGroup, setViewerGroup] = useState(null)

  const tabName = searchParams.get('tab') || 'posts'
  const tabValue = TAB_MAP[tabName] ?? 0

  const isOwnProfile = useMemo(() => String(user?.id) === String(userId), [user?.id, userId])
  const activeVibes = useMemo(() => vibes.filter((item) => !item.is_expired), [vibes])
  const hasActiveVibes = activeVibes.length > 0

  const loadProfile = async () => {
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
  }

  useEffect(() => {
    loadProfile()
  }, [userId])

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

  const renderActions = () => {
    const status = profile?.friendship_status || 'none'

    if (status === 'self' || isOwnProfile) {
      return (
        <Button variant="outlined" onClick={() => navigate('/profile/edit')}>
          Edit Profile
        </Button>
      )
    }

    if (status === 'friends') {
      return (
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<MessageRoundedIcon />} onClick={() => navigate(`/chat/${userId}`)}>
            Message
          </Button>
          <Chip label="Friends ✓" color="success" onClick={onUnfriend} sx={{ cursor: 'pointer' }} />
        </Stack>
      )
    }

    if (status === 'request_sent') {
      return (
        <Button variant="outlined" color="inherit" onClick={onCancelRequest}>
          Request Sent
        </Button>
      )
    }

    if (status === 'request_received') {
      return (
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={onAcceptRequest} sx={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            Accept
          </Button>
          <Button variant="outlined" color="error" onClick={onDeclineRequest}>
            Decline
          </Button>
        </Stack>
      )
    }

    return (
      <Button
        variant="contained"
        startIcon={<PersonAddAlt1RoundedIcon />}
        onClick={onSendRequest}
        sx={{ background: 'linear-gradient(135deg, #A78BFA, #F472B6)' }}
      >
        Add Friend
      </Button>
    )
  }

  return (
    <Container maxWidth={false} sx={{ maxWidth: 980, py: 3 }}>
      {loading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={140} />
          <Skeleton variant="rounded" height={280} />
        </Stack>
      ) : (
        <>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 2.2 }}>
            <Box
              onClick={() => hasActiveVibes && openVibeViewer()}
              sx={{
                p: hasActiveVibes ? '3px' : 0,
                borderRadius: '50%',
                width: 'fit-content',
                background: hasActiveVibes
                  ? 'conic-gradient(from 120deg, #A78BFA, #F472B6, #FBBF24, #A78BFA)'
                  : 'transparent',
                animation: hasActiveVibes ? 'profileVibeRing 3.8s linear infinite' : 'none',
                cursor: hasActiveVibes ? 'pointer' : 'default',
                '@keyframes profileVibeRing': {
                  from: { transform: 'rotate(0deg)' },
                  to: { transform: 'rotate(360deg)' },
                },
              }}
            >
              <Avatar src={profile?.profile_pic || ''} sx={{ width: 90, height: 90 }}>
                {profile?.username?.[0]?.toUpperCase()}
              </Avatar>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={3} sx={{ mb: 1.2 }}>
                <Typography><strong>{posts.length}</strong> Posts</Typography>
                <Typography><strong>{profile?.friends_count || 0}</strong> Friends</Typography>
                <Typography><strong>{activeVibes.length}</strong> Vibes</Typography>
              </Stack>

              <Typography sx={{ fontWeight: 800, color: '#fff', mb: 0.4 }}>{profile?.username}</Typography>
              {profile?.bio && (
                <Typography sx={{ color: 'text.secondary', mb: 1.2 }}>{profile.bio}</Typography>
              )}

              {renderActions()}
            </Box>
          </Stack>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mb: 1.2 }} />

          <Tabs
            value={tabValue}
            onChange={(_, value) => {
              const nextTab = value === 1 ? 'vibes' : value === 2 ? 'tagged' : 'posts'
              setSearchParams(nextTab === 'posts' ? {} : { tab: nextTab })
            }}
            sx={{ mb: 1.4 }}
          >
            <Tab label="Posts" />
            <Tab label="Vibes" />
            <Tab label="Tagged" />
          </Tabs>

          {tabValue === 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 1,
              }}
            >
              {posts.map((post) => (
                <Box
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  sx={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    cursor: 'pointer',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    bgcolor: '#1E293B',
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
                      bgcolor: 'rgba(0,0,0,0.45)',
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
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 1,
              }}
            >
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
                    bgcolor: '#111827',
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
                    <Button
                      size="small"
                      color="error"
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
                    </Button>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {tabValue === 2 && (
            <Box
              sx={{
                border: '1px dashed rgba(255,255,255,0.2)',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ color: '#fff', fontWeight: 700 }}>Tagged posts coming soon</Typography>
            </Box>
          )}
        </>
      )}

      <Dialog open={Boolean(selectedPost)} onClose={() => setSelectedPost(null)} maxWidth="md" fullWidth>
        <Box sx={{ p: 2 }}>
          {selectedPost && <PostCard post={selectedPost} onChange={setSelectedPost} />}
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
    </Container>
  )
}

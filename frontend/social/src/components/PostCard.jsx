import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import confetti from 'canvas-confetti'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  Popover,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'

import { commentPost, getFeedVibes, likePost } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import VibeViewerModal from './VibeViewerModal'

function PostCard({ post, onChange }) {
  const theme = useTheme()
  const isLight = theme.palette.mode === 'light'
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [comment, setComment] = useState('')
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [liking, setLiking] = useState(false)
  const [commenting, setCommenting] = useState(false)
  const [localPost, setLocalPost] = useState(post)
  const [reactionEmoji, setReactionEmoji] = useState(null)
  const [reactionAnchor, setReactionAnchor] = useState(null)
  const [showHeartBurst, setShowHeartBurst] = useState(false)
  const [lastTapTs, setLastTapTs] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [activeVibeGroup, setActiveVibeGroup] = useState(null)
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '-50px' })

  useEffect(() => {
    setLocalPost(post)
  }, [post])

  const username = localPost.username || 'User'
  const profileId = localPost.user_id || localPost.user?.id
  const profilePic = localPost.user_profile_pic || localPost.user?.profile_pic || ''
  const hasActiveVibe = Boolean(localPost.user_has_active_vibe)

  const likedByCurrentUser = useMemo(() => {
    if (!user?.username) return false
    return (localPost.likes || []).includes(user.username)
  }, [localPost.likes, user?.username])

  const avatarGradient = useMemo(() => {
    const value = username
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0)
    const hueA = value % 360
    const hueB = (value + 60) % 360
    return `linear-gradient(135deg, hsl(${hueA}, 80%, 58%), hsl(${hueB}, 85%, 63%))`
  }, [username])

  const handleLike = async () => {
    if (!isAuthenticated || liking) return
    const currentLikes = localPost.likes || []
    const nextLikes = likedByCurrentUser
      ? currentLikes.filter((name) => name !== user.username)
      : [...currentLikes, user.username]

    const optimisticPost = {
      ...localPost,
      likes: nextLikes,
      likes_count: nextLikes.length,
    }

    setLocalPost(optimisticPost)
    onChange?.(optimisticPost)

    setLiking(true)
    try {
      const response = await likePost(localPost.id)
      const syncedPost = {
        ...optimisticPost,
        likes: response.likes,
        likes_count: response.likes_count,
      }
      setLocalPost(syncedPost)
      onChange?.(syncedPost)
    } catch {
      setLocalPost(post)
      onChange?.(post)
      toast.error('Failed to update like status.')
    } finally {
      setLiking(false)
    }
  }

  const triggerLikeWithReaction = async (emoji = null) => {
    if (emoji) {
      setReactionEmoji(emoji)
    }
    await handleLike()
    confetti({ particleCount: 15, spread: 40, colors: ['#EC4899', '#F43F5E', '#FF6B9D'] })
    setShowHeartBurst(true)
    setTimeout(() => setShowHeartBurst(false), 650)
  }

  const onPostDoubleTap = () => {
    const now = Date.now()
    if (now - lastTapTs < 280) {
      triggerLikeWithReaction('❤️')
    }
    setLastTapTs(now)
  }

  const handleComment = async () => {
    if (!isAuthenticated || !comment.trim() || commenting) return
    const optimisticComment = {
      username: user.username,
      text: comment.trim(),
      created_at: new Date().toISOString(),
    }

    const optimisticComments = [...(localPost.comments || []), optimisticComment]
    const optimisticPost = {
      ...localPost,
      comments: optimisticComments,
      comments_count: optimisticComments.length,
    }

    setLocalPost(optimisticPost)
    onChange?.(optimisticPost)
    setComment('')

    setCommenting(true)
    try {
      const response = await commentPost(localPost.id, optimisticComment.text)
      const syncedPost = {
        ...optimisticPost,
        comments: response.comments,
        comments_count: response.comments_count,
      }
      setLocalPost(syncedPost)
      onChange?.(syncedPost)
    } catch {
      setLocalPost(post)
      onChange?.(post)
      toast.error('Failed to add comment.')
    } finally {
      setCommenting(false)
    }
  }

  const openProfileOrVibe = async () => {
    if (!profileId) return

    if (!hasActiveVibe) {
      navigate(`/profile/${profileId}`)
      return
    }

    try {
      const feed = await getFeedVibes()
      const found = (Array.isArray(feed) ? feed : []).find((item) => String(item.user?.id) === String(profileId))
      if (found?.vibes?.length) {
        setActiveVibeGroup(found)
        setViewerOpen(true)
        return
      }
    } catch {
      // Fall through to profile navigation.
    }

    navigate(`/profile/${profileId}`)
  }

  return (
    <Box
      ref={ref}
      component={motion.div}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45 }}
      sx={{ willChange: 'transform, opacity' }}
    >
      <Card
        sx={{
          borderRadius: 3,
          borderTop: localPost.is_friend_post ? '2px solid transparent' : 'none',
          borderImage: localPost.is_friend_post
            ? isLight
              ? 'linear-gradient(90deg, #6C5CE7, #3D2DB5) 1'
              : 'linear-gradient(135deg, #A78BFA, #F472B6) 1'
            : 'none',
          overflow: 'hidden',
        }}
      >
      <Box
        sx={{
          height: 2,
          background: isLight
            ? 'linear-gradient(90deg, #6C5CE7, #3D2DB5)'
            : 'linear-gradient(90deg, #7C3AED, #EC4899, #06B6D4)',
          backgroundSize: '200% 100%',
          animation: 'postShimmer 4s linear infinite',
          '@keyframes postShimmer': {
            from: { backgroundPosition: '0% 0%' },
            to: { backgroundPosition: '200% 0%' },
          },
        }}
      />
      <CardContent
        sx={{
          borderRadius: 2,
          background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
          backdropFilter: isLight ? 'none' : 'blur(12px)',
          border: isLight ? '1px solid #E8E6FF' : '1px solid rgba(255,255,255,0.08)',
          transition: 'transform 0.24s ease, box-shadow 0.24s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: isLight ? '0 8px 32px rgba(61,45,181,0.15)' : '0 18px 28px rgba(108,99,255,0.25)',
          },
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                p: hasActiveVibe ? '2.4px' : 0,
                borderRadius: '50%',
                background: hasActiveVibe
                  ? 'conic-gradient(from 120deg, #A78BFA, #F472B6, #FBBF24, #A78BFA)'
                  : 'transparent',
                animation: hasActiveVibe ? 'postVibeRing 3.4s linear infinite' : 'none',
                '@keyframes postVibeRing': {
                  from: { transform: 'rotate(0deg)' },
                  to: { transform: 'rotate(360deg)' },
                },
              }}
            >
              <Avatar
                src={profilePic}
                sx={{ background: avatarGradient, cursor: profileId ? 'pointer' : 'default' }}
                onClick={openProfileOrVibe}
              >
                {username.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: isLight ? '#1A1035' : '#fff', cursor: profileId ? 'pointer' : 'default' }}
                onClick={() => profileId && navigate(`/profile/${profileId}`)}
              >
                {username}
              </Typography>
              <Typography variant="caption" sx={{ color: isLight ? '#9898B3' : 'text.secondary' }}>
                {localPost.created_at
                  ? formatDistanceToNow(new Date(localPost.created_at), { addSuffix: true })
                  : 'just now'}
              </Typography>
            </Box>
          </Stack>

          {localPost.content && (
            <Typography sx={{ whiteSpace: 'pre-line', color: isLight ? '#2D2D4E' : 'rgba(255,255,255,0.92)' }}>
              {localPost.content}
            </Typography>
          )}

          {localPost.image && (
            <Box
              sx={{ position: 'relative' }}
              onClick={onPostDoubleTap}
              onDoubleClick={() => triggerLikeWithReaction('❤️')}
            >
              <Box
                component="img"
                src={localPost.image}
                alt="Post"
                sx={{
                  width: '100%',
                  maxHeight: 500,
                  objectFit: 'cover',
                  borderRadius: '12px',
                  transition: 'transform 0.4s ease',
                  '&:hover': { transform: 'scale(1.02)' },
                }}
              />
              {showHeartBurst && (
                <Typography
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: 54,
                    animation: 'heartPop 620ms ease',
                    pointerEvents: 'none',
                    '@keyframes heartPop': {
                      '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
                      '30%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1.2)' },
                      '100%': { opacity: 0, transform: 'translate(-50%, -50%) scale(1.4)' },
                    },
                  }}
                >
                  {reactionEmoji || '❤️'}
                </Typography>
              )}
            </Box>
          )}

          <Stack direction="row" spacing={1.8} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton
                onClick={(event) => {
                  if (event.shiftKey) {
                    setReactionAnchor(event.currentTarget)
                    return
                  }
                  triggerLikeWithReaction('❤️')
                }}
                onContextMenu={(event) => {
                  event.preventDefault()
                  setReactionAnchor(event.currentTarget)
                }}
                disabled={!isAuthenticated || liking}
                sx={{
                  transition: 'all 0.2s ease',
                  '& svg': { transition: 'transform 0.25s ease' },
                  '&:hover': {
                    transform: 'scale(1.08)',
                    boxShadow: '0 0 16px rgba(255,101,132,0.35)',
                  },
                  '&:hover svg': { transform: 'rotate(-10deg)' },
                }}
              >
                {likedByCurrentUser ? <FavoriteRoundedIcon sx={{ color: '#FF6B6B' }} /> : <FavoriteBorderRoundedIcon />}
              </IconButton>
              {reactionEmoji && (
                <Chip
                  size="small"
                  label={reactionEmoji}
                  onDelete={() => setReactionEmoji(null)}
                  sx={{ ml: 0.4, background: isLight ? '#EEF0FF' : 'rgba(255,255,255,0.08)' }}
                />
              )}
              <Typography variant="body2" color="text.secondary">
                {localPost.likes_count || 0}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton
                onClick={() => setCommentsOpen((prev) => !prev)}
                sx={{
                  transition: 'all 0.2s ease',
                  color: isLight ? '#6B6B8A' : undefined,
                  '&:hover': {
                    transform: 'scale(1.08)',
                    color: isLight ? '#3D2DB5' : undefined,
                    boxShadow: isLight ? '0 0 16px rgba(61,45,181,0.22)' : '0 0 16px rgba(108,99,255,0.35)',
                  },
                }}
              >
                <ChatBubbleOutlineRoundedIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {localPost.comments_count || 0}
              </Typography>
            </Stack>
          </Stack>

          <AnimatePresence>
            {commentsOpen && (
              <Box
                component={motion.div}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.24 }}
                sx={{ overflow: 'hidden', bgcolor: isLight ? '#F7F6FF' : 'transparent', borderRadius: 2, p: isLight ? 1 : 0 }}
              >
            <Stack spacing={1.5} sx={{ pt: 0.8 }}>
              <Stack spacing={1.1} sx={{ maxHeight: 300, overflowY: 'auto', pr: 0.5 }}>
                {(localPost.comments || []).map((item, index) => (
                  <Stack
                    component={motion.div}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={`${item.username}-${item.created_at}-${index}`}
                    direction="row"
                    spacing={1.2}
                    alignItems="flex-start"
                  >
                    <Avatar sx={{ width: 30, height: 30, fontSize: 13 }}>
                      {(item.username || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ color: isLight ? '#1A1035' : '#fff', fontWeight: 600 }}>
                        {item.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.text}
                      </Typography>
                      {item.created_at && (
                        <Typography variant="caption" color="text.disabled">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                ))}
              </Stack>

              {isAuthenticated && (
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleComment()
                    }
                  }}
                  InputProps={{
                    sx: {
                      bgcolor: isLight ? '#F0EFFF' : undefined,
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleComment} disabled={commenting || !comment.trim()}>
                          <SendRoundedIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Stack>
                </Box>
            )}
          </AnimatePresence>
        </Stack>

        <Popover
          open={Boolean(reactionAnchor)}
          anchorEl={reactionAnchor}
          onClose={() => setReactionAnchor(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          PaperProps={{ sx: { p: 0.7, borderRadius: 3 } }}
        >
          <Stack direction="row" spacing={0.7}>
            {['❤️', '🔥', '😂', '😍', '👏', '😮'].map((emoji) => (
              <IconButton
                key={emoji}
                onClick={() => {
                  setReactionAnchor(null)
                  triggerLikeWithReaction(emoji)
                }}
                sx={{ fontSize: 24 }}
              >
                {emoji}
              </IconButton>
            ))}
          </Stack>
        </Popover>
      </CardContent>

      <VibeViewerModal
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false)
          setActiveVibeGroup(null)
        }}
        vibeGroup={activeVibeGroup}
        currentUserId={user?.id}
      />
      </Card>
    </Box>
  )
}

export default PostCard

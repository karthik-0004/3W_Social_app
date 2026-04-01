import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Collapse,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { commentPost, likePost } from '../api/axios'
import { useAuth } from '../context/AuthContext'

function PostCard({ post, onChange }) {
  const { user, isAuthenticated } = useAuth()
  const [comment, setComment] = useState('')
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [liking, setLiking] = useState(false)
  const [commenting, setCommenting] = useState(false)
  const [localPost, setLocalPost] = useState(post)

  useEffect(() => {
    setLocalPost(post)
  }, [post])

  const username = localPost.username || 'User'

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

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent
        sx={{
          borderRadius: 2,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          transition: 'transform 0.24s ease, box-shadow 0.24s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 18px 28px rgba(108,99,255,0.25)',
          },
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar src={localPost.user?.profile_pic || ''} sx={{ background: avatarGradient }}>
              {username.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff' }}>
                {username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {localPost.created_at
                  ? formatDistanceToNow(new Date(localPost.created_at), { addSuffix: true })
                  : 'just now'}
              </Typography>
            </Box>
          </Stack>

          {localPost.content && (
            <Typography sx={{ whiteSpace: 'pre-line', color: 'rgba(255,255,255,0.92)' }}>
              {localPost.content}
            </Typography>
          )}

          {localPost.image && (
            <Box
              component="img"
              src={localPost.image}
              alt="Post"
              sx={{ width: '100%', maxHeight: 500, objectFit: 'cover', borderRadius: '12px' }}
            />
          )}

          <Stack direction="row" spacing={1.8} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton
                onClick={handleLike}
                disabled={!isAuthenticated || liking}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.08)',
                    boxShadow: '0 0 16px rgba(255,101,132,0.35)',
                  },
                }}
              >
                {likedByCurrentUser ? <FavoriteRoundedIcon sx={{ color: '#FF6584' }} /> : <FavoriteBorderRoundedIcon />}
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {localPost.likes_count || 0}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton
                onClick={() => setCommentsOpen((prev) => !prev)}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.08)',
                    boxShadow: '0 0 16px rgba(108,99,255,0.35)',
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

          <Collapse in={commentsOpen} timeout={280}>
            <Stack spacing={1.5}>
              <Stack spacing={1.1} sx={{ maxHeight: 300, overflowY: 'auto', pr: 0.5 }}>
                {(localPost.comments || []).map((item, index) => (
                  <Stack key={`${item.username}-${item.created_at}-${index}`} direction="row" spacing={1.2} alignItems="flex-start">
                    <Avatar sx={{ width: 30, height: 30, fontSize: 13 }}>
                      {(item.username || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
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
          </Collapse>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default PostCard

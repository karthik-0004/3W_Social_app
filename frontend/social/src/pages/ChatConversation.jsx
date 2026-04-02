import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EmojiEmotionsRoundedIcon from '@mui/icons-material/EmojiEmotionsRounded'
import ImageRoundedIcon from '@mui/icons-material/ImageRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Avatar,
  Box,
  Card,
  Chip,
  Container,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { format, isToday, isYesterday } from 'date-fns'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { deleteMessage, getConversation, getUserProfile, reactToMessage, sendMessage } from '../api/axios'
import EmojiPicker from '../components/EmojiPicker'
import GlowButton from '../components/GlowButton'
import { useAuth } from '../context/AuthContext'

const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '🔥', '👍', '👎']

function formatDateDivider(dateString) {
  const date = new Date(dateString)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMMM d')
}

function mergeIncomingMessages(previous, incoming) {
  const pending = previous.filter((item) => String(item.id).startsWith('tmp-'))
  const incomingIds = new Set(incoming.map((item) => String(item.id)))
  const safePending = pending.filter((item) => !incomingIds.has(String(item.id)))
  return [...incoming, ...safePending]
}

function applyOptimisticReaction(messages, messageId, emoji, username) {
  return messages.map((item) => {
    if (String(item.id) !== String(messageId) || item.is_deleted) return item

    const summary = Array.isArray(item.reaction_summary)
      ? item.reaction_summary.map((entry) => ({ ...entry }))
      : []
    const hadSame = summary.some((entry) => entry.emoji === emoji && entry.reacted)
    const withoutMine = summary
      .map((entry) => {
        const nextCount = entry.reacted ? Math.max(0, entry.count - 1) : entry.count
        return { ...entry, reacted: false, count: nextCount }
      })
      .filter((entry) => entry.count > 0)

    if (!hadSame) {
      const existing = withoutMine.find((entry) => entry.emoji === emoji)
      if (existing) {
        existing.count += 1
        existing.reacted = true
      } else {
        withoutMine.push({ emoji, count: 1, reacted: true })
      }
    }

    return {
      ...item,
      reaction_summary: withoutMine.sort((a, b) => b.count - a.count),
      reactions: item.reactions || {},
      _optimistic_user: username,
    }
  })
}

export default function ChatConversation() {
  const theme = useTheme()
  const isLight = theme.palette.mode === 'light'
  const { user } = useAuth()
  const navigate = useNavigate()
  const { userId } = useParams()

  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [isForbidden, setIsForbidden] = useState(false)
  const [friendData, setFriendData] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [lightboxImage, setLightboxImage] = useState(null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [reactionMenu, setReactionMenu] = useState(null)

  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)
  const inputToolsRef = useRef(null)
  const longPressRef = useRef(null)

  const otherUsername = useMemo(() => {
    if (friendData?.user?.username) return friendData.user.username
    const msg = messages.find((item) => String(item.sender) === String(userId) || String(item.receiver) === String(userId))
    if (!msg) return `User ${userId}`
    return String(msg.sender) === String(userId) ? msg.sender_username : msg.receiver_username
  }, [friendData?.user?.username, messages, userId])

  const otherAvatar = useMemo(() => {
    if (friendData?.user?.profile_pic) return friendData.user.profile_pic
    const msg = messages.find((item) => String(item.sender) === String(userId) || String(item.receiver) === String(userId))
    if (!msg) return ''
    return String(msg.sender) === String(userId) ? msg.sender_profile_pic : msg.receiver_profile_pic
  }, [friendData?.user?.profile_pic, messages, userId])

  const groupedTimeline = useMemo(() => {
    const sorted = [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    const timeline = []
    let lastDateKey = ''

    for (const item of sorted) {
      const dateKey = format(new Date(item.created_at), 'yyyy-MM-dd')
      if (dateKey !== lastDateKey) {
        timeline.push({ type: 'divider', id: `divider-${dateKey}`, label: formatDateDivider(item.created_at) })
        lastDateKey = dateKey
      }
      timeline.push({ type: 'message', id: `msg-${item.id}`, message: item })
    }

    return timeline
  }, [messages])

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getUserProfile(userId)
        setFriendData(data)
      } catch {
        // Profile fetch is optional for chat.
      }
    }

    loadUser()
  }, [userId])

  useEffect(() => {
    const loadConversation = async (silent = false) => {
      if (!silent) setLoading(true)
      try {
        const data = await getConversation(userId)
        const incoming = Array.isArray(data) ? data : []
        setMessages((prev) => mergeIncomingMessages(prev, incoming))
        setIsForbidden(false)
      } catch (error) {
        if (error?.response?.status === 403) {
          setIsForbidden(true)
          setMessages([])
          return
        }
        if (!silent) toast.error('Failed to load conversation.')
      } finally {
        if (!silent) setLoading(false)
      }
    }

    loadConversation(false)
    const interval = setInterval(() => loadConversation(true), 4000)
    return () => clearInterval(interval)
  }, [userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [groupedTimeline.length])

  useEffect(() => {
    if (!reactionMenu) return

    const close = () => setReactionMenu(null)
    document.addEventListener('mousedown', close)
    document.addEventListener('scroll', close, true)

    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('scroll', close, true)
    }
  }, [reactionMenu])

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    }
  }, [imagePreviewUrl])

  const openReactionMenu = (event, message) => {
    const x = event?.clientX ?? event?.changedTouches?.[0]?.clientX ?? window.innerWidth / 2
    const y = event?.clientY ?? event?.changedTouches?.[0]?.clientY ?? window.innerHeight / 2
    setReactionMenu({
      messageId: message.id,
      mine: String(message.sender) === String(user?.id),
      x,
      y,
    })
  }

  const startLongPress = (event, message) => {
    if (longPressRef.current) clearTimeout(longPressRef.current)
    longPressRef.current = setTimeout(() => {
      openReactionMenu(event, message)
    }, 500)
  }

  const clearLongPress = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }

  const onChooseImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setSelectedImage(file)
    setImagePreviewUrl(URL.createObjectURL(file))
  }

  const clearSelectedImage = (preserveCurrentPreview = false) => {
    if (imagePreviewUrl && !preserveCurrentPreview) URL.revokeObjectURL(imagePreviewUrl)
    setSelectedImage(null)
    setImagePreviewUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSend = async () => {
    if (isForbidden) return

    const text = draft.trim()
    if (!text && !selectedImage) return

    const tempId = `tmp-${Date.now()}`
    const tempUrl = selectedImage ? imagePreviewUrl : null
    const optimistic = {
      id: tempId,
      sender: user.id,
      sender_username: user.username,
      sender_profile_pic: user.profile_pic || null,
      receiver: Number(userId),
      receiver_username: otherUsername,
      receiver_profile_pic: otherAvatar,
      text,
      image_url: tempUrl,
      message_type: text && selectedImage ? 'both' : selectedImage ? 'image' : 'text',
      is_deleted: false,
      reactions: {},
      reaction_summary: [],
      is_read: false,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, optimistic])

    const formData = new FormData()
    if (text) formData.append('text', text)
    if (selectedImage) formData.append('image', selectedImage)

    setDraft('')
    clearSelectedImage(true)
    setEmojiOpen(false)

    try {
      const sent = await sendMessage(userId, formData)
      setMessages((prev) => prev.map((item) => (item.id === tempId ? sent : item)))
    } catch (error) {
      setMessages((prev) => prev.filter((item) => item.id !== tempId))
      if (error?.response?.status === 403) {
        setIsForbidden(true)
        toast.error('You can only chat with friends.')
      } else {
        toast.error('Message send failed.')
      }
    }
  }

  const onReact = async (messageId, emoji) => {
    setMessages((prev) => applyOptimisticReaction(prev, messageId, emoji, user.username))
    try {
      const updated = await reactToMessage(messageId, emoji)
      setMessages((prev) => prev.map((item) => (String(item.id) === String(messageId) ? updated : item)))
    } catch {
      toast.error('Could not update reaction.')
      const data = await getConversation(userId)
      setMessages(Array.isArray(data) ? data : [])
    }
  }

  const onDeleteMessage = async (messageId) => {
    try {
      const updated = await deleteMessage(messageId)
      setMessages((prev) => prev.map((item) => (String(item.id) === String(messageId) ? updated : item)))
      setReactionMenu(null)
    } catch {
      toast.error('Could not delete message.')
    }
  }

  const canSend = !isForbidden && (draft.trim() || selectedImage)

  return (
    <Container maxWidth={false} sx={{ maxWidth: 980, py: 2.2, pb: 15, bgcolor: isLight ? '#F7F6FF' : 'transparent', borderRadius: 3 }}>
      <Card
        sx={{
          p: 1.4,
          mb: 1.3,
          position: 'sticky',
          top: 12,
          zIndex: 1200,
          background: isLight ? '#FFFFFF' : undefined,
          borderBottom: isLight ? '1px solid #E8E6FF' : undefined,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <GlowButton onClick={() => navigate('/chat')} variant="ghost" sx={{ minWidth: 0, p: 0.6 }}>
            <ArrowBackRoundedIcon />
          </GlowButton>

          <Avatar src={otherAvatar || ''} sx={{ width: 44, height: 44 }}>
            {otherUsername?.[0]?.toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, color: isLight ? '#1A1035' : '#fff' }}>{otherUsername}</Typography>
            <Stack direction="row" alignItems="center" spacing={0.6}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#22C55E',
                  animation: 'onlinePulse 1.4s ease-in-out infinite',
                  '@keyframes onlinePulse': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.4, transform: 'scale(1.5)' },
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Online
              </Typography>
            </Stack>
          </Box>

          <IconButton onClick={() => toast('Video call coming soon')}>
            <VideocamRoundedIcon />
          </IconButton>
          <IconButton onClick={() => toast('Voice call coming soon')}>
            <PhoneRoundedIcon />
          </IconButton>
        </Stack>
      </Card>

      <Card sx={{ p: 1.2, minHeight: '58vh' }}>
        {loading ? (
          <Typography color="text.secondary">Loading messages...</Typography>
        ) : isForbidden ? (
          <Stack spacing={1.2} sx={{ py: 4, alignItems: 'center' }}>
            <LockRoundedIcon color="warning" />
            <Typography>You can only chat with friends.</Typography>
            <GlowButton variant="secondary" onClick={() => navigate(`/profile/${userId}`)}>
              Open Profile
            </GlowButton>
          </Stack>
        ) : (
          <Stack spacing={1.3}>
            {groupedTimeline.map((item) => {
              if (item.type === 'divider') {
                return (
                  <Stack key={item.id} direction="row" alignItems="center" spacing={1} sx={{ py: 0.4 }}>
                    <Divider sx={{ flex: 1, borderColor: 'rgba(148,163,184,0.2)' }} />
                    <Typography variant="caption" sx={{ color: isLight ? '#9898B3' : '#94A3B8', px: 1 }}>
                      {item.label}
                    </Typography>
                    <Divider sx={{ flex: 1, borderColor: 'rgba(148,163,184,0.2)' }} />
                  </Stack>
                )
              }

              const msg = item.message
              const mine = String(msg.sender) === String(user?.id)
              const deleted = Boolean(msg.is_deleted)
              const hasImage = Boolean(msg.image_url)

              return (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                  <Box sx={{ maxWidth: { xs: '88%', md: '72%' } }}>
                    <Box
                      onContextMenu={(event) => {
                        event.preventDefault()
                        openReactionMenu(event, msg)
                      }}
                      onMouseDown={(event) => startLongPress(event, msg)}
                      onMouseUp={clearLongPress}
                      onMouseLeave={clearLongPress}
                      onTouchStart={(event) => startLongPress(event, msg)}
                      onTouchEnd={clearLongPress}
                      sx={{
                        px: 1.25,
                        py: 1,
                        borderRadius: mine ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                        color: mine ? '#fff' : isLight ? '#1A1035' : '#fff',
                        background: mine
                          ? isLight
                            ? 'linear-gradient(135deg, #3D2DB5, #6C5CE7)'
                            : 'linear-gradient(135deg, #7C3AED, #EC4899)'
                          : isLight
                            ? '#FFFFFF'
                            : 'linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.7))',
                        border: mine ? 'none' : isLight ? '1px solid #E8E6FF' : '1px solid rgba(148,163,184,0.25)',
                        cursor: 'pointer',
                      }}
                    >
                      {hasImage && !deleted && (
                        <Box
                          component="img"
                          src={msg.image_url}
                          alt="chat upload"
                          onClick={() => setLightboxImage(msg.image_url)}
                          sx={{
                            width: '100%',
                            maxHeight: 260,
                            borderRadius: 2,
                            objectFit: 'cover',
                            mb: msg.text ? 0.9 : 0,
                          }}
                        />
                      )}

                      {deleted ? (
                        <Typography sx={{ fontStyle: 'italic', color: 'rgba(203,213,225,0.9)' }}>
                          This message was deleted
                        </Typography>
                      ) : (
                        Boolean(msg.text) && <Typography sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                      )}

                      <Typography variant="caption" sx={{ display: 'block', mt: 0.4, opacity: 0.78 }}>
                        {format(new Date(msg.created_at), 'p')}
                      </Typography>
                    </Box>

                    {!deleted && Array.isArray(msg.reaction_summary) && msg.reaction_summary.length > 0 && (
                      <Stack direction="row" spacing={0.7} sx={{ mt: 0.6, flexWrap: 'wrap', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                        {msg.reaction_summary.map((entry) => (
                          <Chip
                            key={`${msg.id}-${entry.emoji}`}
                            label={`${entry.emoji} ${entry.count}`}
                            onClick={() => onReact(msg.id, entry.emoji)}
                            sx={{
                              color: isLight ? '#3D2DB5' : '#E2E8F0',
                              border: entry.reacted
                                ? isLight
                                  ? '1px solid #3D2DB5'
                                  : '1px solid rgba(236,72,153,0.9)'
                                : isLight
                                  ? '1px solid #DDD9FF'
                                  : '1px solid rgba(148,163,184,0.35)',
                              background: entry.reacted
                                ? isLight
                                  ? '#EEF0FF'
                                  : 'linear-gradient(135deg, rgba(124,58,237,0.45), rgba(236,72,153,0.3))'
                                : isLight
                                  ? '#F7F6FF'
                                  : 'rgba(15,23,42,0.6)',
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Box>
              )
            })}
            <Box ref={bottomRef} />
          </Stack>
        )}
      </Card>

      <Card
        sx={{
          p: 1.2,
          position: 'fixed',
          bottom: 82,
          right: { xs: 8, md: 24 },
          left: { xs: 8, md: 300 },
          zIndex: 1300,
          background: isLight ? '#FFFFFF' : undefined,
          borderTop: isLight ? '1px solid #E8E6FF' : undefined,
        }}
      >
        <Stack spacing={1}>
          {selectedImage && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 0.8, borderRadius: 2, bgcolor: 'rgba(124,58,237,0.16)' }}>
              <Box component="img" src={imagePreviewUrl} alt="preview" sx={{ width: 58, height: 58, borderRadius: 1.5, objectFit: 'cover' }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ color: '#E2E8F0', fontWeight: 600 }}>{selectedImage.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {(selectedImage.size / 1024).toFixed(1)} KB
                </Typography>
              </Box>
              <IconButton onClick={clearSelectedImage}>
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
          )}

          <Box sx={{ position: 'relative' }}>
            <Stack ref={inputToolsRef} direction="row" spacing={1} alignItems="center">
              <IconButton onClick={() => fileInputRef.current?.click()}>
                <ImageRoundedIcon />
              </IconButton>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onChooseImage} />

              <IconButton onClick={() => setEmojiOpen((prev) => !prev)}>
                <EmojiEmotionsRoundedIcon />
              </IconButton>

              <TextField
                fullWidth
                placeholder="Type a message..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={isForbidden}
                InputProps={{
                  sx: {
                    bgcolor: isLight ? '#F7F6FF' : undefined,
                  },
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    handleSend()
                  }
                }}
              />

              <GlowButton onClick={handleSend} disabled={!canSend} icon={<SendRoundedIcon />} sx={{ minWidth: 54 }} />
            </Stack>

            <EmojiPicker
              open={emojiOpen}
              onClose={() => setEmojiOpen(false)}
              anchorRef={inputToolsRef}
              onSelect={(emoji) => setDraft((prev) => `${prev}${emoji}`)}
            />
          </Box>
        </Stack>
      </Card>

      <AnimatePresence>
        {reactionMenu && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 4 }}
            onMouseDown={(event) => event.stopPropagation()}
            sx={{
              position: 'fixed',
              left: Math.min(reactionMenu.x, window.innerWidth - 310),
              top: Math.min(reactionMenu.y, window.innerHeight - 120),
              zIndex: 1600,
              p: 0.8,
              borderRadius: 999,
              border: isLight ? '1px solid #E8E6FF' : '1px solid rgba(124,58,237,0.35)',
              background: isLight ? '#FFFFFF' : 'rgba(8,12,20,0.92)',
              backdropFilter: isLight ? 'none' : 'blur(20px)',
              boxShadow: isLight ? '0 20px 60px rgba(61,45,181,0.15)' : '0 16px 45px rgba(0,0,0,0.42)',
            }}
          >
            <Stack direction="row" spacing={0.6} alignItems="center">
              {QUICK_REACTIONS.map((emoji, index) => (
                <Box
                  key={emoji}
                  component={motion.button}
                  whileHover={{ y: -6, scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    onReact(reactionMenu.messageId, emoji)
                    setReactionMenu(null)
                  }}
                  style={{
                    width: 34,
                    height: 34,
                    border: 'none',
                    borderRadius: '50%',
                    background: isLight ? '#EEF0FF' : 'rgba(124,58,237,0.16)',
                    cursor: 'pointer',
                    fontSize: 18,
                    animationDelay: `${index * 40}ms`,
                  }}
                >
                  {emoji}
                </Box>
              ))}

              {reactionMenu.mine && (
                <IconButton
                  size="small"
                  onClick={() => onDeleteMessage(reactionMenu.messageId)}
                  sx={{
                    color: '#FCA5A5',
                    border: '1px solid rgba(248,113,113,0.45)',
                    bgcolor: 'rgba(127,29,29,0.2)',
                    ml: 0.4,
                  }}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Box>
        )}
      </AnimatePresence>

      <Dialog open={Boolean(lightboxImage)} onClose={() => setLightboxImage(null)} maxWidth="lg" fullWidth>
        <DialogContent sx={{ p: 0, bgcolor: isLight ? '#FFFFFF' : '#020617' }}>
          {lightboxImage && (
            <Box component="img" src={lightboxImage} alt="fullscreen" sx={{ width: '100%', maxHeight: '88vh', objectFit: 'contain' }} />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  )
}

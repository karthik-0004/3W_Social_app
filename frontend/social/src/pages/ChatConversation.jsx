import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import { Avatar, Box, Button, Card, Container, Stack, TextField, Typography } from '@mui/material'
import { format } from 'date-fns'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { getConversation, sendMessage } from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function ChatConversation() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { userId } = useParams()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [isForbidden, setIsForbidden] = useState(false)
  const bottomRef = useRef(null)
  const initialLoadDoneRef = useRef(false)

  const otherUsername = useMemo(() => {
    const match = messages.find((item) => String(item.sender) === String(userId) || String(item.receiver) === String(userId))
    if (!match) return `User ${userId}`
    return String(match.sender) === String(userId) ? match.sender_username : match.receiver_username
  }, [messages, userId])

  useEffect(() => {
    const load = async (silent = false) => {
      if (!silent && !initialLoadDoneRef.current) {
        setLoading(true)
      }

      try {
        const data = await getConversation(userId)
        const incoming = Array.isArray(data) ? data : []

        setMessages((prev) => {
          if (!silent) return incoming

          const merged = [...prev]
          const knownIds = new Set(prev.map((item) => String(item.id)))
          for (const item of incoming) {
            if (!knownIds.has(String(item.id))) {
              merged.push(item)
            }
          }
          return merged
        })

        setIsForbidden(false)
      } catch (error) {
        const code = error?.response?.status
        if (code === 403) {
          setIsForbidden(true)
          setMessages([])
          return
        }
        if (!silent) {
          toast.error('Failed to load conversation.')
        }
      } finally {
        if (!silent && !initialLoadDoneRef.current) {
          setLoading(false)
          initialLoadDoneRef.current = true
        }
      }
    }

    initialLoadDoneRef.current = false
    setLoading(true)
    load(false)
    if (isForbidden) return

    const interval = setInterval(() => load(true), 3000)
    return () => clearInterval(interval)
  }, [isForbidden, userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (isForbidden) return

    const text = draft.trim()
    if (!text) return

    const optimistic = {
      id: `tmp-${Date.now()}`,
      sender: user.id,
      sender_username: user.username,
      receiver: Number(userId),
      receiver_username: otherUsername,
      text,
      is_read: false,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, optimistic])
    setDraft('')

    try {
      const sent = await sendMessage(userId, text)
      setMessages((prev) => [...prev.filter((msg) => msg.id !== optimistic.id), sent])
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimistic.id))
      const code = error?.response?.status
      if (code === 403) {
        setIsForbidden(true)
        toast.error('You can only chat with friends.')
      } else {
        toast.error('Message send failed.')
      }
    }
  }

  return (
    <Container maxWidth={false} sx={{ maxWidth: 860, py: 3, pb: 12 }}>
      <Card sx={{ p: 2, mb: 1.5 }}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Button onClick={() => navigate('/chat')} color="inherit" sx={{ minWidth: 0, p: 0.8 }}>
            <ArrowBackRoundedIcon />
          </Button>
          <Avatar>{otherUsername?.[0]?.toUpperCase()}</Avatar>
          <Typography
            sx={{ fontWeight: 700, cursor: 'pointer' }}
            onClick={() => navigate(`/profile/${userId}`)}
          >
            {otherUsername}
          </Typography>
        </Stack>
      </Card>

      <Card sx={{ p: 2, minHeight: '55vh' }}>
        {loading ? (
          <Typography color="text.secondary">Loading messages...</Typography>
        ) : isForbidden ? (
          <Stack spacing={1.2} sx={{ py: 4, alignItems: 'center' }}>
            <LockRoundedIcon color="warning" />
            <Typography>You can only chat with friends.</Typography>
            <Button variant="outlined" onClick={() => navigate(`/profile/${userId}`)}>
              Open Profile
            </Button>
          </Stack>
        ) : (
          <Stack spacing={1.4}>
            {messages.map((msg) => {
              const mine = msg.sender === user.id
              return (
                <Box key={msg.id} sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                  <Box
                    sx={{
                      maxWidth: '75%',
                      px: 1.4,
                      py: 1,
                      color: '#fff',
                      background: mine
                        ? 'linear-gradient(135deg, #A78BFA, #F472B6)'
                        : 'rgba(255,255,255,0.08)',
                      borderRadius: mine ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    }}
                  >
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                      {format(new Date(msg.created_at), 'p')}
                    </Typography>
                  </Box>
                </Box>
              )
            })}
            <Box ref={bottomRef} />
          </Stack>
        )}
      </Card>

      <Card sx={{ p: 1.2, position: 'fixed', bottom: 82, right: { xs: 8, md: 24 }, left: { xs: 8, md: 300 }, zIndex: 1100 }}>
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={isForbidden}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleSend()
              }
            }}
          />
          <Button onClick={handleSend} variant="contained" sx={{ minWidth: 54 }} disabled={isForbidden}>
            <SendRoundedIcon />
          </Button>
        </Stack>
      </Card>
    </Container>
  )
}

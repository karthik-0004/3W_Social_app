import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import { Avatar, Box, Card, Container, Stack, Typography } from '@mui/material'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { acceptFriendRequest, getNotifications, getPendingRequests, rejectFriendRequest } from '../api/axios'
import GlowButton from '../components/GlowButton'

const textByType = {
  follow: 'followed you',
  like: 'liked your post',
  comment: 'commented on your post',
  friend_request: 'sent you a friend request',
  friend_accepted: 'accepted your friend request',
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [notificationsResult, pendingResult] = await Promise.allSettled([getNotifications(), getPendingRequests()])

      if (notificationsResult.status === 'fulfilled') {
        setItems(Array.isArray(notificationsResult.value) ? notificationsResult.value : [])
      } else {
        setItems([])
        toast.error('Failed to load notifications.')
      }

      if (pendingResult.status === 'fulfilled') {
        setPendingRequests(Array.isArray(pendingResult.value) ? pendingResult.value : [])
      } else {
        setPendingRequests([])
      }

      setLoading(false)
    }

    load()
  }, [])

  const handleAccept = async (requestItem) => {
    const previous = [...pendingRequests]
    setPendingRequests((prev) => prev.filter((item) => item.id !== requestItem.id))
    try {
      await acceptFriendRequest(requestItem.id)
      toast.success(`You are now friends with ${requestItem.sender_username}!`)
    } catch {
      setPendingRequests(previous)
      toast.error('Failed to accept request.')
    }
  }

  const handleDecline = async (requestItem) => {
    const previous = [...pendingRequests]
    setPendingRequests((prev) => prev.filter((item) => item.id !== requestItem.id))
    try {
      await rejectFriendRequest(requestItem.id)
    } catch {
      setPendingRequests(previous)
      toast.error('Failed to decline request.')
    }
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        maxWidth: 760,
        py: 4,
        borderRadius: 3,
      }}
    >
      <Typography variant="h4" sx={{ mb: 2.5, fontWeight: 700, color: 'text.primary' }}>
        Notifications
      </Typography>

      {pendingRequests.length > 0 && (
        <Card sx={{ p: 1.2, mb: 2, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.14)' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 0.8, pt: 0.4, pb: 0.8 }}>
            <PersonAddAlt1RoundedIcon color="primary" fontSize="small" />
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
              Friend Requests
            </Typography>
          </Stack>
          <Stack spacing={0.8}>
            {pendingRequests.map((requestItem) => (
              <Stack
                key={requestItem.id}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.2}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{
                  p: 1.1,
                  borderRadius: 2,
                  bgcolor: 'background.default',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="center" sx={{ flex: 1 }}>
                  <Avatar sx={{ bgcolor: '#2A2F37', color: '#FFFFFF' }}>{requestItem.sender_username?.[0]?.toUpperCase()}</Avatar>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      {requestItem.sender_username}
                    </Box>{' '}
                    wants to be your friend
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.8}>
                  <GlowButton
                    size="small"
                    variant="primary"
                    onClick={() => handleAccept(requestItem)}
                    sx={{ background: 'linear-gradient(135deg, #3D2DB5, #6C5CE7)' }}
                  >
                    Accept
                  </GlowButton>
                  <GlowButton
                    size="small"
                    variant="danger"
                    onClick={() => handleDecline(requestItem)}
                    sx={{ bgcolor: 'transparent', border: '1px solid #FF6B6B', color: '#FF6B6B' }}
                  >
                    Decline
                  </GlowButton>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Card>
      )}

      <Card sx={{ p: 1.2, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.14)' }}>
        {loading ? (
          <Typography sx={{ px: 1.2, py: 2, color: 'text.secondary' }}>
            Loading notifications...
          </Typography>
        ) : items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <NotificationsNoneRoundedIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            <Typography sx={{ mt: 1.5, color: 'text.secondary' }}>
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0.8}>
            {items.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                spacing={1.3}
                alignItems="center"
                onClick={() => {
                  if (item.post) navigate('/feed')
                }}
                sx={{
                  p: 1.1,
                  borderRadius: 2,
                  borderLeft: item.is_read ? '3px solid transparent' : '3px solid #4D7DFF',
                  bgcolor: item.is_read ? 'background.default' : 'background.paper',
                  opacity: 1,
                  cursor: item.post ? 'pointer' : 'default',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <Avatar src={item.from_profile_pic || ''} sx={{ bgcolor: '#2A2F37', color: '#FFFFFF' }}>
                  {item.from_username?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      {item.from_username}
                    </Box>{' '}
                    {textByType[item.type] || 'sent an update'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </Card>
    </Container>
  )
}

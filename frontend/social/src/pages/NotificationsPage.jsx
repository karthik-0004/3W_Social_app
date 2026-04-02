import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import { Avatar, Box, Button, Card, Container, Stack, Typography } from '@mui/material'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { acceptFriendRequest, getNotifications, getPendingRequests, rejectFriendRequest } from '../api/axios'

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
      try {
        const [notificationsData, pendingData] = await Promise.all([getNotifications(), getPendingRequests()])
        setItems(Array.isArray(notificationsData) ? notificationsData : [])
        setPendingRequests(Array.isArray(pendingData) ? pendingData : [])
      } catch {
        toast.error('Failed to load notifications.')
      } finally {
        setLoading(false)
      }
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
    <Container maxWidth={false} sx={{ maxWidth: 760, py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2.5, fontWeight: 700 }}>
        Notifications
      </Typography>

      {pendingRequests.length > 0 && (
        <Card sx={{ p: 1.2, mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 0.8, pt: 0.4, pb: 0.8 }}>
            <PersonAddAlt1RoundedIcon color="primary" fontSize="small" />
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
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
                  background: 'rgba(167,139,250,0.08)',
                  border: '1px solid rgba(167,139,250,0.18)',
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="center" sx={{ flex: 1 }}>
                  <Avatar>{requestItem.sender_username?.[0]?.toUpperCase()}</Avatar>
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      {requestItem.sender_username}
                    </Box>{' '}
                    wants to be your friend
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.8}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleAccept(requestItem)}
                    sx={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                  >
                    Accept
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleDecline(requestItem)}>
                    Decline
                  </Button>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Card>
      )}

      <Card sx={{ p: 1.2 }}>
        {loading ? (
          <Typography sx={{ px: 1.2, py: 2 }} color="text.secondary">
            Loading notifications...
          </Typography>
        ) : items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <NotificationsNoneRoundedIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            <Typography sx={{ mt: 1.5 }} color="text.secondary">
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
                  borderLeft: item.is_read ? '3px solid transparent' : '3px solid #A78BFA',
                  background: item.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(167,139,250,0.08)',
                  opacity: item.is_read ? 0.7 : 1,
                  cursor: item.post ? 'pointer' : 'default',
                }}
              >
                <Avatar src={item.from_profile_pic || ''}>{item.from_username?.[0]?.toUpperCase()}</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 700 }}>
                      {item.from_username}
                    </Box>{' '}
                    {textByType[item.type] || 'sent an update'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
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

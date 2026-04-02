import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import {
  Avatar,
  Box,
  Chip,
  ClickAwayListener,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import {
  acceptFriendRequest,
  cancelFriendRequest,
  rejectFriendRequest,
  searchUsers,
  sendFriendRequest,
  unfriend,
} from '../api/axios'
import useDebounce from '../hooks/useDebounce'
import GlowButton from './GlowButton'

export default function SearchBar() {
  const theme = useTheme()
  const isLight = theme.palette.mode === 'light'
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [friendshipState, setFriendshipState] = useState({})
  const normalizedQuery = useMemo(() => query.trim(), [query])
  const debouncedQuery = useDebounce(normalizedQuery, 400)

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([])
      setOpen(false)
      return
    }

    let isActive = true

    const runSearch = async () => {
      setLoading(true)
      try {
        const data = await searchUsers(debouncedQuery)
        if (!isActive) return

        setResults(data)
        setFriendshipState(
          data.reduce((acc, item) => {
            acc[item.id] = {
              status: item.friendship_status || 'none',
              requestId: item.request_id || null,
            }
            return acc
          }, {}),
        )
        setOpen(true)
      } catch {
        toast.error('Search failed. Please try again.')
      } finally {
        if (isActive) setLoading(false)
      }
    }

    runSearch()

    return () => {
      isActive = false
    }
  }, [debouncedQuery])

  const updateUserStatus = (userId, status, requestId = null) => {
    setFriendshipState((prev) => ({ ...prev, [userId]: { status, requestId } }))
    setResults((prev) =>
      prev.map((item) =>
        item.id === userId
          ? {
              ...item,
              friendship_status: status,
              request_id: requestId,
            }
          : item,
      ),
    )
  }

  const onSendRequest = async (userId) => {
    const previous = friendshipState[userId] || { status: 'none', requestId: null }
    updateUserStatus(userId, 'request_sent', previous.requestId)
    try {
      const response = await sendFriendRequest(userId)
      if (response?.status === 'friends') {
        updateUserStatus(userId, 'friends', null)
      } else {
        updateUserStatus(userId, 'request_sent', response?.id || previous.requestId)
      }
    } catch {
      updateUserStatus(userId, previous.status, previous.requestId)
      toast.error('Could not send friend request.')
    }
  }

  const onCancelRequest = async (userId) => {
    const previous = friendshipState[userId] || { status: 'request_sent', requestId: null }
    updateUserStatus(userId, 'none', null)
    try {
      await cancelFriendRequest(userId)
    } catch {
      updateUserStatus(userId, previous.status, previous.requestId)
      toast.error('Could not cancel friend request.')
    }
  }

  const onAcceptRequest = async (userId, requestId) => {
    const previous = friendshipState[userId] || { status: 'request_received', requestId }
    updateUserStatus(userId, 'friends', null)
    try {
      await acceptFriendRequest(requestId)
    } catch {
      updateUserStatus(userId, previous.status, previous.requestId)
      toast.error('Could not accept friend request.')
    }
  }

  const onRejectRequest = async (userId, requestId) => {
    const previous = friendshipState[userId] || { status: 'request_received', requestId }
    updateUserStatus(userId, 'none', null)
    try {
      await rejectFriendRequest(requestId)
    } catch {
      updateUserStatus(userId, previous.status, previous.requestId)
      toast.error('Could not reject friend request.')
    }
  }

  const onUnfriend = async (userId) => {
    const shouldUnfriend = window.confirm('Unfriend this user?')
    if (!shouldUnfriend) return

    const previous = friendshipState[userId] || { status: 'friends', requestId: null }
    updateUserStatus(userId, 'none', null)
    try {
      await unfriend(userId)
    } catch {
      updateUserStatus(userId, previous.status, previous.requestId)
      toast.error('Could not unfriend user.')
    }
  }

  const renderAction = (item) => {
    const current = friendshipState[item.id] || {
      status: item.friendship_status || 'none',
      requestId: item.request_id || null,
    }
    const status = current.status
    const requestId = current.requestId

    if (status === 'self') return null

    if (status === 'none') {
      return (
        <GlowButton
          size="small"
          variant="primary"
          icon={<PersonAddAlt1RoundedIcon fontSize="small" />}
          onClick={() => onSendRequest(item.id)}
          sx={{ px: 1.4, py: 0.5 }}
        >
          Add Friend
        </GlowButton>
      )
    }

    if (status === 'request_sent') {
      return (
        <GlowButton size="small" variant="secondary" icon={<HourglassEmptyRoundedIcon fontSize="small" />} onClick={() => onCancelRequest(item.id)}>
          Request Sent
        </GlowButton>
      )
    }

    if (status === 'request_received') {
      return (
        <Stack direction="row" spacing={0.7}>
          <GlowButton
            size="small"
            variant="primary"
            onClick={() => onAcceptRequest(item.id, requestId)}
            sx={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
          >
            Accept
          </GlowButton>
          <GlowButton size="small" variant="danger" onClick={() => onRejectRequest(item.id, requestId)}>
            Decline
          </GlowButton>
        </Stack>
      )
    }

    return (
      <Chip
        label="Friends"
        icon={<CheckRoundedIcon sx={{ color: '#fff !important' }} />}
        onClick={() => onUnfriend(item.id)}
        sx={{ backgroundColor: 'success.main', color: '#fff', cursor: 'pointer' }}
      />
    )
  }

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: 'relative' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search users..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          InputProps={{
            startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
          }}
          onFocus={() => {
            if (normalizedQuery) setOpen(true)
          }}
        />

        {open && (
          <Paper
            sx={{
              mt: 1,
              p: 1,
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              maxHeight: 360,
              overflowY: 'auto',
              zIndex: 1300,
              background: isLight ? '#FFFFFF' : 'rgba(13,17,23,0.95)',
              border: isLight ? '1px solid #E8E6FF' : '1px solid rgba(167,139,250,0.18)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {loading ? (
              <Typography sx={{ py: 1.5, px: 1.2 }} color="text.secondary">
                Searching...
              </Typography>
            ) : results.length === 0 ? (
              <Typography sx={{ py: 1.5, px: 1.2 }} color="text.secondary">
                No users found
              </Typography>
            ) : (
              <Stack spacing={0.6}>
                {results.map((item) => {
                  return (
                    <Stack
                      key={item.id}
                      direction="row"
                      spacing={1.2}
                      alignItems="center"
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        '&:hover': { background: 'rgba(167,139,250,0.08)' },
                      }}
                    >
                      <Avatar
                        src={item.profile_pic || ''}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => {
                          navigate(`/profile/${item.id}`)
                          setOpen(false)
                        }}
                      >
                        {item.username?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box
                        sx={{ flex: 1, cursor: 'pointer' }}
                        onClick={() => {
                          navigate(`/profile/${item.id}`)
                          setOpen(false)
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.friends_count} friends
                        </Typography>
                      </Box>
                      {renderAction(item)}
                    </Stack>
                  )
                })}
              </Stack>
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  )
}

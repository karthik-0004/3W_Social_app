import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import GroupRoundedIcon from '@mui/icons-material/GroupRounded'
import { Avatar, Badge, Box, Card, Container, List, ListItemButton, Stack, Tab, Tabs, Typography } from '@mui/material'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { getFriends, getInbox } from '../api/axios'
import GlowButton from '../components/GlowButton'

export default function ChatPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [friends, setFriends] = useState([])
  const [tab, setTab] = useState('friends')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadInbox = async () => {
      setLoading(true)
      try {
        if (tab === 'messages') {
          const inboxData = await getInbox()
          setItems(Array.isArray(inboxData) ? inboxData : [])
        }
        const friendsData = await getFriends()
        setFriends(Array.isArray(friendsData) ? friendsData : [])
      } catch {
        if (tab === 'messages') {
          setItems([])
          toast.error('Messages are temporarily unavailable. You can still chat with friends from the Friends tab.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadInbox()
  }, [tab])

  return (
    <Container maxWidth={false} sx={{ maxWidth: 760, py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2.5, fontWeight: 700 }}>
        Messages
      </Typography>

      <Card sx={{ p: 0.6, mb: 1.4 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab value="messages" label="Messages" />
          <Tab value="friends" label="Friends" />
        </Tabs>
      </Card>

      <Card sx={{ p: 1.2 }}>
        {loading && (
          <Typography sx={{ px: 1.2, py: 2 }} color="text.secondary">
            Loading conversations...
          </Typography>
        )}

        {!loading && tab === 'messages' && items.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            <Typography sx={{ mt: 1.5 }} color="text.secondary">
              No conversations yet. Search for users to start chatting!
            </Typography>
          </Box>
        )}

        {!loading && tab === 'messages' && items.length > 0 && (
          <List disablePadding>
            {items.map((entry) => {
              const user = entry.user
              const last = entry.last_message
              return (
                <ListItemButton
                  key={user.id}
                  onClick={() => navigate(`/chat/${user.id}`)}
                  sx={{ borderRadius: 2, mb: 0.4, py: 1.2 }}
                >
                  <Avatar src={user.profile_pic || ''}>{user.username?.[0]?.toUpperCase()}</Avatar>
                  <Box sx={{ ml: 1.4, flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }}>{user.username}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {last?.text || 'No messages yet'}
                    </Typography>
                  </Box>
                  <Stack alignItems="flex-end" spacing={0.5}>
                    {last?.created_at && (
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(last.created_at), { addSuffix: true })}
                      </Typography>
                    )}
                    <Badge color="error" badgeContent={entry.unread_count} max={99} />
                  </Stack>
                </ListItemButton>
              )
            })}
          </List>
        )}

        {!loading && tab === 'friends' && friends.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <GroupRoundedIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            <Typography sx={{ mt: 1.5 }} color="text.secondary">
              No friends yet. Search for people to connect!
            </Typography>
          </Box>
        )}

        {!loading && tab === 'friends' && friends.length > 0 && (
          <List disablePadding>
            {friends.map((friend) => (
              <ListItemButton key={friend.id} sx={{ borderRadius: 2, mb: 0.4, py: 1.2 }}>
                <Avatar src={friend.profile_pic || ''}>{friend.username?.[0]?.toUpperCase()}</Avatar>
                <Box sx={{ ml: 1.4, flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }}>{friend.username}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    Friend
                  </Typography>
                </Box>
                <GlowButton variant="secondary" size="small" onClick={() => navigate(`/chat/${friend.id}`)}>
                  Message
                </GlowButton>
              </ListItemButton>
            ))}
          </List>
        )}
      </Card>
    </Container>
  )
}

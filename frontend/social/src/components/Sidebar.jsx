import ChatRoundedIcon from '@mui/icons-material/ChatRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded'
import {
  Avatar,
  Badge,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { getUnreadCount } from '../api/axios'
import { useAuth } from '../context/AuthContext'

const getNavItems = (userId) => [
  { label: 'Home', icon: <HomeRoundedIcon />, path: '/' },
  { label: 'My Vibes', icon: <WhatshotRoundedIcon />, path: `/profile/${userId}?tab=vibes` },
  { label: 'Messages', icon: <ChatRoundedIcon />, path: '/chat' },
  { label: 'Notifications', icon: <NotificationsRoundedIcon />, path: '/notifications' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [unread, setUnread] = useState({ notifications: 0, messages: 0, friend_requests: 0 })
  const navItems = getNavItems(user?.id)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await getUnreadCount()
        setUnread(data)
      } catch {
        // Ignore transient unread polling issues.
      }
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  const getBadge = (label) => {
    if (label === 'Messages') return unread.messages
    if (label === 'Notifications') return unread.notifications + unread.friend_requests
    return 0
  }

  const getUserColor = (username) => {
    const colors = ['#A78BFA', '#F472B6', '#34D399', '#60A5FA', '#FBBF24', '#F87171']
    let hash = 0
    for (const char of username || '') hash = char.charCodeAt(0) + hash
    return colors[hash % colors.length]
  }

  return (
    <Box
      sx={{
        width: '260px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: 'rgba(13,17,23,0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(167,139,250,0.1)',
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        zIndex: 1000,
      }}
    >
      <Box sx={{ mb: 4, mt: 1 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #A78BFA, #F472B6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}
        >
          W3 Social
        </Typography>
        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
          Share your world
        </Typography>
      </Box>

      <List sx={{ flex: 1, p: 0 }}>
        {navItems.map((item) => {
          const isActive =
            item.label === 'My Vibes'
              ? location.pathname.startsWith(`/profile/${user?.id || ''}`) && location.search.includes('tab=vibes')
              : location.pathname === item.path
          const badge = getBadge(item.label)
          return (
            <ListItem
              key={item.label}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '14px',
                mb: 0.5,
                cursor: 'pointer',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(244,114,182,0.1))'
                  : 'transparent',
                border: isActive ? '1px solid rgba(167,139,250,0.2)' : '1px solid transparent',
                '&:hover': { background: 'rgba(167,139,250,0.08)', borderRadius: '14px' },
                transition: 'all 0.2s',
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#A78BFA' : '#94A3B8' }}>
                <Badge badgeContent={badge} color="error" max={9}>
                  {item.icon}
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#F1F5F9' : '#94A3B8',
                  fontSize: '0.95rem',
                }}
              />
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(167,139,250,0.1)', my: 2 }} />

      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { opacity: 0.8 }, mb: 1 }}
        onClick={() => navigate(`/profile/${user?.id}`)}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: getUserColor(user?.username),
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          {user?.username?.[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#F1F5F9' }}>
            {user?.username}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            View profile
          </Typography>
        </Box>
        <Box
          onClick={(event) => {
            event.stopPropagation()
            logout()
          }}
          sx={{
            color: '#94A3B8',
            cursor: 'pointer',
            '&:hover': { color: '#F472B6' },
            display: 'flex',
          }}
        >
          <LogoutRoundedIcon fontSize="small" />
        </Box>
      </Box>
    </Box>
  )
}

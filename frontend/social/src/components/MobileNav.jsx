import ChatRoundedIcon from '@mui/icons-material/ChatRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import { Badge, BottomNavigation, BottomNavigationAction, Box } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { getUnreadCount } from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function MobileNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [unread, setUnread] = useState({ notifications: 0, messages: 0, friend_requests: 0 })

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await getUnreadCount()
        setUnread(data)
      } catch {
        // Ignore polling errors.
      }
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  const currentPath = useMemo(() => {
    if (location.pathname.startsWith('/chat')) return '/chat'
    if (location.pathname.startsWith('/notifications')) return '/notifications'
    if (location.pathname.startsWith('/profile')) return '/profile'
    return '/'
  }, [location.pathname])

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1200,
        background: 'rgba(13,17,23,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(167,139,250,0.1)',
      }}
    >
      <BottomNavigation
        value={currentPath}
        onChange={(_, value) => {
          if (value === '/profile') {
            navigate(`/profile/${user?.id || ''}`)
            return
          }
          navigate(value)
        }}
        sx={{
          background: 'transparent',
          '& .MuiBottomNavigationAction-root': { color: '#94A3B8' },
          '& .Mui-selected': { color: '#A78BFA' },
        }}
      >
        <BottomNavigationAction value="/" icon={<HomeRoundedIcon />} label="Home" />
        <BottomNavigationAction
          value="/chat"
          icon={
            <Badge badgeContent={unread.messages} color="error" max={9}>
              <ChatRoundedIcon />
            </Badge>
          }
          label="Chat"
        />
        <BottomNavigationAction
          value="/notifications"
          icon={
            <Badge badgeContent={unread.notifications + unread.friend_requests} color="error" max={9}>
              <NotificationsRoundedIcon />
            </Badge>
          }
          label="Alerts"
        />
        <BottomNavigationAction value="/profile" icon={<PersonRoundedIcon />} label="Profile" />
      </BottomNavigation>
    </Box>
  )
}

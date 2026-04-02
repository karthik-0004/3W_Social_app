import ChatRoundedIcon from '@mui/icons-material/ChatRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded'
import { motion } from 'framer-motion'
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

const SidebarMotion = motion(Box)
const ItemMotion = motion(ListItem)

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

  return (
    <SidebarMotion
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 84, damping: 16 }}
      sx={{
        width: '260px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: 'rgba(8,12,20,0.75)',
        backdropFilter: 'blur(28px)',
        borderRight: '1px solid rgba(124,58,237,0.15)',
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
            background: 'linear-gradient(90deg, #7C3AED, #EC4899, #06B6D4, #7C3AED)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
            animation: 'gradientShift 4s linear infinite',
            '@keyframes gradientShift': {
              from: { backgroundPosition: '0% 50%' },
              to: { backgroundPosition: '200% 50%' },
            },
          }}
        >
          W3 Social
        </Typography>
        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
          Premium social space
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
            <ItemMotion
              key={item.label}
              whileHover={{ x: 4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '14px',
                mb: 0.7,
                cursor: 'pointer',
                overflow: 'hidden',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.12))'
                  : 'transparent',
                border: isActive ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
                '&:hover': { background: 'rgba(124,58,237,0.1)' },
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              {isActive && (
                <Box
                  component={motion.div}
                  layoutId="activeIndicator"
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 6,
                    bottom: 6,
                    width: 4,
                    borderRadius: 8,
                    background: 'linear-gradient(180deg, #7C3AED, #EC4899)',
                  }}
                />
              )}

              <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#C4B5FD' : '#94A3B8' }}>
                <Badge badgeContent={badge} color="error" max={9}>
                  <Box sx={{ position: 'relative' }}>
                    {item.icon}
                    {item.label === 'Messages' && unread.messages > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          right: -8,
                          top: -2,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#EC4899',
                          animation: 'pulseDot 1.4s ease-in-out infinite',
                          '@keyframes pulseDot': {
                            '0%,100%': { opacity: 1, transform: 'scale(1)' },
                            '50%': { opacity: 0.5, transform: 'scale(1.5)' },
                          },
                        }}
                      />
                    )}
                  </Box>
                </Badge>
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#F8FAFC' : '#94A3B8',
                  fontSize: '0.95rem',
                }}
              />
            </ItemMotion>
          )
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(124,58,237,0.14)', my: 2 }} />

      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', mb: 1 }}
        onClick={() => navigate(`/profile/${user?.id}`)}
      >
        <Box sx={{ p: '2px', borderRadius: '50%', transition: 'all 0.25s ease', '&:hover': { boxShadow: 'var(--glow-purple)' } }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: '#7C3AED', fontWeight: 700, fontSize: '1rem' }}>
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#F8FAFC' }}>
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
            '&:hover': { color: '#EC4899' },
            display: 'flex',
          }}
        >
          <LogoutRoundedIcon fontSize="small" />
        </Box>
      </Box>
    </SidebarMotion>
  )
}

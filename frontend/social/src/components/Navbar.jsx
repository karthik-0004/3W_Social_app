import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useScrollTrigger,
} from '@mui/material'
import { useMemo, useState } from 'react'

import { useAuth } from '../context/AuthContext'

function Navbar() {
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 10 })
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)

  const initials = useMemo(() => {
    if (!user?.username) return 'U'
    return user.username.charAt(0).toUpperCase()
  }, [user])

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'rgba(26,26,46,0.65)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        boxShadow: trigger ? '0 8px 30px rgba(0,0,0,0.35)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(120deg, #6C63FF, #FF6584)',
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: '0.02em',
          }}
        >
          W3 Social
        </Typography>

        {user && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
              {user.username}
            </Typography>
            <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
              <Avatar src={user.profile_pic || ''} sx={{ width: 34, height: 34 }}>
                {initials}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  mt: 1,
                  background: 'rgba(20,20,36,0.95)',
                  border: '1px solid rgba(255,255,255,0.08)',
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setAnchorEl(null)
                  logout()
                }}
              >
                <MenuRoundedIcon fontSize="small" sx={{ mr: 1.2, opacity: 0.8 }} />
                Logout
                <ExitToAppRoundedIcon fontSize="small" sx={{ ml: 1 }} />
              </MenuItem>
            </Menu>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Navbar

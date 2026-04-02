import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import {
  Box,
  Card,
  CardContent,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

import { loginUser } from '../api/axios'
import AnimatedBackground from '../components/AnimatedBackground'
import GlowButton from '../components/GlowButton'
import { useAuth } from '../context/AuthContext'

const MotionCard = motion(Card)

const letterContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const letterItem = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
}

export default function Login() {
  const theme = useTheme()
  const isLight = theme.palette.mode === 'light'
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await loginUser(formData)
      login(response.user, response.access)
      confetti({
        particleCount: 80,
        spread: 70,
        colors: isLight ? ['#3D2DB5', '#6C5CE7', '#FF6B6B', '#FDCB6E'] : ['#7C3AED', '#EC4899', '#06B6D4'],
      })
      toast.success('Welcome back!')
      navigate('/feed', { replace: true })
    } catch {
      toast.error('Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, position: 'relative' }}>
      <AnimatedBackground />

      <MotionCard
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 110, damping: 14 }}
        sx={{
          width: '100%',
          maxWidth: 520,
          p: { xs: 1.2, md: 2 },
          position: 'relative',
          zIndex: 1,
          background: isLight ? '#FFFFFF' : undefined,
          border: isLight ? '1px solid #E8E6FF' : undefined,
          boxShadow: isLight ? '0 20px 60px rgba(61,45,181,0.12)' : undefined,
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Stack spacing={2.2} component="form" onSubmit={handleSubmit}>
            <Stack direction="row" justifyContent="center" variants={letterContainer} component={motion.div} initial="hidden" animate="show">
              {'W3 Social'.split('').map((letter, index) => (
                <Typography
                  key={`${letter}-${index}`}
                  component={motion.span}
                  variants={letterItem}
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: isLight ? 'linear-gradient(135deg, #3D2DB5, #6C5CE7)' : 'var(--gradient-main)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    whiteSpace: 'pre',
                  }}
                >
                  {letter}
                </Typography>
              ))}
            </Stack>

            <Typography color="text.secondary" textAlign="center" sx={{ mb: 1 }}>
              Welcome back
            </Typography>

            <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required fullWidth />

            <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <GlowButton variant="ghost" onClick={() => setShowPassword((prev) => !prev)} size="small">
                      {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                    </GlowButton>
                  </InputAdornment>
                ),
              }}
            />

            <GlowButton type="submit" fullWidth size="large" variant="primary" loading={loading} glow>
              Login
            </GlowButton>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Don&apos;t have an account?{' '}
              <Link component={RouterLink} to="/register" underline="hover" color="primary.main" fontWeight={700}>
                Sign up
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </MotionCard>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.1} sx={{ mt: 2.2, zIndex: 1 }}>
        {['✦ End-to-end encrypted', '✦ Daily Vibes', '✦ Real-time Chat'].map((item, index) => (
          <Box
            key={item}
            component={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.12 }}
            sx={{
              px: 1.5,
              py: 0.8,
              borderRadius: 999,
              border: isLight ? '1px solid #3D2DB5' : '1px solid rgba(124,58,237,0.25)',
              bgcolor: isLight ? '#FFFFFF' : 'rgba(8,12,20,0.58)',
              backdropFilter: isLight ? 'none' : 'blur(14px)',
              color: isLight ? '#3D2DB5' : '#C4B5FD',
              fontSize: 12,
            }}
          >
            {item}
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

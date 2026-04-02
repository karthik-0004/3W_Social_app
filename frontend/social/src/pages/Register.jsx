import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
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
} from '@mui/material'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

import { registerUser } from '../api/axios'
import AnimatedBackground from '../components/AnimatedBackground'
import GlowButton from '../components/GlowButton'
import { useAuth } from '../context/AuthContext'

const MotionCard = motion(Card)

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const response = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })
      login(response.user, response.access)
      toast.success('Account created successfully!')
      navigate('/feed', { replace: true })
    } catch {
      toast.error('Registration failed. Try another email or username.')
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
        sx={{ width: '100%', maxWidth: 560, p: { xs: 1.2, md: 2 }, position: 'relative', zIndex: 1 }}
      >
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Stack spacing={2.2} component="form" onSubmit={handleSubmit}>
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                fontWeight: 800,
                background: 'var(--gradient-main)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              W3 Social
            </Typography>

            <Typography color="text.secondary" textAlign="center" sx={{ mb: 1 }}>
              Create your account
            </Typography>

            <TextField label="Username" name="username" value={formData.username} onChange={handleChange} required fullWidth />
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

            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <GlowButton variant="ghost" onClick={() => setShowConfirmPassword((prev) => !prev)} size="small">
                      {showConfirmPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                    </GlowButton>
                  </InputAdornment>
                ),
              }}
            />

            <GlowButton type="submit" fullWidth size="large" variant="primary" loading={loading} glow>
              Register
            </GlowButton>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" underline="hover" color="primary.main" fontWeight={700}>
                Login
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </MotionCard>
    </Box>
  )
}

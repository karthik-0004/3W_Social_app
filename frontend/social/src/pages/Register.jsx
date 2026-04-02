import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { registerUser } from '../api/axios'
import { useAuth } from '../context/AuthContext'

function Register() {
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

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields.')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error('Please enter a valid email address.')
      return
    }

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
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'grid', placeItems: 'center', px: 2 }}>
      <Box
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.4,
          background: '#A78BFA',
          top: -120,
          left: -100,
          animation: 'float1 14s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.4,
          background: '#F472B6',
          top: -80,
          right: -120,
          animation: 'float2 16s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.4,
          background: '#60A5FA',
          bottom: -180,
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'float1 18s ease-in-out infinite',
        }}
      />

      <Card
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 560,
          p: { xs: 1.2, md: 2 },
          borderRadius: 3,
          background: 'rgba(13,17,23,0.8)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(167,139,250,0.15)',
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Stack spacing={2.2} component="form" onSubmit={handleSubmit}>
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #A78BFA, #F472B6)',
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
                    <Button onClick={() => setShowPassword((prev) => !prev)} size="small" color="inherit" sx={{ minWidth: 0, px: 1 }}>
                      {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                    </Button>
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
                    <Button onClick={() => setShowConfirmPassword((prev) => !prev)} size="small" color="inherit" sx={{ minWidth: 0, px: 1 }}>
                      {showConfirmPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                    </Button>
                  </InputAdornment>
                ),
              }}
            />

            <Button type="submit" fullWidth size="large" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Register'}
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" underline="hover" color="primary.main" fontWeight={600}>
                Login
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          '@keyframes float1': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
            '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          },
          '@keyframes float2': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '33%': { transform: 'translate(-40px, 30px) scale(1.05)' },
            '66%': { transform: 'translate(20px, -40px) scale(0.95)' },
          },
        }}
      />
    </Box>
  )
}

export default Register

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

import { loginUser } from '../api/axios'
import { useAuth } from '../context/AuthContext'

function Login() {
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
      toast.success('Welcome back!')
      navigate('/feed', { replace: true })
    } catch (error) {
      const detail = error?.response?.data?.non_field_errors?.[0] || error?.response?.data?.detail || ''

      if (typeof detail === 'string' && detail.toLowerCase().includes('please register first')) {
        toast.error('No account found. Please register first.')
      } else {
        toast.error('Login failed. Check your credentials.')
      }
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
          maxWidth: 520,
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
                    <Button onClick={() => setShowPassword((prev) => !prev)} size="small" color="inherit" sx={{ minWidth: 0, px: 1 }}>
                      {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                    </Button>
                  </InputAdornment>
                ),
              }}
            />

            <Button type="submit" fullWidth size="large" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Login'}
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Don&apos;t have an account?{' '}
              <Link component={RouterLink} to="/register" underline="hover" color="primary.main" fontWeight={600}>
                Sign up
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

export default Login

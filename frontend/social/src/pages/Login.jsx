import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Fade,
  Grid,
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
    <Fade in timeout={550}>
      <Grid container sx={{ minHeight: '100dvh', p: { xs: 2, md: 3 }, gap: { xs: 2, md: 0 } }}>
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box
            sx={{
              height: '100%',
              borderRadius: 6,
              p: 5,
              color: '#fff',
              background:
                'linear-gradient(145deg, rgba(108,99,255,0.95), rgba(255,101,132,0.82)), radial-gradient(circle at 30% 20%, rgba(255,255,255,0.28), transparent 40%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              W3 Social
            </Typography>
            <Typography sx={{ mt: 1.2, opacity: 0.92, maxWidth: 380 }}>
              Share your world
            </Typography>

            <Stack spacing={2.2} sx={{ mt: 7 }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <LoginRoundedIcon />
                <Typography>Post your moments with image-rich stories.</Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <FavoriteRoundedIcon />
                <Typography>Like and react instantly with smooth interactions.</Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <ChatBubbleRoundedIcon />
                <Typography>Comment in real time and stay connected.</Typography>
              </Stack>
            </Stack>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ minHeight: '100%', display: 'grid', placeItems: 'center' }}>
            <Card
              sx={{
                width: '100%',
                maxWidth: 480,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Stack spacing={3} component="form" onSubmit={handleSubmit}>
                  <Box>
                    <Typography variant="h4">Welcome Back</Typography>
                    <Typography color="text.secondary">Sign in to jump back into your feed.</Typography>
                  </Box>

                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    fullWidth
                  />

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
                          <Button
                            onClick={() => setShowPassword((prev) => !prev)}
                            size="small"
                            color="inherit"
                            sx={{ minWidth: 0, px: 1 }}
                          >
                            {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    size="large"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      borderRadius: '999px',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                    }}
                  >
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
          </Box>
        </Grid>
      </Grid>
    </Fade>
  )
}

export default Login

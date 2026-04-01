import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'
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
                <PersonAddAltRoundedIcon />
                <Typography>Create your profile in seconds.</Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <FavoriteRoundedIcon />
                <Typography>Discover what your community is loving.</Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <ChatBubbleRoundedIcon />
                <Typography>Start conversations with comments and replies.</Typography>
              </Stack>
            </Stack>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ minHeight: '100%', display: 'grid', placeItems: 'center' }}>
            <Card
              sx={{
                width: '100%',
                maxWidth: 520,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Stack spacing={2.2} component="form" onSubmit={handleSubmit}>
                  <Box>
                    <Typography variant="h4">Create Account</Typography>
                    <Typography color="text.secondary">Join W3 Social and start posting today.</Typography>
                  </Box>

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
                          <Button
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            size="small"
                            color="inherit"
                            sx={{ minWidth: 0, px: 1 }}
                          >
                            {showConfirmPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
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
                    {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Create account'}
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
          </Box>
        </Grid>
      </Grid>
    </Fade>
  )
}

export default Register

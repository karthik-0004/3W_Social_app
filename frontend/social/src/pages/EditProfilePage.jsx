import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded'
import {
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { fetchProfile, updateProfile } from '../api/axios'
import { useAuth } from '../context/AuthContext'

const BIO_LIMIT = 150

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [form, setForm] = useState({
    username: '',
    bio: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      try {
        const me = await fetchProfile()
        setForm({
          username: me.username || '',
          bio: (me.bio || '').slice(0, BIO_LIMIT),
        })
        setAvatarPreview(me.profile_pic || '')
      } catch {
        toast.error('Could not load profile.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const onAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const onSave = async () => {
    if (!form.username.trim()) {
      toast.error('Username is required.')
      return
    }

    setSaving(true)
    try {
      const payload = new FormData()
      payload.append('username', form.username.trim())
      payload.append('bio', form.bio.trim())
      if (avatarFile) payload.append('profile_pic', avatarFile)

      const updated = await updateProfile(payload)
      updateUser(updated)
      toast.success('Profile updated.')
      navigate(`/profile/${user?.id || updated.id}`)
    } catch (error) {
      const message =
        error?.response?.data?.username?.[0] ||
        error?.response?.data?.bio?.[0] ||
        'Failed to update profile.'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          Edit Profile
        </Typography>

        {loading ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  p: '3px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #A78BFA, #F472B6, #FBBF24)',
                }}
              >
                <Avatar src={avatarPreview} sx={{ width: 82, height: 82 }}>
                  {form.username?.[0]?.toUpperCase() || 'U'}
                </Avatar>
              </Box>

              <Button component="label" variant="outlined" startIcon={<PhotoCameraRoundedIcon />}>
                Upload Avatar
                <input hidden type="file" accept="image/*" onChange={onAvatarChange} />
              </Button>
            </Stack>

            <TextField
              label="Username"
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              fullWidth
            />

            <TextField
              label="Bio"
              multiline
              minRows={4}
              value={form.bio}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  bio: event.target.value.slice(0, BIO_LIMIT),
                }))
              }
              fullWidth
            />
            <Typography variant="caption" sx={{ textAlign: 'right', color: 'text.secondary' }}>
              {form.bio.length}/{BIO_LIMIT}
            </Typography>

            <Stack direction="row" spacing={1.2} justifyContent="flex-end">
              <Button color="inherit" onClick={() => navigate(`/profile/${user?.id}`)}>
                Cancel
              </Button>
              <Button
                onClick={onSave}
                disabled={saving}
                sx={{
                  color: '#fff',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #A78BFA, #F472B6)',
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </Stack>
          </Stack>
        )}
      </Card>
    </Container>
  )
}

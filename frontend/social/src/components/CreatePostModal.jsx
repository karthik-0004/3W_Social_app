import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  Slide,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { forwardRef, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { createPost } from '../api/axios'
import GlowButton from './GlowButton'

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

function CreatePostModal({ onPostCreated, open: controlledOpen, onClose, hideFab = false }) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [internalOpen, setInternalOpen] = useState(false)
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const open = typeof controlledOpen === 'boolean' ? controlledOpen : internalOpen

  const previewUrl = useMemo(() => {
    if (!imageFile) return null
    return URL.createObjectURL(imageFile)
  }, [imageFile])

  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    },
    [previewUrl],
  )

  const resetAndClose = () => {
    setContent('')
    setImageFile(null)
    if (typeof controlledOpen === 'boolean') {
      onClose?.()
    } else {
      setInternalOpen(false)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, GIF, and WEBP images are allowed.')
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error('Image must be 5MB or smaller.')
      return
    }

    setImageFile(file)
  }

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return

    const formData = new FormData()
    formData.append('content', content)
    if (imageFile) {
      formData.append('image', imageFile)
    }

    setSubmitting(true)
    try {
      const createdPost = await createPost(formData)
      toast.success('Post created successfully!')
      onPostCreated?.(createdPost)
      resetAndClose()
    } catch {
      toast.error('Failed to create post.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {!hideFab && (
        <Fab
          aria-label="create post"
          onClick={() => setInternalOpen(true)}
          sx={{
            position: 'fixed',
            right: 22,
            bottom: 22,
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            color: '#fff',
            zIndex: 1200,
            '&:hover': {
              background: 'linear-gradient(135deg, #7B73FF, #FF7692)',
            },
          }}
        >
          <AddRoundedIcon />
        </Fab>
      )}

      <Dialog
        open={open}
        onClose={resetAndClose}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: isDark ? 'rgba(26,26,46,0.96)' : '#FFFFFF',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E8E6FF',
            color: isDark ? '#F8FAFC' : '#1A1035',
          },
        }}
      >
        <DialogTitle sx={{ color: isDark ? '#F8FAFC' : '#1A1035', fontWeight: 700 }}>Create Post</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              multiline
              minRows={3}
              maxRows={4}
              placeholder="What's on your mind?"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              fullWidth
              InputProps={{
                sx: {
                  color: isDark ? '#F8FAFC' : '#1A1035',
                  bgcolor: isDark ? 'rgba(15,23,42,0.55)' : '#F7F6FF',
                },
              }}
              sx={{
                '& .MuiInputBase-input::placeholder': {
                  color: isDark ? 'rgba(241,245,249,0.78)' : '#6B6B8A',
                  opacity: 1,
                },
              }}
            />

            <Box
              component="label"
              sx={{
                border: '1.5px dashed rgba(255,255,255,0.25)',
                borderRadius: 2,
                p: 2.4,
                textAlign: 'center',
                cursor: 'pointer',
                color: isDark ? '#E2E8F0' : '#1A1035',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(108,99,255,0.08)',
                },
              }}
            >
              <Stack spacing={1} alignItems="center">
                <AddPhotoAlternateRoundedIcon />
                <Typography variant="body2" sx={{ color: isDark ? 'rgba(226,232,240,0.85)' : '#6B6B8A' }}>
                  Click to upload image (JPG/PNG/GIF/WEBP, max 5MB)
                </Typography>
              </Stack>
              <input hidden type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleFileChange} />
            </Box>

            {previewUrl && (
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Preview"
                  sx={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 2 }}
                />
                <IconButton
                  onClick={() => setImageFile(null)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(0,0,0,0.55)',
                    color: '#fff',
                    '&:hover': { background: 'rgba(0,0,0,0.72)' },
                  }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {imageFile && (
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(226,232,240,0.85)' : '#6B6B8A' }}>
                {imageFile.name}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <GlowButton onClick={resetAndClose} variant="secondary">
            Cancel
          </GlowButton>
          <GlowButton
            onClick={handleSubmit}
            variant="primary"
            fullWidth
            disabled={submitting || (!content.trim() && !imageFile)}
            icon={submitting ? null : <SendRoundedIcon />}
            sx={{
              maxWidth: 280,
            }}
          >
            {submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Post now'}
          </GlowButton>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CreatePostModal

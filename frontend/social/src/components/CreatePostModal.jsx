import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import {
  Box,
  Button,
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
} from '@mui/material'
import { forwardRef, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { createPost } from '../api/axios'

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

function CreatePostModal({ onPostCreated }) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

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
    setOpen(false)
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
      <Fab
        aria-label="create post"
        onClick={() => setOpen(true)}
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

      <Dialog
        open={open}
        onClose={resetAndClose}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(26,26,46,0.96)',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      >
        <DialogTitle>Create Post</DialogTitle>
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
            />

            <Box
              component="label"
              sx={{
                border: '1.5px dashed rgba(255,255,255,0.25)',
                borderRadius: 2,
                p: 2.4,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(108,99,255,0.08)',
                },
              }}
            >
              <Stack spacing={1} alignItems="center">
                <AddPhotoAlternateRoundedIcon />
                <Typography variant="body2" color="text.secondary">
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
              <Typography variant="caption" color="text.secondary">
                {imageFile.name}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={resetAndClose} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            fullWidth
            disabled={submitting || (!content.trim() && !imageFile)}
            startIcon={submitting ? null : <SendRoundedIcon />}
            sx={{
              maxWidth: 280,
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            }}
          >
            {submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Post now'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CreatePostModal

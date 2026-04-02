import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import {
  Box,
  CircularProgress,
  Dialog,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import { createVibe } from '../api/axios'
import GlowButton from './GlowButton'

const NOTE_LIMIT = 150
const IMAGE_LIMIT_BYTES = 5 * 1024 * 1024
const VIDEO_LIMIT_BYTES = 30 * 1024 * 1024

function UploadZone({ accept, onSelect, preview, isVideo }) {
  const inputRef = useRef(null)

  return (
    <Box>
      <Box
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        sx={{
          borderRadius: 2,
          border: '2px dashed transparent',
          background:
            'linear-gradient(#0F172A, #0F172A) padding-box, linear-gradient(135deg, #A78BFA, #F472B6, #FBBF24) border-box',
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        <Typography sx={{ fontWeight: 700 }}>{isVideo ? 'Drop a short video here' : 'Drop an image here'}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {isVideo ? 'MP4 or WEBM up to 30MB / 30s' : 'PNG/JPG up to 5MB'}
        </Typography>
      </Box>
      <input
        ref={inputRef}
        hidden
        type="file"
        accept={accept}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onSelect(file)
        }}
      />

      {preview && (
        <Box sx={{ mt: 1.6, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
          {isVideo ? (
            <Box component="video" src={preview} controls sx={{ width: '100%', maxHeight: 260, objectFit: 'cover' }} />
          ) : (
            <Box component="img" src={preview} alt="preview" sx={{ width: '100%', maxHeight: 260, objectFit: 'cover' }} />
          )}
        </Box>
      )}
    </Box>
  )
}

export default function CreateVibeModal({ open, onClose, onCreated }) {
  const [tab, setTab] = useState(0)
  const [noteText, setNoteText] = useState('')
  const [overlayText, setOverlayText] = useState('')
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [posting, setPosting] = useState(false)

  const mediaType = useMemo(() => {
    if (tab === 0) return 'note'
    if (tab === 1) return 'image'
    return 'video'
  }, [tab])

  const resetState = () => {
    setTab(0)
    setNoteText('')
    setOverlayText('')
    setFile(null)
    setPreviewUrl('')
    setPosting(false)
  }

  const close = () => {
    resetState()
    onClose?.()
  }

  const validateVideoLength = (candidate) =>
    new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        if (video.duration > 30) {
          reject(new Error('Video must be 30 seconds or shorter.'))
        } else {
          resolve(true)
        }
      }
      video.onerror = () => {
        reject(new Error('Unable to read the selected video.'))
      }
      video.src = URL.createObjectURL(candidate)
    })

  const onSelectImage = (candidate) => {
    if (candidate.size > IMAGE_LIMIT_BYTES) {
      toast.error('Image must be 5MB or smaller.')
      return
    }
    setFile(candidate)
    setPreviewUrl(URL.createObjectURL(candidate))
  }

  const onSelectVideo = async (candidate) => {
    if (candidate.size > VIDEO_LIMIT_BYTES) {
      toast.error('Video must be 30MB or smaller.')
      return
    }
    try {
      await validateVideoLength(candidate)
      setFile(candidate)
      setPreviewUrl(URL.createObjectURL(candidate))
    } catch (error) {
      toast.error(error.message)
    }
  }

  const submit = async () => {
    if (posting) return

    if (mediaType === 'note' && !noteText.trim()) {
      toast.error('Write a short note for your vibe.')
      return
    }

    if ((mediaType === 'image' || mediaType === 'video') && !file) {
      toast.error('Please pick a file first.')
      return
    }

    const formData = new FormData()
    formData.append('media_type', mediaType)

    if (mediaType === 'note') {
      formData.append('note', noteText.trim())
    } else {
      formData.append('media', file)
      formData.append('note', overlayText.trim())
    }

    setPosting(true)
    try {
      const created = await createVibe(formData)
      toast.success('Your Daily Vibe is live for 24 hours! 🔥')
      onCreated?.(created)
      close()
    } catch {
      toast.error('Could not publish your vibe.')
    } finally {
      setPosting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          m: { xs: 0, sm: 2 },
          mt: 'auto',
          borderRadius: { xs: '18px 18px 0 0', sm: 3 },
          background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(15,23,42,0.96))',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, pt: 1.4 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Create Daily Vibe</Typography>
        <IconButton onClick={close}>
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="fullWidth" sx={{ px: 1.2 }}>
        <Tab label="📝 Note" />
        <Tab label="🖼️ Image" />
        <Tab label="🎥 Video" />
      </Tabs>

      <Box sx={{ px: 2, pb: 2.2, pt: 1.4 }}>
        {tab === 0 && (
          <Box
            sx={{
              p: 0.3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #A78BFA, #F472B6, #FBBF24)',
            }}
          >
            <Box
              sx={{
                borderRadius: 1.6,
                p: 1,
                background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(244,114,182,0.2))',
              }}
            >
              <TextField
                multiline
                fullWidth
                minRows={6}
                value={noteText}
                onChange={(event) => setNoteText(event.target.value.slice(0, NOTE_LIMIT))}
                placeholder="What's your vibe today?"
                InputProps={{ sx: { alignItems: 'flex-start' } }}
              />
              <Typography variant="caption" sx={{ mt: 0.6, display: 'block', textAlign: 'right', color: 'text.secondary' }}>
                {noteText.length}/{NOTE_LIMIT}
              </Typography>
            </Box>
          </Box>
        )}

        {tab === 1 && <UploadZone accept="image/*" onSelect={onSelectImage} preview={previewUrl} />}
        {tab === 2 && <UploadZone accept="video/mp4,video/webm" onSelect={onSelectVideo} preview={previewUrl} isVideo />}

        {(tab === 1 || tab === 2) && (
          <TextField
            fullWidth
            sx={{ mt: 1.4 }}
            value={overlayText}
            onChange={(event) => setOverlayText(event.target.value.slice(0, NOTE_LIMIT))}
            placeholder="Add a note overlay..."
          />
        )}

        <GlowButton
          fullWidth
          onClick={submit}
          disabled={posting}
          variant="primary"
          sx={{
            mt: 2,
            py: 1.15,
          }}
        >
          {posting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Post Daily Vibe'}
        </GlowButton>
      </Box>
    </Dialog>
  )
}

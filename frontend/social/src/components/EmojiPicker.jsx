import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { AnimatePresence, motion } from 'framer-motion'
import { Box, InputAdornment, Stack, TextField, useTheme } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'

const EMOJI_ALIASES = {
  '😀': 'grinning happy smile',
  '😃': 'smile happy joy',
  '😄': 'laugh smile happy',
  '😁': 'beam grin happy',
  '😆': 'laughing grin',
  '😅': 'sweat smile relief',
  '🤣': 'rofl laugh funny',
  '😂': 'joy laugh tears',
  '🙂': 'slight smile',
  '🙃': 'upside down smile',
  '😉': 'wink playful',
  '😊': 'blush smile warm',
  '🥰': 'love hearts smile',
  '😍': 'heart eyes love',
  '😘': 'kiss love',
  '👍': 'thumbs up like approve',
  '👎': 'thumbs down dislike reject',
  '👏': 'clap applause',
  '🙌': 'celebrate hooray',
  '🙏': 'pray thanks please',
  '❤️': 'heart love red',
  '💖': 'sparkle heart love',
  '💜': 'purple heart',
  '💙': 'blue heart',
  '🩵': 'light blue heart',
  '💚': 'green heart',
  '🧡': 'orange heart',
  '💛': 'yellow heart',
  '🖤': 'black heart',
  '🤍': 'white heart',
  '🤎': 'brown heart',
  '🔥': 'fire hot lit',
  '⚡': 'lightning electric',
  '✨': 'sparkles magic',
  '🌟': 'glowing star',
  '🚀': 'rocket launch',
  '🐶': 'dog puppy',
  '🐱': 'cat kitten',
  '🦁': 'lion',
  '🦄': 'unicorn',
  '🍕': 'pizza',
  '🍔': 'burger',
  '🍣': 'sushi',
  '🍜': 'noodles ramen',
  '☕': 'coffee',
  '🍰': 'cake dessert',
}

const CATEGORIES = [
  {
    key: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗'],
  },
  {
    key: 'Gestures',
    emojis: ['👍', '👎', '👏', '🙌', '🤝', '🙏', '👋', '🤟', '👌', '✌️', '🤘', '🤙', '🫶', '💪', '🫡', '✍️', '🖐️', '🤲'],
  },
  {
    key: 'Hearts',
    emojis: ['❤️', '💖', '💗', '💓', '💞', '💕', '💘', '💝', '🫶', '💜', '💙', '🩵', '💚', '🧡', '💛', '🖤', '🤍', '🤎'],
  },
  {
    key: 'Fire',
    emojis: ['🔥', '⚡', '✨', '🌟', '💥', '☄️', '🌋', '🧨', '🚀', '🎇', '🎆', '🌈', '💫', '🔆', '🌞', '🟠', '🟣', '🔮'],
  },
  {
    key: 'Animals',
    emojis: ['🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐸', '🐵', '🐧', '🐦', '🦄', '🐙', '🐬', '🦋', '🐝'],
  },
  {
    key: 'Food',
    emojis: ['🍕', '🍔', '🍟', '🌮', '🍣', '🍜', '🍩', '🍪', '🍫', '🍿', '🍎', '🍉', '🍓', '🥑', '🍇', '☕', '🧋', '🍰'],
  },
]

export default function EmojiPicker({ open, onClose, onSelect, anchorRef }) {
  const theme = useTheme()
  const isLight = theme.palette.mode === 'light'
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key)
  const [query, setQuery] = useState('')
  const pickerRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event) => {
      const target = event.target
      if (!pickerRef.current?.contains(target) && !anchorRef?.current?.contains(target)) {
        onClose?.()
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [open, onClose, anchorRef])

  const filtered = useMemo(() => {
    const source = CATEGORIES.find((item) => item.key === activeCategory)?.emojis || []
    const q = query.trim().toLowerCase()
    if (!q) return source
    return source.filter((emoji) => {
      const alias = EMOJI_ALIASES[emoji] || ''
      return emoji.includes(q) || alias.includes(q)
    })
  }, [activeCategory, query])

  return (
    <AnimatePresence>
      {open && (
        <Box
          ref={pickerRef}
          component={motion.div}
          initial={{ opacity: 0, scale: 0.88, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 6 }}
          transition={{ duration: 0.2 }}
          sx={{
            position: 'absolute',
            bottom: 'calc(100% + 12px)',
            left: 0,
            width: { xs: 'min(94vw, 380px)', sm: 380 },
            p: 1.2,
            borderRadius: 3,
            border: isLight ? '1px solid #E8E6FF' : '1px solid rgba(124,58,237,0.35)',
            background: isLight ? '#FFFFFF' : 'linear-gradient(145deg, rgba(13,18,31,0.96), rgba(8,12,20,0.96))',
            backdropFilter: isLight ? 'none' : 'blur(22px)',
            boxShadow: isLight ? '0 20px 60px rgba(61,45,181,0.15)' : '0 20px 50px rgba(0,0,0,0.45), var(--glow-purple)',
            zIndex: 1400,
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search emojis"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1.1 }}
          />

          <Stack direction="row" spacing={0.7} sx={{ overflowX: 'auto', pb: 0.8, mb: 0.7 }}>
            {CATEGORIES.map((item) => {
              const active = item.key === activeCategory
              return (
                <Box
                  key={item.key}
                  component={motion.button}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setActiveCategory(item.key)}
                  style={{
                    border: 'none',
                    borderRadius: 999,
                    padding: '6px 10px',
                    color: isLight ? '#1A1035' : '#fff',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    background: active
                      ? isLight
                        ? 'linear-gradient(135deg, #3D2DB5, #6C5CE7)'
                        : 'linear-gradient(135deg, #7C3AED, #EC4899)'
                      : isLight
                        ? '#EEF0FF'
                        : 'rgba(148,163,184,0.14)',
                  }}
                >
                  {item.key}
                </Box>
              )
            })}
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
              gap: 0.6,
              maxHeight: 255,
              overflowY: 'auto',
            }}
          >
            {filtered.map((emoji) => (
              <Box
                key={`${activeCategory}-${emoji}`}
                component={motion.button}
                whileHover={{ scale: 1.3, y: -2 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  onSelect?.(emoji)
                  onClose?.()
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: isLight ? '1px solid #DDD9FF' : '1px solid rgba(124,58,237,0.25)',
                  background: isLight ? '#F7F6FF' : 'rgba(15,23,42,0.65)',
                  fontSize: 22,
                  cursor: 'pointer',
                  margin: '0 auto',
                }}
              >
                {emoji}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </AnimatePresence>
  )
}

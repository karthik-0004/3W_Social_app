import DynamicFeedRoundedIcon from '@mui/icons-material/DynamicFeedRounded'
import { motion } from 'framer-motion'
import {
  Box,
  Container,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import Lottie from 'lottie-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import InfiniteScroll from 'react-infinite-scroll-component'

import { fetchPosts } from '../api/axios'
import CreatePostModal from '../components/CreatePostModal'
import DailyVibeBar from '../components/DailyVibeBar'
import PostCard from '../components/PostCard'
import PostSkeleton from '../components/PostSkeleton'
import { useAuth } from '../context/AuthContext'

const PAGE_SIZE = 10

function Feed() {
  const theme = useTheme()
  const isLight = theme.palette.mode === 'light'
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [vibeRefreshSignal, setVibeRefreshSignal] = useState(0)
  const [emptyAnimation, setEmptyAnimation] = useState(null)

  const loadPosts = async (targetPage = 1, append = false) => {
    try {
      const data = await fetchPosts(targetPage, PAGE_SIZE)
      const nextPosts = Array.isArray(data?.results) ? data.results : []

      setPosts((prev) => {
        if (!append) return nextPosts

        const seen = new Set(prev.map((item) => item.id))
        const merged = [...prev]
        for (const item of nextPosts) {
          if (!seen.has(item.id)) {
            merged.push(item)
            seen.add(item.id)
          }
        }
        return merged
      })

      setHasMore(Boolean(data?.next))
      setPage(targetPage)
    } catch {
      toast.error('Failed to load posts.')
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    loadPosts(1, false)
  }, [])

  useEffect(() => {
    fetch('https://assets2.lottiefiles.com/packages/lf20_ysrn2v.json')
      .then((response) => response.json())
      .then((data) => setEmptyAnimation(data))
      .catch(() => setEmptyAnimation(null))
  }, [])

  const fetchMore = () => {
    if (!hasMore) return
    loadPosts(page + 1, true)
  }

  const updatePost = (updatedPost) => {
    setPosts((prev) => prev.map((item) => (item.id === updatedPost.id ? updatedPost : item)))
  }

  const prependPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev])
  }

  return (
    <>
      <Container maxWidth={false} sx={{ pt: 1.2, pb: 10, maxWidth: { xs: '100%', md: 820 } }}>
        <DailyVibeBar refreshSignal={vibeRefreshSignal} onRefresh={() => setVibeRefreshSignal((value) => value + 1)} />

        <Box
          sx={{
            mb: 2.4,
            p: { xs: 2.2, md: 2.6 },
            borderRadius: 3,
            border: isLight ? '1px solid #E8E6FF' : '1px solid rgba(255,255,255,0.12)',
            background: 'linear-gradient(135deg, #3D2DB5, #6C5CE7)',
            backgroundSize: '200% 200%',
            animation: 'gradientMove 10s ease infinite',
            backdropFilter: isLight ? 'none' : 'blur(12px)',
            '@keyframes gradientMove': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' },
            },
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>
            Hello, {user?.username || 'there'}
            <Box component="span" sx={{ ml: 0.8 }}>
              👋
            </Box>
          </Typography>
          <Typography sx={{ mt: 0.4, color: 'rgba(255,255,255,0.85)' }}>
            Discover what your friends are posting right now.
          </Typography>
        </Box>

        {loading ? (
          <PostSkeleton />
        ) : posts.length === 0 ? (
          <Box
            sx={{
              mt: 7,
              textAlign: 'center',
              p: 4,
              borderRadius: 3,
              border: isLight ? '1px dashed #DDD9FF' : '1px dashed rgba(255,255,255,0.2)',
              bgcolor: isLight ? 'rgba(61,45,181,0.03)' : 'transparent',
            }}
          >
            {emptyAnimation ? (
              <Box sx={{ width: 210, mx: 'auto', mb: 1 }}>
                <Lottie animationData={emptyAnimation} loop autoplay />
              </Box>
            ) : (
              <DynamicFeedRoundedIcon sx={{ fontSize: 42, color: 'primary.main', mb: 1 }} />
            )}
            <Typography variant="h6" sx={{ color: isLight ? '#3D2DB5' : '#fff' }}>
              No posts yet. Be the first to share!
            </Typography>
          </Box>
        ) : (
          <InfiniteScroll
            dataLength={posts.length}
            next={fetchMore}
            hasMore={hasMore}
            loader={
              <Stack direction="row" justifyContent="center" sx={{ py: 2 }}>
                <Stack direction="row" spacing={0.8}>
                  {[0, 1, 2].map((dot) => (
                    <Box
                      key={dot}
                      component={motion.div}
                      animate={{ y: [0, -12, 0] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: dot * 0.15 }}
                      sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isLight ? '#3D2DB5' : '#C4B5FD' }}
                    />
                  ))}
                </Stack>
              </Stack>
            }
            endMessage={
              <Typography sx={{ py: 2, textAlign: 'center' }} color="text.secondary">
                You&apos;re all caught up! 🎉
              </Typography>
            }
          >
            <Stack spacing={2}>
              {posts.map((post, index) => (
                <Box
                  key={post.id}
                  sx={{
                    opacity: 0,
                    transform: 'translateY(10px)',
                    animation: 'feedItemIn 420ms ease forwards',
                    animationDelay: `${index * 45}ms`,
                    '@keyframes feedItemIn': {
                      to: {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                    },
                  }}
                >
                  <PostCard post={post} onChange={updatePost} />
                </Box>
              ))}
            </Stack>
          </InfiniteScroll>
        )}
      </Container>

      <CreatePostModal onPostCreated={prependPost} />
    </>
  )
}

export default Feed

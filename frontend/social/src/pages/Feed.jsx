import DynamicFeedRoundedIcon from '@mui/icons-material/DynamicFeedRounded'
import {
  Box,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import InfiniteScroll from 'react-infinite-scroll-component'

import { fetchPosts } from '../api/axios'
import CreatePostModal from '../components/CreatePostModal'
import Navbar from '../components/Navbar'
import PostCard from '../components/PostCard'
import PostSkeleton from '../components/PostSkeleton'
import { useAuth } from '../context/AuthContext'

const PAGE_SIZE = 10

function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)

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
      <Navbar />
      <Container maxWidth={false} sx={{ pt: 12, pb: 10, maxWidth: 680 }}>
        <Box
          sx={{
            mb: 2.4,
            p: { xs: 2.2, md: 2.6 },
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.12)',
            background:
              'linear-gradient(120deg, rgba(108,99,255,0.18), rgba(255,101,132,0.14)), rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>
            Hello, {user?.username || 'there'}
            <Box component="span" sx={{ ml: 0.8 }}>
              👋
            </Box>
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.4 }}>
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
              border: '1px dashed rgba(255,255,255,0.2)',
            }}
          >
            <DynamicFeedRoundedIcon sx={{ fontSize: 42, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" sx={{ color: '#fff' }}>
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
                <CircularProgress size={24} />
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

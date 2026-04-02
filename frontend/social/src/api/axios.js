import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || '',
  timeout: 15000,
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let activeRetryScopes = 0

const emitRetryState = (isRetrying) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('network:retry-state', {
      detail: {
        isRetrying,
        activeScopes: activeRetryScopes,
      },
    }),
  )
}

const shouldRetryRequest = (error) => {
  const status = error?.response?.status
  if (!status) return true
  return status === 408 || status === 429 || status >= 500
}

const withRetry = async (requestFactory, { attempts = 3, delayMs = 400 } = {}) => {
  let lastError = null
  let hasEmittedRetryStart = false

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const result = await requestFactory()
      if (hasEmittedRetryStart) {
        activeRetryScopes = Math.max(0, activeRetryScopes - 1)
        emitRetryState(activeRetryScopes > 0)
      }
      return result
    } catch (error) {
      lastError = error
      if (attempt === attempts || !shouldRetryRequest(error)) {
        if (hasEmittedRetryStart) {
          activeRetryScopes = Math.max(0, activeRetryScopes - 1)
          emitRetryState(activeRetryScopes > 0)
        }
        throw error
      }

      if (!hasEmittedRetryStart) {
        hasEmittedRetryStart = true
        activeRetryScopes += 1
        emitRetryState(true)
      }

      await sleep(delayMs * attempt)
    }
  }

  throw lastError
}

api.interceptors.request.use(
  (config) => {
    const token = window.sessionStorage.getItem('token') || window.localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const requestUrl = error?.config?.url || ''
    const skipAuthRedirect = Boolean(error?.config?.skipAuthRedirect)
    const isAuthEndpoint = requestUrl.includes('/api/auth/login/') || requestUrl.includes('/api/auth/register/')

    if (status === 401 && !skipAuthRedirect && !isAuthEndpoint) {
      window.sessionStorage.removeItem('token')
      window.sessionStorage.removeItem('user')
      window.localStorage.removeItem('token')
      window.localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export const registerUser = async (data) => {
  const response = await api.post('/api/auth/register/', data, { skipAuthRedirect: true })
  return response.data
}

export const loginUser = async (data) => {
  const response = await api.post('/api/auth/login/', data, { skipAuthRedirect: true })
  return response.data
}

export const fetchPosts = async (page = 1, limit = 10) => {
  const response = await withRetry(() => api.get(`/api/posts/?page=${page}&limit=${limit}`), {
    attempts: 3,
    delayMs: 450,
  })
  return response.data
}

export const createPost = async (formData) => {
  const response = await api.post('/api/posts/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const likePost = async (id) => {
  const response = await api.post(`/api/posts/${id}/like/`)
  return response.data
}

export const commentPost = async (id, text) => {
  const response = await api.post(`/api/posts/${id}/comment/`, { text })
  return response.data
}

export const deletePost = async (id) => {
  const response = await api.delete(`/api/posts/${id}/delete/`)
  return response.data
}

export const fetchProfile = async () => {
  const response = await api.get('/api/profile/')
  return response.data
}

export const updateProfile = async (payload) => {
  const isFormData = payload instanceof FormData
  const options = {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  }

  try {
    const response = await api.patch('/api/profile/update/', payload, options)
    return response.data
  } catch (error) {
    if (error?.response?.status !== 405) throw error
  }

  try {
    const response = await api.put('/api/profile/update/', payload, options)
    return response.data
  } catch (error) {
    if (error?.response?.status !== 405) throw error
  }

  const response = await api.post('/api/profile/update/', payload, options)
  return response.data
}

export const changePassword = async (current_password, new_password) => {
  const response = await api.post('/api/profile/change-password/', { current_password, new_password })
  return response.data
}

export const searchUsers = async (query) => {
  const response = await api.get(`/api/users/search/?q=${encodeURIComponent(query)}`)
  return response.data
}

export const sendFriendRequest = async (userId) => {
  const response = await api.post(`/api/users/${userId}/friend-request/`)
  return response.data
}

export const acceptFriendRequest = async (requestId) => {
  const response = await api.post(`/api/friend-requests/${requestId}/accept/`)
  return response.data
}

export const rejectFriendRequest = async (requestId) => {
  const response = await api.post(`/api/friend-requests/${requestId}/reject/`)
  return response.data
}

export const cancelFriendRequest = async (userId) => {
  const response = await api.post(`/api/users/${userId}/cancel-request/`)
  return response.data
}

export const unfriend = async (userId) => {
  const response = await api.post(`/api/users/${userId}/unfriend/`)
  return response.data
}

export const getPendingRequests = async () => {
  const response = await api.get('/api/friend-requests/')
  return response.data
}

export const getFriends = async () => {
  const response = await withRetry(() => api.get('/api/friends/'), {
    attempts: 3,
    delayMs: 400,
  })
  return response.data
}

export const getUserProfile = async (userId) => {
  const response = await api.get(`/api/profile/${userId}/`)
  return response.data
}

export const getInbox = async () => {
  const response = await withRetry(() => api.get('/api/chat/inbox/'), {
    attempts: 3,
    delayMs: 400,
  })
  return response.data
}

export const getConversation = async (userId) => {
  const response = await api.get(`/api/chat/${userId}/`)
  return response.data
}

export const sendMessage = async (userId, formData) => {
  const response = await withRetry(
    () => api.post(`/api/chat/${userId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    {
      attempts: 2,
      delayMs: 350,
    },
  )
  return response.data
}

export const reactToMessage = async (messageId, emoji) => {
  const response = await api.post(`/api/messages/${messageId}/react/`, { emoji })
  return response.data
}

export const deleteMessage = async (messageId) => {
  const response = await api.delete(`/api/messages/${messageId}/delete/`)
  return response.data
}

export const getNotifications = async () => {
  const response = await withRetry(() => api.get('/api/notifications/'), {
    attempts: 3,
    delayMs: 450,
  })
  return response.data
}

export const getUnreadCount = async () => {
  const response = await api.get('/api/notifications/unread/')
  return response.data
}

export const createVibe = async (formData) => {
  const response = await api.post('/api/vibes/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const getFeedVibes = async () => {
  const response = await api.get('/api/vibes/feed/')
  return response.data
}

export const viewVibe = async (vibeId) => {
  const response = await api.post(`/api/vibes/${vibeId}/view/`)
  return response.data
}

export const getMyVibes = async () => {
  const response = await api.get('/api/vibes/mine/')
  return response.data
}

export const deleteVibe = async (vibeId) => {
  const response = await api.delete(`/api/vibes/${vibeId}/delete/`)
  return response.data
}

export const reactToVibe = async (vibeId, emoji) => {
  const response = await api.post(`/api/vibes/${vibeId}/react/`, { emoji })
  return response.data
}

export default api

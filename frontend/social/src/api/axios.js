import axios from 'axios'

const api = axios.create({
  baseURL: '',
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
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
    if (error?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export const registerUser = async (data) => {
  const response = await api.post('/api/auth/register/', data)
  return response.data
}

export const loginUser = async (data) => {
  const response = await api.post('/api/auth/login/', data)
  return response.data
}

export const fetchPosts = async (page = 1, limit = 10) => {
  const response = await api.get(`/api/posts/?page=${page}&limit=${limit}`)
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
  const response = await api.get('/api/friends/')
  return response.data
}

export const getUserProfile = async (userId) => {
  const response = await api.get(`/api/profile/${userId}/`)
  return response.data
}

export const getInbox = async () => {
  const response = await api.get('/api/chat/inbox/')
  return response.data
}

export const getConversation = async (userId) => {
  const response = await api.get(`/api/chat/${userId}/`)
  return response.data
}

export const sendMessage = async (userId, text) => {
  const response = await api.post(`/api/chat/${userId}/`, { text })
  return response.data
}

export const getNotifications = async () => {
  const response = await api.get('/api/notifications/')
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

export default api

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

export default api

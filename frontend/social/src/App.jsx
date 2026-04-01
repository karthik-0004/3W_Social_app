import { Box, GlobalStyles } from '@mui/material'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'
import Feed from './pages/Feed'
import Login from './pages/Login'
import Register from './pages/Register'

function DefaultRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/feed' : '/login'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Feed />} />
        <Route path="/feed" element={<Feed />} />
      </Route>

      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <GlobalStyles
        styles={{
          '*::-webkit-scrollbar': { width: '10px', height: '10px' },
          '*::-webkit-scrollbar-track': { background: '#121225' },
          '*::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(180deg, #6C63FF, #FF6584)',
            borderRadius: '999px',
          },
          '*': { scrollbarWidth: 'thin', scrollbarColor: '#6C63FF #121225' },
        }}
      />
      <Box
        sx={{
          minHeight: '100dvh',
          background:
            'radial-gradient(circle at 10% 20%, rgba(108,99,255,0.2), transparent 35%), radial-gradient(circle at 80% 0%, rgba(255,101,132,0.2), transparent 30%), linear-gradient(180deg, #0F0F1A 0%, #111228 100%)',
        }}
      >
        <AppRoutes />
      </Box>
      <Toaster position="top-right" toastOptions={{ duration: 2800 }} />
    </AuthProvider>
  )
}

export default App

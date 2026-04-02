import { CssBaseline, ThemeProvider } from '@mui/material'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import ChatConversation from './pages/ChatConversation'
import EditProfilePage from './pages/EditProfilePage'
import ChatPage from './pages/ChatPage'
import Feed from './pages/Feed'
import Login from './pages/Login'
import NotificationsPage from './pages/NotificationsPage'
import Register from './pages/Register'
import UserProfilePage from './pages/UserProfilePage'
import theme from './theme/theme'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1A1A2E',
                color: '#F1F5F9',
                border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: '12px',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Feed />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/chat/:userId" element={<ChatConversation />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile/:userId" element={<UserProfilePage />} />
                <Route path="/profile/edit" element={<EditProfilePage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

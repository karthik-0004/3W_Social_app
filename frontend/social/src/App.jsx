import { CssBaseline, ThemeProvider } from '@mui/material'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import Layout from './components/Layout'
import PageTransition from './components/PageTransition'
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

function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <Register />
            </PageTransition>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Feed />
                </PageTransition>
              }
            />
            <Route
              path="/feed"
              element={
                <PageTransition>
                  <Feed />
                </PageTransition>
              }
            />
            <Route
              path="/chat"
              element={
                <PageTransition>
                  <ChatPage />
                </PageTransition>
              }
            />
            <Route path="/chat/:userId" element={<ChatConversation />} />
            <Route
              path="/notifications"
              element={
                <PageTransition>
                  <NotificationsPage />
                </PageTransition>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <PageTransition>
                  <UserProfilePage />
                </PageTransition>
              }
            />
            <Route path="/profile/edit" element={<EditProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  )
}

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
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

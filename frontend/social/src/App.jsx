import { CssBaseline, ThemeProvider, useTheme as useMuiTheme } from '@mui/material'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import Layout from './components/Layout'
import PageTransition from './components/PageTransition'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider as AppThemeProvider, useTheme } from './context/ThemeContext'
import ChatConversation from './pages/ChatConversation'
import EditProfilePage from './pages/EditProfilePage'
import ChatPage from './pages/ChatPage'
import Feed from './pages/Feed'
import Login from './pages/Login'
import NotificationsPage from './pages/NotificationsPage'
import Register from './pages/Register'
import UserProfilePage from './pages/UserProfilePage'
import { getTheme } from './theme/theme'

function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="sync" initial={false}>
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

function AppShell() {
  const { mode } = useTheme()
  const theme = getTheme(mode)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  )
}

function AppContent() {
  const theme = useMuiTheme()

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '12px',
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default function App() {
  return (
    <AppThemeProvider>
      <AppShell />
    </AppThemeProvider>
  )
}

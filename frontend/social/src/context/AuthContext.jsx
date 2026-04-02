/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const sessionUser = window.sessionStorage.getItem('user')
      if (sessionUser) return JSON.parse(sessionUser)
      const legacyUser = window.localStorage.getItem('user')
      return legacyUser ? JSON.parse(legacyUser) : null
    } catch {
      return null
    }
  })
  const [token, setTokenState] = useState(() => window.sessionStorage.getItem('token') || window.localStorage.getItem('token'))

  const login = useCallback((userData, authToken) => {
    setUser(userData)
    setTokenState(authToken)
    window.sessionStorage.setItem('user', JSON.stringify(userData))
    window.sessionStorage.setItem('token', authToken)
    window.localStorage.removeItem('user')
    window.localStorage.removeItem('token')
  }, [])

  const updateUser = useCallback((userData) => {
    setUser(userData)
    window.sessionStorage.setItem('user', JSON.stringify(userData))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setTokenState(null)
    window.sessionStorage.removeItem('user')
    window.sessionStorage.removeItem('token')
    window.localStorage.removeItem('user')
    window.localStorage.removeItem('token')
    window.location.href = '/login'
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      updateUser,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [user, token, login, updateUser, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

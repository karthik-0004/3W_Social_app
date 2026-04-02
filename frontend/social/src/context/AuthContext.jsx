/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import useLocalStorage from '../hooks/useLocalStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage('user', null)
  const [token, setTokenState] = useState(() => localStorage.getItem('token'))

  const login = useCallback((userData, authToken) => {
    setUser(userData)
    setTokenState(authToken)
    localStorage.setItem('token', authToken)
  }, [setUser])

  const updateUser = useCallback((userData) => {
    setUser(userData)
  }, [setUser])

  const logout = useCallback(() => {
    setUser(null)
    setTokenState(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    window.location.href = '/login'
  }, [setUser])

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

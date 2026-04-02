/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'

const ThemeContext = createContext(null)
const THEME_STORAGE_KEY = 'w3-theme'

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem(THEME_STORAGE_KEY)
    return savedMode === 'light' || savedMode === 'dark' ? savedMode : 'dark'
  })

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_STORAGE_KEY, next)
      return next
    })
  }

  const value = useMemo(
    () => ({
      mode,
      toggleTheme,
    }),
    [mode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

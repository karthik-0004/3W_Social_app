import { useState } from 'react'

export default function useLocalStorage(key, defaultValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setValue = (value) => {
    try {
      const nextValue = value instanceof Function ? value(storedValue) : value
      setStoredValue(nextValue)
      window.localStorage.setItem(key, JSON.stringify(nextValue))
    } catch {
      // Ignore localStorage write errors.
    }
  }

  return [storedValue, setValue]
}

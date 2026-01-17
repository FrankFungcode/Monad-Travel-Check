/**
 * @file useLocalStorage Hook
 * @description Custom hook for using localStorage with React state
 */

import { getItem, setItem } from '@/utils/storage'
import { useEffect, useState } from 'react'

/**
 * Custom hook for localStorage with state synchronization
 *
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [value, setValue, removeValue]
 *
 * @example
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'dark')
 *
 * // Update value (also updates localStorage)
 * setTheme('light')
 *
 * // Remove value from localStorage
 * removeTheme()
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = getItem<T>(key)
      return item ?? initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save state
      setStoredValue(valueToStore)

      // Save to localStorage
      setItem(key, valueToStore)
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Function to remove value from localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue)
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T)
        } catch {
          // If parsing fails, use the raw value
          setStoredValue(e.newValue as T)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key])

  return [storedValue, setValue, removeValue]
}

/**
 * Custom hook for localStorage with expiry support
 *
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 * @param ttl - Time to live in milliseconds
 * @returns Tuple of [value, setValue, removeValue, isExpired]
 *
 * @example
 * const [session, setSession, removeSession, isExpired] =
 *   useLocalStorageWithExpiry('session', null, 3600000) // 1 hour
 */
export function useLocalStorageWithExpiry<T>(
  key: string,
  initialValue: T,
  ttl: number
): [T, (value: T) => void, () => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item === null) {
        return initialValue
      }

      const parsed = JSON.parse(item) as {
        value: T
        expiry: number
      }

      if (Date.now() > parsed.expiry) {
        window.localStorage.removeItem(key)
        return initialValue
      }

      return parsed.value
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const [isExpired, setIsExpired] = useState<boolean>(false)

  const setValue = (value: T) => {
    try {
      const item = {
        value,
        expiry: Date.now() + ttl,
      }

      setStoredValue(value)
      setIsExpired(false)
      window.localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  const removeValue = () => {
    try {
      setStoredValue(initialValue)
      setIsExpired(false)
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }

  // Check expiry periodically
  // biome-ignore lint/correctness/useExhaustiveDependencies: removeValue is intentionally not in deps to avoid infinite loop
  useEffect(() => {
    const checkExpiry = () => {
      try {
        const item = window.localStorage.getItem(key)
        if (item === null) {
          return
        }

        const parsed = JSON.parse(item) as {
          value: T
          expiry: number
        }

        if (Date.now() > parsed.expiry) {
          setIsExpired(true)
          removeValue()
        }
      } catch (error) {
        console.error('Error checking expiry:', error)
      }
    }

    const interval = setInterval(checkExpiry, 1000)

    return () => clearInterval(interval)
  }, [key])

  return [storedValue, setValue, removeValue, isExpired]
}

/**
 * @file useDebounce Hook
 * @description Custom hook for debouncing values and callbacks
 */

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Custom hook to debounce a value
 *
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearchTerm = useDebounce(searchTerm, 500)
 *
 * useEffect(() => {
 *   // This effect runs when debouncedSearchTerm changes
 *   // API call with debouncedSearchTerm
 * }, [debouncedSearchTerm])
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook to debounce a callback function
 *
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced callback function
 *
 * @example
 * const handleSearch = useDebouncedCallback((term: string) => {
 *   // API call
 *   console.log('Searching for:', term)
 * }, 500)
 *
 * <input onChange={(e) => handleSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  )
}

/**
 * Custom hook to throttle a callback function
 *
 * @param callback - Function to throttle
 * @param delay - Delay in milliseconds
 * @returns Throttled callback function
 *
 * @example
 * const handleScroll = useThrottledCallback(() => {
 *   console.log('Scroll position:', window.scrollY)
 * }, 200)
 *
 * useEffect(() => {
 *   window.addEventListener('scroll', handleScroll)
 *   return () => window.removeEventListener('scroll', handleScroll)
 * }, [handleScroll])
 */
export function useThrottledCallback<T extends (...args: never[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback)
  const lastRunRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()

      if (now - lastRunRef.current >= delay) {
        callbackRef.current(...args)
        lastRunRef.current = now
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(
          () => {
            callbackRef.current(...args)
            lastRunRef.current = Date.now()
          },
          delay - (now - lastRunRef.current)
        )
      }
    },
    [delay]
  )
}

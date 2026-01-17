/**
 * @file LocalStorage Utility Functions
 * @description Type-safe wrapper for localStorage operations
 */

/**
 * Get an item from localStorage with type safety
 *
 * @param key - Storage key
 * @returns Parsed value or null if not found
 *
 * @example
 * interface User { name: string; age: number }
 * const user = getItem<User>('user')
 * // Returns: { name: 'John', age: 30 } or null
 *
 * @example
 * const token = getItem<string>('token')
 * // Returns: 'abc123' or null
 */
export function getItem<T>(key: string): T | null {
  try {
    const item = window.localStorage.getItem(key)
    if (item === null) {
      return null
    }
    return JSON.parse(item) as T
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error)
    return null
  }
}

/**
 * Set an item in localStorage with automatic JSON serialization
 *
 * @param key - Storage key
 * @param value - Value to store (will be JSON stringified)
 *
 * @example
 * setItem('user', { name: 'John', age: 30 })
 * // Stores: '{"name":"John","age":30}'
 *
 * @example
 * setItem('token', 'abc123')
 * // Stores: '"abc123"'
 */
export function setItem<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value)
    window.localStorage.setItem(key, serialized)
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error)
  }
}

/**
 * Remove an item from localStorage
 *
 * @param key - Storage key to remove
 *
 * @example
 * removeItem('token')
 * // Removes the 'token' key from localStorage
 */
export function removeItem(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error)
  }
}

/**
 * Clear all items from localStorage
 *
 * @example
 * clearAll()
 * // Removes all keys from localStorage
 */
export function clearAll(): void {
  try {
    window.localStorage.clear()
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

/**
 * Check if a key exists in localStorage
 *
 * @param key - Storage key to check
 * @returns True if key exists, false otherwise
 *
 * @example
 * hasItem('token')
 * // Returns: true or false
 */
export function hasItem(key: string): boolean {
  try {
    return window.localStorage.getItem(key) !== null
  } catch (error) {
    console.error(`Error checking localStorage key "${key}":`, error)
    return false
  }
}

/**
 * Get all keys from localStorage
 *
 * @returns Array of all storage keys
 *
 * @example
 * getKeys()
 * // Returns: ['user', 'token', 'theme']
 */
export function getKeys(): string[] {
  try {
    return Object.keys(window.localStorage)
  } catch (error) {
    console.error('Error getting localStorage keys:', error)
    return []
  }
}

/**
 * Get storage size in bytes
 *
 * @returns Approximate size of localStorage in bytes
 *
 * @example
 * getStorageSize()
 * // Returns: 1024 (approximate bytes used)
 */
export function getStorageSize(): number {
  try {
    let total = 0
    for (const key in window.localStorage) {
      if (Object.prototype.hasOwnProperty.call(window.localStorage, key)) {
        const value = window.localStorage[key]
        total += key.length + (value?.length || 0)
      }
    }
    return total
  } catch (error) {
    console.error('Error calculating storage size:', error)
    return 0
  }
}

/**
 * Get item with expiration support
 *
 * @param key - Storage key
 * @returns Value if not expired, null otherwise
 *
 * @example
 * setItemWithExpiry('temp', { data: 'test' }, 3600000) // 1 hour
 * const value = getItemWithExpiry<{data: string}>('temp')
 * // Returns: { data: 'test' } if not expired, null if expired
 */
export function getItemWithExpiry<T>(key: string): T | null {
  try {
    const item = window.localStorage.getItem(key)
    if (item === null) {
      return null
    }

    const parsed = JSON.parse(item) as {
      value: T
      expiry: number
    }

    if (Date.now() > parsed.expiry) {
      window.localStorage.removeItem(key)
      return null
    }

    return parsed.value
  } catch (error) {
    console.error(`Error reading expired item from key "${key}":`, error)
    return null
  }
}

/**
 * Set item with expiration time
 *
 * @param key - Storage key
 * @param value - Value to store
 * @param ttl - Time to live in milliseconds
 *
 * @example
 * setItemWithExpiry('session', { token: 'abc' }, 3600000) // Expires in 1 hour
 */
export function setItemWithExpiry<T>(key: string, value: T, ttl: number): void {
  try {
    const item = {
      value,
      expiry: Date.now() + ttl,
    }
    window.localStorage.setItem(key, JSON.stringify(item))
  } catch (error) {
    console.error(`Error writing expired item to key "${key}":`, error)
  }
}

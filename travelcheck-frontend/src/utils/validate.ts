/**
 * @file Validation Utility Functions
 * @description Functions for validating addresses, amounts, and content
 */

/**
 * Check if a string is a valid Ethereum address
 *
 * @param address - The address string to validate
 * @returns True if valid Ethereum address, false otherwise
 *
 * @example
 * isValidAddress('0x1234567890abcdef1234567890abcdef12345678')
 * // Returns: true
 *
 * @example
 * isValidAddress('invalid-address')
 * // Returns: false
 *
 * @example
 * isValidAddress('0x123')
 * // Returns: false
 */
export function isValidAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false
  }

  // Check if it starts with 0x and has 40 hex characters after
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/
  return ethereumAddressRegex.test(address)
}

/**
 * Check if an amount is valid within specified range
 *
 * @param amount - The amount to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns True if amount is valid, false otherwise
 *
 * @example
 * isValidAmount(50, 1, 100)
 * // Returns: true
 *
 * @example
 * isValidAmount(0, 1, 100)
 * // Returns: false
 *
 * @example
 * isValidAmount(150, 1, 100)
 * // Returns: false
 *
 * @example
 * isValidAmount(Number.NaN, 1, 100)
 * // Returns: false
 */
export function isValidAmount(amount: number, min: number, max: number): boolean {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return false
  }

  if (!Number.isFinite(amount)) {
    return false
  }

  return amount >= min && amount <= max
}

/**
 * Check if content meets minimum length requirement
 *
 * @param content - The content string to validate
 * @param minLength - Minimum required length
 * @returns True if content is valid, false otherwise
 *
 * @example
 * isValidContent('Hello World', 5)
 * // Returns: true
 *
 * @example
 * isValidContent('Hi', 5)
 * // Returns: false
 *
 * @example
 * isValidContent('', 1)
 * // Returns: false
 *
 * @example
 * isValidContent('   ', 1)
 * // Returns: false (trimmed empty string)
 */
export function isValidContent(content: string, minLength: number): boolean {
  if (!content || typeof content !== 'string') {
    return false
  }

  const trimmedContent = content.trim()
  return trimmedContent.length >= minLength
}

/**
 * Check if email address is valid
 *
 * @param email - Email address to validate
 * @returns True if valid email, false otherwise
 *
 * @example
 * isValidEmail('user@example.com')
 * // Returns: true
 *
 * @example
 * isValidEmail('invalid-email')
 * // Returns: false
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if URL is valid
 *
 * @param url - URL string to validate
 * @returns True if valid URL, false otherwise
 *
 * @example
 * isValidUrl('https://example.com')
 * // Returns: true
 *
 * @example
 * isValidUrl('invalid-url')
 * // Returns: false
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Check if a value is a valid date
 *
 * @param date - Date string or object to validate
 * @returns True if valid date, false otherwise
 *
 * @example
 * isValidDate('2024-01-15')
 * // Returns: true
 *
 * @example
 * isValidDate(new Date())
 * // Returns: true
 *
 * @example
 * isValidDate('invalid-date')
 * // Returns: false
 */
export function isValidDate(date: string | Date): boolean {
  if (!date) {
    return false
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date
  return !Number.isNaN(dateObj.getTime())
}

/**
 * Check if a number is a valid integer
 *
 * @param value - Value to check
 * @returns True if valid integer, false otherwise
 *
 * @example
 * isValidInteger(42)
 * // Returns: true
 *
 * @example
 * isValidInteger(42.5)
 * // Returns: false
 *
 * @example
 * isValidInteger('42')
 * // Returns: false
 */
export function isValidInteger(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value)
}

/**
 * Check if a string contains only alphanumeric characters
 *
 * @param str - String to validate
 * @returns True if alphanumeric, false otherwise
 *
 * @example
 * isAlphanumeric('abc123')
 * // Returns: true
 *
 * @example
 * isAlphanumeric('abc-123')
 * // Returns: false
 */
export function isAlphanumeric(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false
  }

  return /^[a-zA-Z0-9]+$/.test(str)
}

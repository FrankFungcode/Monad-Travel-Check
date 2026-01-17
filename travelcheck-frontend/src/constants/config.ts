/**
 * Application Configuration
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
export const API_TIMEOUT = 30000 // 30 seconds

// Application Settings
export const APP_NAME = 'TravelCheck'
export const APP_VERSION = '1.0.0'

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'travelcheck_token',
  USER: 'travelcheck_user',
  THEME: 'travelcheck_theme',
} as const

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// Date Format
export const DATE_FORMAT = 'YYYY-MM-DD'
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

// Environment
export const IS_DEVELOPMENT = import.meta.env.DEV
export const IS_PRODUCTION = import.meta.env.PROD

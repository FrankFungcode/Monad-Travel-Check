/**
 * @file API Service
 * @description Axios instance with interceptors for API requests
 */

import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from '@/constants/config'
import type { ApiResponse } from '@/types/api.types'
import { getItem, removeItem } from '@/utils/storage'
import axios, { type AxiosError, type AxiosResponse } from 'axios'

/**
 * Create Axios instance with default configuration
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor - adds authentication token
 */
api.interceptors.request.use(
  (config) => {
    const token = getItem<string>(STORAGE_KEYS.TOKEN)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - handles common response logic
 */
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Return the data directly from the response
    return response
  },
  (error: AxiosError<ApiResponse>) => {
    // Handle specific error cases
    if (error.response) {
      const { status } = error.response

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          removeItem(STORAGE_KEYS.TOKEN)
          removeItem(STORAGE_KEYS.USER)
          // You can dispatch a custom event here to trigger logout
          window.dispatchEvent(new Event('unauthorized'))
          break

        case 403:
          // Forbidden
          console.error('Access forbidden:', error.response.data?.message)
          break

        case 404:
          // Not found
          console.error('Resource not found:', error.response.data?.message)
          break

        case 500:
          // Server error
          console.error('Server error:', error.response.data?.message)
          break

        default:
          console.error('API error:', error.response.data?.message)
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error: No response from server')
    } else {
      // Something else happened
      console.error('Request error:', error.message)
    }

    return Promise.reject(error)
  }
)

/**
 * Helper function to extract data from API response
 *
 * @param response - Axios response
 * @returns Response data
 */
export function extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  if (response.data.code !== 200) {
    throw new Error(response.data.message || 'API request failed')
  }

  if (response.data.data === null) {
    throw new Error('No data returned from API')
  }

  return response.data.data
}

/**
 * Helper function to handle API errors
 *
 * @param error - Axios error
 * @returns Error message
 */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>

    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message
    }

    if (axiosError.message) {
      return axiosError.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unknown error occurred'
}

export default api

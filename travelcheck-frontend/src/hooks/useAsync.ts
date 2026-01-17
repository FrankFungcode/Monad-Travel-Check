/**
 * @file useAsync Hook
 * @description Custom hook for handling async operations with loading/error states
 */

import { useCallback, useEffect, useState } from 'react'

/**
 * Async operation state
 */
export interface AsyncState<T> {
  /** Operation data */
  data: T | null
  /** Loading state */
  loading: boolean
  /** Error state */
  error: Error | null
}

/**
 * Custom hook for async operations with automatic loading/error handling
 *
 * @param asyncFunction - Async function to execute
 * @param immediate - Whether to execute immediately on mount
 * @returns Async state and execute function
 *
 * @example
 * const fetchUser = async (id: string) => {
 *   const response = await api.get(`/users/${id}`)
 *   return response.data
 * }
 *
 * const { data, loading, error, execute } = useAsync(fetchUser)
 *
 * // Execute manually
 * useEffect(() => {
 *   execute('user-123')
 * }, [])
 *
 * if (loading) return <div>Loading...</div>
 * if (error) return <div>Error: {error.message}</div>
 * return <div>{data?.name}</div>
 */
export function useAsync<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  immediate = false
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  })

  const execute = useCallback(
    async (...args: Args) => {
      setState({ data: null, loading: true, error: null })

      try {
        const data = await asyncFunction(...args)
        setState({ data, loading: false, error: null })
        return data
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error')
        setState({ data: null, loading: false, error: err })
        throw err
      }
    },
    [asyncFunction]
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: execute is intentionally not in deps to avoid infinite loop
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as Args))
    }
  }, [immediate])

  return {
    ...state,
    execute,
  }
}

/**
 * Custom hook for async operations with success/error callbacks
 *
 * @param asyncFunction - Async function to execute
 * @param options - Success/error callbacks and immediate execution
 * @returns Async state and execute function
 *
 * @example
 * const { loading, execute } = useAsyncCallback(
 *   async (data) => await api.post('/users', data),
 *   {
 *     onSuccess: (result) => console.log('Success:', result),
 *     onError: (error) => console.error('Error:', error)
 *   }
 * )
 */
export function useAsyncCallback<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
    immediate?: boolean
  }
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: options?.immediate ?? false,
    error: null,
  })

  const execute = useCallback(
    async (...args: Args) => {
      setState({ data: null, loading: true, error: null })

      try {
        const data = await asyncFunction(...args)
        setState({ data, loading: false, error: null })

        if (options?.onSuccess) {
          options.onSuccess(data)
        }

        return data
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error')
        setState({ data: null, loading: false, error: err })

        if (options?.onError) {
          options.onError(err)
        }

        throw err
      }
    },
    [asyncFunction, options]
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: execute is intentionally not in deps to avoid infinite loop
  useEffect(() => {
    if (options?.immediate) {
      execute(...([] as unknown as Args))
    }
  }, [options?.immediate])

  return {
    ...state,
    execute,
  }
}

/**
 * Custom hook for async operations with retry logic
 *
 * @param asyncFunction - Async function to execute
 * @param retries - Maximum number of retries
 * @param retryDelay - Delay between retries in milliseconds
 * @returns Async state and execute function
 *
 * @example
 * const { data, loading, error, execute, retryCount } = useAsyncRetry(
 *   fetchData,
 *   3,
 *   1000
 * )
 */
export function useAsyncRetry<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  retries = 3,
  retryDelay = 1000
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  })
  const [retryCount, setRetryCount] = useState(0)

  const execute = useCallback(
    async (...args: Args) => {
      setState({ data: null, loading: true, error: null })
      setRetryCount(0)

      let lastError: Error | null = null

      for (let i = 0; i <= retries; i++) {
        try {
          const data = await asyncFunction(...args)
          setState({ data, loading: false, error: null })
          return data
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error')
          setRetryCount(i + 1)

          if (i < retries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay))
          }
        }
      }

      setState({ data: null, loading: false, error: lastError })
      throw lastError
    },
    [asyncFunction, retries, retryDelay]
  )

  return {
    ...state,
    execute,
    retryCount,
  }
}

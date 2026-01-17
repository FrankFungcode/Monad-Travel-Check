/**
 * @file Task Service
 * @description API calls for attraction task operations
 */

import type {
  GetAttractionDetailResponse,
  GetAttractionsRequest,
  GetAttractionsResponse,
  JoinAttractionRequest,
  JoinAttractionResponse,
} from '@/types/api.types'
import api, { extractData } from './api'

/**
 * Get list of attraction tasks with optional filters
 *
 * @param params - Query parameters
 * @returns Promise resolving to paginated attractions
 *
 * @example
 * const result = await getAttractions({
 *   page: 1,
 *   pageSize: 10,
 *   difficulty: 'easy',
 *   status: 'active'
 * })
 */
export async function getAttractions(
  params?: GetAttractionsRequest
): Promise<GetAttractionsResponse> {
  const queryParams = new URLSearchParams()

  if (params?.page) {
    queryParams.append('page', params.page.toString())
  }

  if (params?.pageSize) {
    queryParams.append('pageSize', params.pageSize.toString())
  }

  if (params?.difficulty) {
    queryParams.append('difficulty', params.difficulty)
  }

  if (params?.status) {
    queryParams.append('status', params.status)
  }

  const queryString = queryParams.toString()
  const url = queryString ? `/tasks/attractions?${queryString}` : '/tasks/attractions'

  const response = await api.get<never>(url)

  return extractData<GetAttractionsResponse>(response)
}

/**
 * Get attraction task details by ID
 *
 * @param taskId - Task ID
 * @returns Promise resolving to attraction details
 *
 * @example
 * const attraction = await getAttractionDetail('task-123')
 * console.log('Attraction:', attraction.name)
 */
export async function getAttractionDetail(taskId: string): Promise<GetAttractionDetailResponse> {
  const response = await api.get<never>(`/tasks/attractions/${taskId}`)

  return extractData<GetAttractionDetailResponse>(response)
}

/**
 * Join an attraction task (create stake)
 *
 * @param taskId - Task ID
 * @param request - Join parameters
 * @returns Promise resolving to created stake
 *
 * @example
 * const stake = await joinAttraction('task-123', {
 *   amount: 100,
 *   milestone: 30,
 *   mode: 'sealed'
 * })
 */
export async function joinAttraction(
  taskId: string,
  request: JoinAttractionRequest
): Promise<JoinAttractionResponse> {
  const response = await api.post<never, never, JoinAttractionRequest>(
    `/tasks/attractions/${taskId}/join`,
    request
  )

  return extractData<JoinAttractionResponse>(response)
}

/**
 * Get featured attraction tasks
 *
 * @returns Promise resolving to array of featured attractions
 *
 * @example
 * const featured = await getFeaturedAttractions()
 */
export async function getFeaturedAttractions(): Promise<GetAttractionDetailResponse[]> {
  const response = await api.get<never>('/tasks/attractions/featured')

  return extractData<GetAttractionDetailResponse[]>(response)
}

/**
 * Get active attractions (currently running)
 *
 * @returns Promise resolving to array of active attractions
 *
 * @example
 * const active = await getActiveAttractions()
 */
export async function getActiveAttractions(): Promise<GetAttractionDetailResponse[]> {
  const response = await api.get<never>('/tasks/attractions?status=active')

  return extractData<GetAttractionDetailResponse[]>(response)
}

/**
 * Get upcoming attractions
 *
 * @returns Promise resolving to array of upcoming attractions
 *
 * @example
 * const upcoming = await getUpcomingAttractions()
 */
export async function getUpcomingAttractions(): Promise<GetAttractionDetailResponse[]> {
  const response = await api.get<never>('/tasks/attractions?status=upcoming')

  return extractData<GetAttractionDetailResponse[]>(response)
}

/**
 * Search attractions by keyword
 *
 * @param keyword - Search keyword
 * @returns Promise resolving to matching attractions
 *
 * @example
 * const results = await searchAttractions('park')
 */
export async function searchAttractions(keyword: string): Promise<GetAttractionDetailResponse[]> {
  const response = await api.get<never>(
    `/tasks/attractions/search?q=${encodeURIComponent(keyword)}`
  )

  return extractData<GetAttractionDetailResponse[]>(response)
}

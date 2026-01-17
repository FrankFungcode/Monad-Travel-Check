/**
 * @file Staking Service
 * @description API calls for staking operations
 */

import type {
  CreateStakeRequest,
  CreateStakeResponse,
  GetStakesResponse,
  SwitchMilestoneRequest,
  WithdrawStakeResponse,
} from '@/types/api.types'
import type { Stake } from '@/types/models.types'
import api, { extractData } from './api'

/**
 * Create a new stake
 *
 * @param request - Stake creation parameters
 * @returns Promise resolving to created stake
 *
 * @example
 * const stake = await createStake({
 *   type: 'daily',
 *   amount: 100,
 *   milestone: 30,
 *   mode: 'sealed'
 * })
 */
export async function createStake(request: CreateStakeRequest): Promise<CreateStakeResponse> {
  const response = await api.post<never, never, CreateStakeRequest>('/stakes', request)

  return extractData<CreateStakeResponse>(response)
}

/**
 * Get all stakes for current user
 *
 * @returns Promise resolving to array of stakes
 *
 * @example
 * const stakes = await getStakes()
 * console.log('User stakes:', stakes)
 */
export async function getStakes(): Promise<GetStakesResponse> {
  const response = await api.get<never>('/stakes')

  return extractData<GetStakesResponse>(response)
}

/**
 * Get a specific stake by ID
 *
 * @param stakeId - Stake ID
 * @returns Promise resolving to stake details
 *
 * @example
 * const stake = await getStakeById('stake-123')
 */
export async function getStakeById(stakeId: string): Promise<Stake> {
  const response = await api.get<never>(`/stakes/${stakeId}`)

  return extractData<Stake>(response)
}

/**
 * Switch milestone for an anytime stake
 *
 * @param stakeId - Stake ID
 * @param milestone - New milestone
 * @returns Promise resolving to updated stake
 *
 * @example
 * const stake = await switchMilestone('stake-123', 100)
 */
export async function switchMilestone(
  stakeId: string,
  milestone: 10 | 20 | 30 | 50
): Promise<Stake> {
  const request: SwitchMilestoneRequest = {
    milestone,
  }

  const response = await api.patch<never, never, SwitchMilestoneRequest>(
    `/stakes/${stakeId}/milestone`,
    request
  )

  return extractData<Stake>(response)
}

/**
 * Withdraw stake (principal + interest)
 *
 * @param stakeId - Stake ID
 * @returns Promise resolving to withdrawal details
 *
 * @example
 * const result = await withdraw('stake-123')
 * console.log('Withdrawn amount:', result.amount)
 */
export async function withdraw(stakeId: string): Promise<WithdrawStakeResponse> {
  const response = await api.post<never>(`/stakes/${stakeId}/withdraw`)

  return extractData<WithdrawStakeResponse>(response)
}

/**
 * Get active stakes for current user
 *
 * @returns Promise resolving to array of active stakes
 *
 * @example
 * const activeStakes = await getActiveStakes()
 */
export async function getActiveStakes(): Promise<Stake[]> {
  const response = await api.get<never>('/stakes?status=active')

  return extractData<Stake[]>(response)
}

/**
 * Get completed stakes for current user
 *
 * @returns Promise resolving to array of completed stakes
 *
 * @example
 * const completedStakes = await getCompletedStakes()
 */
export async function getCompletedStakes(): Promise<Stake[]> {
  const response = await api.get<never>('/stakes?status=completed')

  return extractData<Stake[]>(response)
}

/**
 * Cancel an active stake (if allowed)
 *
 * @param stakeId - Stake ID
 * @returns Promise resolving to cancelled stake
 *
 * @example
 * await cancelStake('stake-123')
 */
export async function cancelStake(stakeId: string): Promise<Stake> {
  const response = await api.post<never>(`/stakes/${stakeId}/cancel`)

  return extractData<Stake>(response)
}

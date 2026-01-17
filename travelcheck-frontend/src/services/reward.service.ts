/**
 * @file Reward Service
 * @description API calls for reward operations (red packets, lottery, badges)
 */

import type {
  ClaimRedPacketResponse,
  GetBadgesResponse,
  GetLotteryChancesResponse,
  SpinLotteryResponse,
} from '@/types/api.types'
import type { Reward } from '@/types/models.types'
import api, { extractData } from './api'

/**
 * Claim a red packet reward
 *
 * @param rewardId - Reward ID
 * @returns Promise resolving to claimed amount and updated reward
 *
 * @example
 * const result = await claimRedPacket('reward-123')
 * console.log('Claimed amount:', result.amount)
 */
export async function claimRedPacket(rewardId: string): Promise<ClaimRedPacketResponse> {
  const response = await api.post<never>(`/rewards/redpacket/${rewardId}/claim`)

  return extractData<ClaimRedPacketResponse>(response)
}

/**
 * Get available lottery chances for user
 *
 * @returns Promise resolving to lottery chances count
 *
 * @example
 * const result = await getLotteryChances()
 * console.log('Chances:', result.chances)
 */
export async function getLotteryChances(): Promise<GetLotteryChancesResponse> {
  const response = await api.get<never>('/rewards/lottery/chances')

  return extractData<GetLotteryChancesResponse>(response)
}

/**
 * Spin the lottery wheel
 *
 * @returns Promise resolving to won prize and reward record
 *
 * @example
 * const result = await spinLottery()
 * console.log('Won prize:', result.prize.name)
 */
export async function spinLottery(): Promise<SpinLotteryResponse> {
  const response = await api.post<never>('/rewards/lottery/spin')

  return extractData<SpinLotteryResponse>(response)
}

/**
 * Get user's badges (owned and available)
 *
 * @returns Promise resolving to badge lists
 *
 * @example
 * const result = await getBadges()
 * console.log('Owned badges:', result.owned)
 * console.log('Available badges:', result.available)
 */
export async function getBadges(): Promise<GetBadgesResponse> {
  const response = await api.get<never>('/rewards/badges')

  return extractData<GetBadgesResponse>(response)
}

/**
 * Get all rewards for user
 *
 * @returns Promise resolving to array of rewards
 *
 * @example
 * const rewards = await getRewards()
 */
export async function getRewards(): Promise<Reward[]> {
  const response = await api.get<never>('/rewards')

  return extractData<Reward[]>(response)
}

/**
 * Get unclaimed rewards
 *
 * @returns Promise resolving to array of unclaimed rewards
 *
 * @example
 * const unclaimed = await getUnclaimedRewards()
 */
export async function getUnclaimedRewards(): Promise<Reward[]> {
  const response = await api.get<never>('/rewards?claimed=false')

  return extractData<Reward[]>(response)
}

/**
 * Get claimed rewards
 *
 * @returns Promise resolving to array of claimed rewards
 *
 * @example
 * const claimed = await getClaimedRewards()
 */
export async function getClaimedRewards(): Promise<Reward[]> {
  const response = await api.get<never>('/rewards?claimed=true')

  return extractData<Reward[]>(response)
}

/**
 * Get red packet rewards
 *
 * @returns Promise resolving to array of red packet rewards
 *
 * @example
 * const redPackets = await getRedPacketRewards()
 */
export async function getRedPacketRewards(): Promise<Reward[]> {
  const response = await api.get<never>('/rewards?type=redpacket')

  return extractData<Reward[]>(response)
}

/**
 * Get lottery rewards
 *
 * @returns Promise resolving to array of lottery rewards
 *
 * @example
 * const lotteryRewards = await getLotteryRewards()
 */
export async function getLotteryRewards(): Promise<Reward[]> {
  const response = await api.get<never>('/rewards?type=lottery')

  return extractData<Reward[]>(response)
}

/**
 * Get badge rewards
 *
 * @returns Promise resolving to array of badge rewards
 *
 * @example
 * const badgeRewards = await getBadgeRewards()
 */
export async function getBadgeRewards(): Promise<Reward[]> {
  const response = await api.get<never>('/rewards?type=badge')

  return extractData<Reward[]>(response)
}

/**
 * Get reward statistics
 *
 * @returns Promise resolving to reward stats
 *
 * @example
 * const stats = await getRewardStats()
 * // Returns: { totalEarned, totalClaimed, pending }
 */
export async function getRewardStats(): Promise<{
  totalEarned: number
  totalClaimed: number
  pending: number
}> {
  const response = await api.get<never>('/rewards/stats')

  return extractData<{
    totalEarned: number
    totalClaimed: number
    pending: number
  }>(response)
}

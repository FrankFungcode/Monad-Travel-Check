/**
 * @file Staking State Management
 * @description Jotai atoms for managing staking records
 */

import type { Stake } from '@/types/models.types'
import { atom } from 'jotai'

/**
 * Base stakes atom - stores all user stakes
 */
export const stakesAtom = atom<Stake[]>([])

/**
 * Derived atom for active stakes only
 *
 * @example
 * const activeStakes = useAtomValue(activeStakesAtom)
 * // Returns: Stake[] with status === 'active'
 */
export const activeStakesAtom = atom((get) => {
  const stakes = get(stakesAtom)
  return stakes.filter((stake) => stake.status === 'active')
})

/**
 * Derived atom for completed stakes
 *
 * @example
 * const completedStakes = useAtomValue(completedStakesAtom)
 * // Returns: Stake[] with status === 'completed'
 */
export const completedStakesAtom = atom((get) => {
  const stakes = get(stakesAtom)
  return stakes.filter((stake) => stake.status === 'completed')
})

/**
 * Derived atom for withdrawn stakes
 *
 * @example
 * const withdrawnStakes = useAtomValue(withdrawnStakesAtom)
 * // Returns: Stake[] with status === 'withdrawn'
 */
export const withdrawnStakesAtom = atom((get) => {
  const stakes = get(stakesAtom)
  return stakes.filter((stake) => stake.status === 'withdrawn')
})

/**
 * Derived atom for daily task stakes
 *
 * @example
 * const dailyStakes = useAtomValue(dailyStakesAtom)
 * // Returns: Stake[] with type === 'daily'
 */
export const dailyStakesAtom = atom((get) => {
  const stakes = get(stakesAtom)
  return stakes.filter((stake) => stake.type === 'daily')
})

/**
 * Derived atom for attraction task stakes
 *
 * @example
 * const attractionStakes = useAtomValue(attractionStakesAtom)
 * // Returns: Stake[] with type === 'attraction'
 */
export const attractionStakesAtom = atom((get) => {
  const stakes = get(stakesAtom)
  return stakes.filter((stake) => stake.type === 'attraction')
})

/**
 * Action atom to set all stakes
 *
 * @example
 * const setStakes = useSetAtom(setStakesAtom)
 * setStakes(stakesData)
 */
export const setStakesAtom = atom(null, (_get, set, stakes: Stake[]) => {
  set(stakesAtom, stakes)
})

/**
 * Action atom to add a new stake
 *
 * @example
 * const addStake = useSetAtom(addStakeAtom)
 * addStake(newStake)
 */
export const addStakeAtom = atom(null, (get, set, stake: Stake) => {
  const stakes = get(stakesAtom)
  set(stakesAtom, [...stakes, stake])
})

/**
 * Action atom to update a stake
 *
 * @example
 * const updateStake = useSetAtom(updateStakeAtom)
 * updateStake('stake-id', { checkedDays: 5 })
 */
export const updateStakeAtom = atom(null, (get, set, stakeId: string, updates: Partial<Stake>) => {
  const stakes = get(stakesAtom)
  const updatedStakes = stakes.map((stake) =>
    stake.id === stakeId ? { ...stake, ...updates } : stake
  )
  set(stakesAtom, updatedStakes)
})

/**
 * Action atom to remove a stake
 *
 * @example
 * const removeStake = useSetAtom(removeStakeAtom)
 * removeStake('stake-id')
 */
export const removeStakeAtom = atom(null, (get, set, stakeId: string) => {
  const stakes = get(stakesAtom)
  const filteredStakes = stakes.filter((stake) => stake.id !== stakeId)
  set(stakesAtom, filteredStakes)
})

/**
 * Derived atom to get a stake by ID
 *
 * @example
 * const getStakeById = useAtomValue(stakeByIdAtom('stake-123'))
 * // Returns: Stake or undefined
 */
export const stakeByIdAtom = (stakeId: string) =>
  atom((get) => {
    const stakes = get(stakesAtom)
    return stakes.find((stake) => stake.id === stakeId)
  })

/**
 * Derived atom for total staked amount
 *
 * @example
 * const totalStaked = useAtomValue(totalStakedAmountAtom)
 * // Returns: number (sum of all active stake amounts)
 */
export const totalStakedAmountAtom = atom((get) => {
  const activeStakes = get(activeStakesAtom)
  return activeStakes.reduce((total, stake) => total + stake.amount, 0)
})

/**
 * Derived atom for total accumulated interest
 *
 * @example
 * const totalInterest = useAtomValue(totalAccumulatedInterestAtom)
 * // Returns: number (sum of all accumulated interest)
 */
export const totalAccumulatedInterestAtom = atom((get) => {
  const activeStakes = get(activeStakesAtom)
  return activeStakes.reduce((total, stake) => total + stake.accumulatedInterest, 0)
})

/**
 * Derived atom for stakes count by status
 *
 * @example
 * const stakesCount = useAtomValue(stakesCountByStatusAtom)
 * // Returns: { active: 2, completed: 5, withdrawn: 3 }
 */
export const stakesCountByStatusAtom = atom((get) => {
  const stakes = get(stakesAtom)
  return stakes.reduce(
    (counts, stake) => {
      counts[stake.status] = (counts[stake.status] || 0) + 1
      return counts
    },
    {} as Record<string, number>
  )
})

/**
 * Action atom to clear all stakes
 *
 * @example
 * const clearStakes = useSetAtom(clearStakesAtom)
 * clearStakes()
 */
export const clearStakesAtom = atom(null, (_get, set) => {
  set(stakesAtom, [])
})

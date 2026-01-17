/**
 * @file User State Management
 * @description Jotai atoms for managing user authentication and profile
 */

import { STORAGE_KEYS } from '@/constants/config'
import type { User } from '@/types/models.types'
import { getItem, removeItem, setItem } from '@/utils/storage'
import { atom } from 'jotai'

/**
 * Base user atom with persistence
 */
export const userAtom = atom<User | null>(getItem<User>(STORAGE_KEYS.USER))

/**
 * Derived atom to check if user is authenticated
 *
 * @example
 * const isAuthenticated = useAtomValue(isAuthenticatedAtom)
 * // Returns: true or false
 */
export const isAuthenticatedAtom = atom((get) => {
  const user = get(userAtom)
  return user !== null
})

/**
 * Action atom to set user and persist to storage
 *
 * @example
 * const setUser = useSetAtom(setUserAtom)
 * setUser(userData)
 */
export const setUserAtom = atom(null, (_get, set, user: User | null) => {
  set(userAtom, user)
  if (user) {
    setItem(STORAGE_KEYS.USER, user)
  } else {
    removeItem(STORAGE_KEYS.USER)
  }
})

/**
 * Action atom to clear user data (logout)
 *
 * @example
 * const clearUser = useSetAtom(clearUserAtom)
 * clearUser()
 */
export const clearUserAtom = atom(null, (_get, set) => {
  set(userAtom, null)
  removeItem(STORAGE_KEYS.USER)
  removeItem(STORAGE_KEYS.TOKEN)
})

/**
 * Action atom to update user profile fields
 *
 * @example
 * const updateUser = useSetAtom(updateUserAtom)
 * updateUser({ nickname: 'NewName', avatar: 'url' })
 */
export const updateUserAtom = atom(null, (get, set, updates: Partial<User>) => {
  const currentUser = get(userAtom)
  if (!currentUser) {
    return
  }

  const updatedUser = {
    ...currentUser,
    ...updates,
  }

  set(userAtom, updatedUser)
  setItem(STORAGE_KEYS.USER, updatedUser)
})

/**
 * Derived atom for user stats
 *
 * @example
 * const userStats = useAtomValue(userStatsAtom)
 * // Returns: { totalCheckins, currentStreak, maxStreak, badges }
 */
export const userStatsAtom = atom((get) => {
  const user = get(userAtom)
  if (!user) {
    return {
      totalCheckins: 0,
      currentStreak: 0,
      maxStreak: 0,
      badges: [],
      lotteryChances: 0,
    }
  }

  return {
    totalCheckins: user.totalCheckins,
    currentStreak: user.currentStreak,
    maxStreak: user.maxStreak,
    badges: user.badges,
    lotteryChances: user.lotteryChances,
  }
})

/**
 * Derived atom for user display info
 *
 * @example
 * const displayInfo = useAtomValue(userDisplayInfoAtom)
 * // Returns: { nickname, avatar, walletAddress }
 */
export const userDisplayInfoAtom = atom((get) => {
  const user = get(userAtom)
  if (!user) {
    return {
      nickname: null,
      avatar: null,
      walletAddress: null,
    }
  }

  return {
    nickname: user.nickname,
    avatar: user.avatar,
    walletAddress: user.walletAddress,
  }
})

/**
 * Action atom to increment checkin count
 *
 * @example
 * const incrementCheckins = useSetAtom(incrementCheckinsAtom)
 * incrementCheckins()
 */
export const incrementCheckinsAtom = atom(null, (get, set) => {
  const user = get(userAtom)
  if (!user) {
    return
  }

  const updatedUser = {
    ...user,
    totalCheckins: user.totalCheckins + 1,
    currentStreak: user.currentStreak + 1,
    maxStreak: Math.max(user.maxStreak, user.currentStreak + 1),
  }

  set(userAtom, updatedUser)
  setItem(STORAGE_KEYS.USER, updatedUser)
})

/**
 * Action atom to add a badge
 *
 * @example
 * const addBadge = useSetAtom(addBadgeAtom)
 * addBadge('badge-id-123')
 */
export const addBadgeAtom = atom(null, (get, set, badgeId: string) => {
  const user = get(userAtom)
  if (!user) {
    return
  }

  if (user.badges.includes(badgeId)) {
    return
  }

  const updatedUser = {
    ...user,
    badges: [...user.badges, badgeId],
  }

  set(userAtom, updatedUser)
  setItem(STORAGE_KEYS.USER, updatedUser)
})

/**
 * Action atom to update lottery chances
 *
 * @example
 * const updateLotteryChances = useSetAtom(updateLotteryChancesAtom)
 * updateLotteryChances(5)
 */
export const updateLotteryChancesAtom = atom(null, (get, set, chances: number) => {
  const user = get(userAtom)
  if (!user) {
    return
  }

  const updatedUser = {
    ...user,
    lotteryChances: chances,
  }

  set(userAtom, updatedUser)
  setItem(STORAGE_KEYS.USER, updatedUser)
})

/**
 * @file useBadges Hook
 * @description Custom hook for badge contract interactions
 */

import { useState, useCallback } from 'react'
import { getBadgeContract } from './useContracts'

export interface BadgeInfo {
    id: string
    name: string // Human readable name
    type: string // Contract badge type
    icon: string
    earned: boolean
}

// Badge definitions matching contract
export const BADGE_DEFINITIONS: Omit<BadgeInfo, 'earned'>[] = [
    { id: '1', name: 'First Check-in', type: 'FIRST_CHECKIN', icon: '🎯' },
    { id: '2', name: '7-Day Streak', type: 'STREAK_7', icon: '🔥' },
    { id: '3', name: '30-Day Streak', type: 'STREAK_30', icon: '⭐' },
    { id: '4', name: '100-Day Streak', type: 'STREAK_100', icon: '🚀' },
    { id: '5', name: 'Perfect Month', type: 'PERFECT_MONTH', icon: '💯' },
    { id: '6', name: 'World Explorer', type: 'WORLD_EXPLORER', icon: '🌍' },
]

export function useBadges() {
    const [loading, setLoading] = useState(false)

    /**
     * Get user's badges status
     */
    const getUserBadges = useCallback(async (userAddress: string): Promise<BadgeInfo[]> => {
        setLoading(true)
        try {
            const contract = getBadgeContract()
            if (!contract) {
                // Fallback if contract not available (e.g. wrong network)
                return BADGE_DEFINITIONS.map(def => ({ ...def, earned: false }))
            }

            // Check all badge types in parallel
            const badgePromises = BADGE_DEFINITIONS.map(async (def) => {
                try {
                    // Check if user has this badge type
                    const hasIt = await contract.hasBadge(userAddress, def.type)
                    return { ...def, earned: hasIt }
                } catch (e) {
                    console.error(`Failed to check badge ${def.type}`, e)
                    return { ...def, earned: false }
                }
            })

            const results = await Promise.all(badgePromises)
            return results
        } catch (error) {
            console.error('Failed to get user badges:', error)
            return []
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        loading,
        getUserBadges,
        badgeDefinitions: BADGE_DEFINITIONS
    }
}

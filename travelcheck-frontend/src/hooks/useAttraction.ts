/**
 * @file useAttraction.ts
 * @description Hook for interacting with TravelCheckAttraction contract
 * @description Analyzed from contract source code:
 * - createTask(name, description, latitude, longitude, radius, rewardPerUser, totalSlots, startTime, endTime)
 * - acceptTask(taskId)
 * - completeTask(taskId, contentHash, latitude, longitude)
 * - getTask(taskId)
 * - getTaskCount()
 */

import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from '@/constants/contracts'
import type { AttractionTask } from '@/types/models.types'
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers'
import { useCallback, useMemo } from 'react'

// Extend window interface for Ethereum
declare global {
    interface Window {
        ethereum?: any
    }
}

export interface CreateTaskParams {
    name: string
    description: string
    latitude: number
    longitude: number
    radius: number
    rewardPerUser: string
    totalSlots: number
    startTime: number
    endTime: number
}

// Contract Task Struct matching
interface ContractTask {
    id: bigint
    name: string
    description: string
    latitude: bigint
    longitude: bigint
    radius: bigint
    rewardPerUser: bigint
    totalSlots: bigint
    claimedSlots: bigint
    startTime: bigint
    endTime: bigint
    status: bigint // Enum: 0=ACTIVE, 1=PAUSED, 2=COMPLETED, 3=CANCELLED
    remainingReward: bigint
}

export function useAttraction() {
    const provider = useMemo(() => {
        if (window.ethereum) {
            return new BrowserProvider(window.ethereum)
        }
        return null
    }, [])

    const getContract = useCallback(async () => {
        if (!provider) return null
        const signer = await provider.getSigner()
        return new Contract(
            CONTRACT_ADDRESSES.TravelCheckAttraction,
            CONTRACT_ABIS.TravelCheckAttraction,
            signer
        )
    }, [provider])

    const getReadOnlyContract = useCallback(async () => {
        if (!provider) return null
        return new Contract(
            CONTRACT_ADDRESSES.TravelCheckAttraction,
            CONTRACT_ABIS.TravelCheckAttraction,
            provider
        )
    }, [provider])

    /**
     * Create a new attraction task
     */
    const createTask = useCallback(
        async (params: CreateTaskParams) => {
            try {
                const contract = await getContract()
                if (!contract) throw new Error('Wallet not connected')

                // Convert params to contract format
                const lat = Math.round(params.latitude * 1000000)
                const lng = Math.round(params.longitude * 1000000)
                const reward = parseEther(params.rewardPerUser)
                const totalReward = reward * BigInt(params.totalSlots)

                console.log('Creating task with params:', {
                    ...params,
                    lat,
                    lng,
                    reward: reward.toString(),
                    totalReward: totalReward.toString(),
                })

                const tx = await contract.createTask(
                    params.name,
                    params.description,
                    lat,
                    lng,
                    params.radius,
                    reward,
                    params.totalSlots,
                    params.startTime,
                    params.endTime,
                    { value: totalReward }
                )

                console.log('Create task tx sent:', tx.hash)
                const receipt = await tx.wait()
                console.log('Create task confirmed:', receipt)
                return true
            } catch (error) {
                console.error('Failed to create task:', error)
                throw error
            }
        },
        [getContract]
    )

    /**
     * Get total task count
     */
    const getTaskCount = useCallback(async (): Promise<number> => {
        try {
            const contract = await getReadOnlyContract()
            if (!contract) return 0
            const count = await contract.getTaskCount()
            return Number(count)
        } catch (error) {
            console.error('Failed to get task count:', error)
            return 0
        }
    }, [getReadOnlyContract])

    /**
     * Get specific task details
     */
    const getTask = useCallback(
        async (taskId: string | number): Promise<AttractionTask | null> => {
            try {
                const contract = await getReadOnlyContract()
                if (!contract) return null

                const task: ContractTask = await contract.getTask(taskId)

                // Map status enum to string
                const statusMap = ['active', 'paused', 'completed', 'cancelled']
                const status = statusMap[Number(task.status)] || 'unknown'

                // Determine difficulty/duration from data or placeholders 
                // (Contract doesn't store these explicitly, deriving or using defaults)
                const durationDays = Math.ceil(
                    (Number(task.endTime) - Number(task.startTime)) / (24 * 3600)
                )

                return {
                    id: task.id.toString(),
                    name: task.name,
                    description: task.description,
                    location: {
                        name: `${Number(task.latitude) / 1000000}, ${Number(task.longitude) / 1000000}`,
                        address: 'On-chain Location', // Need external geocoding for real address
                        lat: Number(task.latitude) / 1000000,
                        lng: Number(task.longitude) / 1000000,
                        radius: Number(task.radius),
                    },
                    coverImage: `https://picsum.photos/400/300?random=${task.id}`, // Placeholder
                    overviewImage: `https://picsum.photos/800/600?random=${task.id}`,
                    duration: durationDays,
                    difficulty: 'medium', // Placeholder
                    rewardApy: 0, // Not applicable for fixed reward
                    minStake: 0, // No stake required usually
                    startDate: new Date(Number(task.startTime) * 1000),
                    endDate: new Date(Number(task.endTime) * 1000),
                    status: status as 'active' | 'upcoming' | 'expiring' | 'completed',
                    createdAt: new Date(), // Created time not stored in struct, using now or start time
                    rewardAmount: formatEther(task.rewardPerUser),
                    remainingReward: formatEther(task.remainingReward),
                    totalSlots: Number(task.totalSlots),
                    claimedSlots: Number(task.claimedSlots)
                } as AttractionTask
            } catch (error) {
                console.error(`Failed to get task ${taskId}:`, error)
                return null
            }
        },
        [getReadOnlyContract]
    )

    /**
     * Get all tasks
     * Note: This iterates from 0 to count. For large counts, this should be paginated or indexed off-chain.
     */
    const getAllTasks = useCallback(async (): Promise<AttractionTask[]> => {
        try {
            const count = await getTaskCount()
            const tasks: AttractionTask[] = []

            // Fetch in reverse order to show newest first
            // Limit to last 20 for performance
            const start = Math.max(0, count - 20)

            for (let i = count - 1; i >= start; i--) {
                const task = await getTask(i)
                if (task) tasks.push(task)
            }

            return tasks
        } catch (error) {
            console.error('Failed to get all tasks:', error)
            return []
        }
    }, [getTaskCount, getTask])

    /**
     * Join (Accept) a task
     */
    const joinTask = useCallback(async (taskId: string) => {
        try {
            const contract = await getContract()
            if (!contract) throw new Error('Wallet not connected')

            const tx = await contract.acceptTask(taskId)
            console.log('Join task tx:', tx.hash)
            await tx.wait()
            return true
        } catch (error) {
            console.error('Failed to join task:', error)
            throw error
        }
    }, [getContract])

    /**
     * Get contract owner
     */
    const getOwner = useCallback(async (): Promise<string> => {
        try {
            const contract = await getReadOnlyContract()
            if (!contract) return ''
            return await contract.owner()
        } catch (error) {
            console.error('Failed to get owner:', error)
            return ''
        }
    }, [getReadOnlyContract])

    /**
     * Get user's task info (accepted, completed)
     */
    const getUserTaskInfo = useCallback(async (taskId: string, userAddress: string) => {
        try {
            const contract = await getReadOnlyContract()
            if (!contract) return null
            const info = await contract.getUserTaskInfo(taskId, userAddress)
            return {
                accepted: info.accepted,
                completed: info.completed,
                acceptedAt: Number(info.acceptedAt),
                completedAt: Number(info.completedAt),
                contentHash: info.contentHash
            }
        } catch (error) {
            console.error(`Failed to get user task info for ${taskId}:`, error)
            return null
        }
    }, [getReadOnlyContract])

    return {
        createTask,
        getTaskCount,
        getTask,
        getAllTasks,
        joinTask,
        getOwner,
        getUserTaskInfo,
        getContract // Exposed for advanced usage like manual signing/gas estimation
    }
}

/**
 * @file useStaking Hook
 * @description Custom hook for staking contract operations
 */

import { useState, useCallback } from 'react'
import { parseEther, formatEther, Wallet, solidityPackedKeccak256, getBytes } from 'ethers'
import { useSetAtom } from 'jotai'
import { showSuccessToastAtom, showErrorToastAtom } from '@/store/ui.atom'
import {
  getStakingContractWithSigner,
  getStakingContract,
} from './useContracts'
import {
  saveStake,
  saveCheckin,
  getCheckinsByStake,
  calculateContentHash,
  generateCheckinId,
  type LocalStake,
  type LocalCheckin,
} from '@/services/db.service'

// Stake type enum (matches contract)
export enum StakeType {
  DAILY = 0,
  ATTRACTION = 1,
}

// Stake mode enum (matches contract)
export enum StakeMode {
  SEALED = 0,
  ANYTIME = 1,
}

// Stake status enum (matches contract)
export enum StakeStatus {
  ACTIVE = 0,
  COMPLETED = 1,
  WITHDRAWN = 2,
}

// Stake data from chain
export interface ChainStake {
  user: string
  stakeType: number
  amount: bigint
  milestone: bigint
  mode: number
  checkedDays: bigint
  isPerfect: boolean
  accumulatedInterest: bigint
  status: number
  startTime: bigint
  endTime: bigint
  completedAt: bigint
  withdrawnAt: bigint
}

// Check-in record from chain
export interface ChainCheckinRecord {
  timestamp: bigint
  contentHash: string
  latitude: bigint
  longitude: bigint
}

/**
 * Convert chain stake to local stake format
 */
function chainStakeToLocal(stakeId: string, stake: ChainStake): LocalStake {
  return {
    id: stakeId,
    amount: stake.amount.toString(),
    milestone: Number(stake.milestone),
    mode: stake.mode,
    checkedDays: Number(stake.checkedDays),
    isPerfect: stake.isPerfect,
    accumulatedInterest: stake.accumulatedInterest.toString(),
    status: stake.status,
    startTime: Number(stake.startTime),
    endTime: Number(stake.endTime),
    completedAt: Number(stake.completedAt),
    withdrawnAt: Number(stake.withdrawnAt),
    lastUpdated: Date.now(),
  }
}

/**
 * Custom hook for staking operations
 */
export function useStaking() {
  const [loading, setLoading] = useState(false)
  const showSuccess = useSetAtom(showSuccessToastAtom)
  const showError = useSetAtom(showErrorToastAtom)

  /**
   * Create a new stake
   */
  const createStake = useCallback(
    async (
      stakeType: StakeType,
      milestone: number,
      mode: StakeMode,
      amountEth: string
    ): Promise<string | null> => {
      setLoading(true)
      try {
        const contract = await getStakingContractWithSigner()
        if (!contract) {
          throw new Error('Please connect your wallet first')
        }

        const amount = parseEther(amountEth)
        const tx = await contract.createStake(stakeType, milestone, mode, {
          value: amount,
        })

        showSuccess('Transaction submitted, waiting for confirmation...')

        const receipt = await tx.wait()
        console.log('Transaction Receipt:', receipt) // Debug log

        // Method 1: Try to find the StakeCreated event from logs
        let stakeId = '0'

        try {
          // Debug logs for events
          console.log('Receipt logs:', receipt.logs)

          const event = receipt.logs.find(
            (log: { fragment?: { name: string } }) => log.fragment?.name === 'StakeCreated'
          )

          if (event && event.args && event.args[0]) {
            stakeId = event.args[0].toString()
            console.log('Found StakeId from event fragment:', stakeId)
          } else {
            console.log('Event fragment not found, trying manual parsing...')
            // Fallback for when fragment is missing (common in some envs)
            // Manually parse if contract interface is available
            for (const log of receipt.logs) {
              try {
                const parsed = contract.interface.parseLog(log)
                console.log('Parsed log:', parsed) // Debug log
                if (parsed && parsed.name === 'StakeCreated') {
                  stakeId = parsed.args[0].toString()
                  console.log('Found StakeId from parsed log:', stakeId)
                  break
                }
              } catch (e) {
                // Ignore parsing errors for non-matching logs
              }
            }
          }
        } catch (e) {
          console.warn('Error parsing logs:', e)
        }

        // Method 3: Direct Topic Parsing (Robust Fallback)
        // Explicitly check for StakeCreated event signature hash observed in logs
        // Signature: StakeCreated(uint256,address,uint8,uint256,uint256,uint8)
        if (!stakeId || stakeId === '0') {
          const STAKE_CREATED_TOPIC = '0x5c37d87e2c15979bf7deed864258000565917a14d1f7f534bf4b646317f66786'

          for (const log of receipt.logs) {
            if (log.topics && log.topics[0] === STAKE_CREATED_TOPIC && log.topics.length >= 2) {
              try {
                stakeId = BigInt(log.topics[1]).toString()
                console.log('Found StakeId from raw topic:', stakeId)
                break
              } catch (e) {
                console.warn('Error parsing topic:', e)
              }
            }
          }
        }

        // Method 4: Fallback to fetching user's last stake
        if (!stakeId || (stakeId === '0' && receipt.logs.length > 0)) {
          console.log('Trying fallback method to get StakeId...')
          // We try to get the signer address to fetch stakes
          const runner = contract.runner as { getAddress?: () => Promise<string> } | null
          const signerAddress = await runner?.getAddress?.()
          console.log('Signer address for fallback:', signerAddress)

          if (signerAddress) {
            const userStakes = await contract.getUserStakes(signerAddress)
            console.log('User stakes fetched:', userStakes)
            if (userStakes && userStakes.length > 0) {
              // The new stake should be the last one
              stakeId = userStakes[userStakes.length - 1].toString()
              console.log('Found StakeId from fallback:', stakeId)
            }
          }
        }

        console.log('Final StakeId to return:', stakeId)

        // Fetch and cache the stake data (non-blocking)
        try {
          await refreshStake(stakeId)
        } catch (refreshError) {
          console.warn('Failed to refresh stake data, but continuing:', refreshError)
          // Don't block the return even if refresh fails
        }

        showSuccess(`Stake created successfully! ID: ${stakeId}`)
        return stakeId
      } catch (error) {
        console.error('Error in createStake:', error)
        const message = error instanceof Error ? error.message : 'Failed to create stake'
        showError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [showSuccess, showError]
  )

  /**
   * Check in for a stake
   */
  const checkIn = useCallback(
    async (
      stakeId: string,
      content: string,
      images: string[],
      location: { lat: number; lng: number } | null
    ): Promise<boolean> => {
      setLoading(true)
      try {
        const contract = await getStakingContractWithSigner()
        if (!contract) {
          throw new Error('Please connect your wallet first')
        }

        // Calculate content hash
        const contentHash = await calculateContentHash(
          JSON.stringify({ content, images, timestamp: Date.now() })
        )

        // Convert location to contract format (×10^6)
        const latitude = location ? BigInt(Math.round(location.lat * 1e6)) : BigInt(0)
        const longitude = location ? BigInt(Math.round(location.lng * 1e6)) : BigInt(0)

        console.log('Check-in params:', { stakeId, contentHash, latitude: latitude.toString(), longitude: longitude.toString() })

        const tx = await contract.checkIn(stakeId, contentHash, latitude, longitude)

        console.log('Check-in transaction sent:', tx.hash)
        showSuccess('Check-in submitted, waiting for confirmation...')

        const receipt = await tx.wait()
        console.log('Check-in confirmed:', receipt)

        // Get current check-in count to determine index
        const readContract = getStakingContract()
        const checkinCount = await readContract?.getCheckinCount(stakeId)
        const checkinIndex = Number(checkinCount) - 1

        // Save check-in to IndexedDB (non-blocking)
        try {
          const localCheckin: LocalCheckin = {
            id: generateCheckinId(stakeId, checkinIndex),
            stakeId,
            checkinIndex,
            contentHash,
            content,
            images,
            location,
            timestamp: Date.now(),
            txHash: receipt.hash,
          }
          await saveCheckin(localCheckin)
        } catch (dbError) {
          console.warn('Failed to save check-in to local DB:', dbError)
        }

        // Refresh stake data (non-blocking)
        try {
          await refreshStake(stakeId)
        } catch (refreshError) {
          console.warn('Failed to refresh stake data:', refreshError)
        }

        showSuccess('打卡成功！')
        console.log('Check-in completed successfully, returning true')
        return true
      } catch (error) {
        console.error('Check-in error:', error)
        const message = error instanceof Error ? error.message : 'Failed to check in'
        showError(message)
        return false
      } finally {
        setLoading(false)
      }
    },
    [showSuccess, showError]
  )

  /**
   * Generate red packet signature
   * @param stakeId Stake ID
   * @param checkinIndex Check-in index
   * @param amount Red packet amount in wei
   * @param expiry Expiry timestamp
   * @param userAddress User's wallet address
   * @returns Signature string
   */
  const generateRedPacketSignature = useCallback(
    async (
      stakeId: string,
      checkinIndex: number,
      amount: bigint,
      expiry: number,
      userAddress: string
    ): Promise<string> => {
      const signerPrivateKey = process.env.VITE_SIGNER_PRIVATE_KEY
      if (!signerPrivateKey) {
        throw new Error('Signer private key not configured')
      }

      // Create signer wallet
      const signerWallet = new Wallet(signerPrivateKey)

      // Construct message hash (must match contract's keccak256 format)
      const messageHash = solidityPackedKeccak256(
        ['uint256', 'uint256', 'uint256', 'uint256', 'address'],
        [stakeId, checkinIndex, amount, expiry, userAddress]
      )

      // Sign the message (ethers v6 automatically adds the Ethereum signed message prefix)
      const signature = await signerWallet.signMessage(getBytes(messageHash))

      return signature
    },
    []
  )

  /**
   * Claim red packet for a check-in
   */
  const claimRedPacket = useCallback(
    async (stakeId: string, checkinIndex: number): Promise<string | null> => {
      setLoading(true)
      try {
        const contract = await getStakingContractWithSigner()
        if (!contract) {
          throw new Error('Please connect your wallet first')
        }

        // Get user address
        const runner = contract.runner as { getAddress?: () => Promise<string> } | null
        const userAddress = await runner?.getAddress?.()
        if (!userAddress) {
          throw new Error('Failed to get user address')
        }

        // Get max red packet amount for this stake
        const readContract = getStakingContract()
        const maxAmount = await readContract?.getMaxRedPacketAmount(stakeId)
        if (!maxAmount || maxAmount === BigInt(0)) {
          throw new Error('No red packet available for this stake')
        }

        // Generate random amount between MIN_RED_PACKET_RATE and maxAmount
        // For simplicity, use a random percentage of maxAmount (50% - 100%)
        const randomPercent = 50 + Math.floor(Math.random() * 51) // 50-100
        const amount = (maxAmount * BigInt(randomPercent)) / BigInt(100)

        // Set expiry to 24 hours from now
        const expiry = Math.floor(Date.now() / 1000) + 24 * 3600

        // Generate signature
        const signature = await generateRedPacketSignature(
          stakeId,
          checkinIndex,
          amount,
          expiry,
          userAddress
        )

        console.log('Red packet claim params:', {
          stakeId,
          checkinIndex,
          amount: amount.toString(),
          expiry,
          signature,
        })

        // Call contract with all required parameters
        const tx = await contract.claimRedPacket(
          stakeId,
          checkinIndex,
          amount,
          expiry,
          signature
        )

        showSuccess('Claiming red packet...')

        const receipt = await tx.wait()
        console.log('Claim receipt:', receipt)

        // Find the RedPacketClaimed event to get the amount
        let amountEth = formatEther(amount)

        try {
          // Method 1: Try fragment
          const event = receipt.logs.find(
            (log: { fragment?: { name: string } }) => log.fragment?.name === 'RedPacketClaimed'
          )

          if (event?.args?.[3]) {
            amountEth = formatEther(event.args[3])
            console.log('Amount from fragment:', amountEth)
          } else {
            // Method 2: Manual parsing
            console.log('Fragment not found, trying manual parsing...')
            for (const log of receipt.logs) {
              try {
                const parsed = contract.interface.parseLog(log)
                console.log('Parsed log:', parsed)
                if (parsed && parsed.name === 'RedPacketClaimed') {
                  amountEth = formatEther(parsed.args[3])
                  console.log('Amount from parsed log:', amountEth)
                  break
                }
              } catch (e) {
                // Ignore
              }
            }
          }
        } catch (e) {
          console.warn('Error parsing red packet amount:', e)
        }

        console.log('Final claimed amount:', amountEth)
        showSuccess(`红包领取成功！金额: ${amountEth} ETH`)
        return amountEth
      } catch (error) {
        console.error('Claim red packet error:', error)
        const message = error instanceof Error ? error.message : 'Failed to claim red packet'
        showError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [showSuccess, showError, generateRedPacketSignature]
  )

  /**
   * Withdraw stake and interest
   */
  const withdraw = useCallback(
    async (stakeId: string): Promise<string | null> => {
      setLoading(true)
      try {
        const contract = await getStakingContractWithSigner()
        if (!contract) {
          throw new Error('Please connect your wallet first')
        }

        const tx = await contract.withdraw(stakeId)

        showSuccess('Withdrawing, please wait...')

        const receipt = await tx.wait()

        // Find the StakeWithdrawn event to get the total amount
        const event = receipt.logs.find(
          (log: { fragment?: { name: string } }) => log.fragment?.name === 'StakeWithdrawn'
        )
        const totalAmount = event?.args?.[1]
        const amountEth = totalAmount ? formatEther(totalAmount) : '0'

        // Refresh stake data
        await refreshStake(stakeId)

        showSuccess(`Withdrawal successful! Total: ${amountEth} ETH`)
        return amountEth
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to withdraw'
        showError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [showSuccess, showError]
  )

  /**
   * Get stake data from chain
   */
  const getStake = useCallback(async (stakeId: string): Promise<LocalStake | null> => {
    try {
      const contract = getStakingContract()
      if (!contract) return null

      const stake = await contract.getStake(stakeId)
      return chainStakeToLocal(stakeId, stake)
    } catch (error) {
      console.error('Failed to get stake:', error)
      return null
    }
  }, [])

  /**
   * Refresh and cache stake data
   */
  const refreshStake = useCallback(async (stakeId: string): Promise<LocalStake | null> => {
    const stake = await getStake(stakeId)
    if (stake) {
      await saveStake(stake)
    }
    return stake
  }, [getStake])

  /**
   * Get user's stake IDs
   */
  const getUserStakes = useCallback(async (userAddress: string): Promise<string[]> => {
    try {
      const contract = getStakingContract()
      if (!contract) return []

      const stakeIds = await contract.getUserStakes(userAddress)
      return stakeIds.map((id: bigint) => id.toString())
    } catch (error) {
      console.error('Failed to get user stakes:', error)
      return []
    }
  }, [])

  /**
   * Get check-in records from chain
   */
  const getCheckinRecords = useCallback(
    async (stakeId: string): Promise<ChainCheckinRecord[]> => {
      try {
        const contract = getStakingContract()
        if (!contract) return []

        const records = await contract.getCheckinRecords(stakeId)
        return records
      } catch (error) {
        console.error('Failed to get checkin records:', error)
        return []
      }
    },
    []
  )

  /**
   * Get local check-in content (from IndexedDB)
   */
  const getLocalCheckins = useCallback(async (stakeId: string): Promise<LocalCheckin[]> => {
    return getCheckinsByStake(stakeId)
  }, [])

  /**
   * Check if red packet is claimed for a check-in
   */
  const isRedPacketClaimed = useCallback(
    async (stakeId: string, checkinIndex: number): Promise<boolean> => {
      try {
        const contract = getStakingContract()
        if (!contract) return false

        return await contract.isRedPacketClaimed(stakeId, checkinIndex)
      } catch (error) {
        console.error('Failed to check red packet status:', error)
        return false
      }
    },
    []
  )

  /**
   * Get max red packet amount for current progress
   */
  const getMaxRedPacketAmount = useCallback(async (stakeId: string): Promise<string> => {
    try {
      const contract = getStakingContract()
      if (!contract) return '0'

      const amount = await contract.getMaxRedPacketAmount(stakeId)
      return formatEther(amount)
    } catch (error) {
      console.error('Failed to get max red packet amount:', error)
      return '0'
    }
  }, [])

  /**
   * Calculate current interest
   */
  const calculateInterest = useCallback(async (stakeId: string): Promise<string> => {
    try {
      const contract = getStakingContract()
      if (!contract) return '0'

      const interest = await contract.calculateInterest(stakeId)
      return formatEther(interest)
    } catch (error) {
      console.error('Failed to calculate interest:', error)
      return '0'
    }
  }, [])

  /**
   * Get total claimed red packet amount for a stake
   */
  const getTotalRedPacketClaimed = useCallback(async (stakeId: string): Promise<string> => {
    try {
      const contract = getStakingContract()
      if (!contract) return '0'

      const amount = await contract.redPacketClaimed(stakeId)
      return formatEther(amount)
    } catch (error) {
      console.error('Failed to get total red packet claimed:', error)
      return '0'
    }
  }, [])

  return {
    loading,
    // Write operations
    createStake,
    checkIn,
    claimRedPacket,
    withdraw,
    // Read operations
    getStake,
    refreshStake,
    getUserStakes,
    getCheckinRecords,
    getLocalCheckins,
    isRedPacketClaimed,
    getMaxRedPacketAmount,
    calculateInterest,
    getTotalRedPacketClaimed,
  }
}

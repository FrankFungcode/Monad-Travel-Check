import { useState, useCallback } from 'react'
import { parseEther, formatEther } from 'ethers'
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

export enum StakeType {
  DAILY = 0,
  ATTRACTION = 1,
}

export enum StakeMode {
  SEALED = 0,
  ANYTIME = 1,
}

export enum StakeStatus {
  ACTIVE = 0,
  COMPLETED = 1,
  WITHDRAWN = 2,
}

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

export interface ChainCheckinRecord {
  timestamp: bigint
  contentHash: string
  latitude: bigint
  longitude: bigint
}

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

export function useStaking() {
  const [loading, setLoading] = useState(false)
  const showSuccess = useSetAtom(showSuccessToastAtom)
  const showError = useSetAtom(showErrorToastAtom)

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

        let stakeId = '0'

        try {
          const event = receipt.logs.find(
            (log: { fragment?: { name: string } }) => log.fragment?.name === 'StakeCreated'
          )

          if (event && event.args && event.args[0]) {
            stakeId = event.args[0].toString()
          } else {
            for (const log of receipt.logs) {
              try {
                const parsed = contract.interface.parseLog(log)
                if (parsed && parsed.name === 'StakeCreated') {
                  stakeId = parsed.args[0].toString()
                  break
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        } catch (e) {
          console.warn('Error parsing logs:', e)
        }

        if (!stakeId || (stakeId === '0' && receipt.logs.length > 0)) {
          const STAKE_CREATED_TOPIC = '0x5c37d87e2c15979bf7deed864258000565917a14d1f7f534bf4b646317f66786'

          for (const log of receipt.logs) {
            if (log.topics && log.topics[0] === STAKE_CREATED_TOPIC && log.topics.length >= 2) {
              try {
                stakeId = BigInt(log.topics[1]).toString()
                break
              } catch (e) {
                console.warn('Error parsing topic:', e)
              }
            }
          }
        }

        if (!stakeId || (stakeId === '0' && receipt.logs.length > 0)) {
          const runner = contract.runner as { getAddress?: () => Promise<string> } | null
          const signerAddress = await runner?.getAddress?.()

          if (signerAddress) {
            const userStakes = await contract.getUserStakes(signerAddress)
            if (userStakes && userStakes.length > 0) {
              stakeId = userStakes[userStakes.length - 1].toString()
            }
          }
        }

        try {
          await refreshStake(stakeId)
        } catch (refreshError) {
          console.warn('Failed to refresh stake data, but continuing:', refreshError)
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

        const contentHash = await calculateContentHash(
          JSON.stringify({ content, images, timestamp: Date.now() })
        )

        const latitude = location ? BigInt(Math.round(location.lat * 1e6)) : BigInt(0)
        const longitude = location ? BigInt(Math.round(location.lng * 1e6)) : BigInt(0)

        const tx = await contract.checkIn(stakeId, contentHash, latitude, longitude)

        showSuccess('Check-in submitted, waiting for confirmation...')

        const receipt = await tx.wait()

        const readContract = getStakingContract()
        const checkinCount = await readContract?.getCheckinCount(stakeId)
        const checkinIndex = Number(checkinCount) - 1

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

        try {
          await refreshStake(stakeId)
        } catch (refreshError) {
          console.warn('Failed to refresh stake data:', refreshError)
        }

        showSuccess('打卡成功！')
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

  const claimRedPacket = useCallback(
    async (stakeId: string, checkinIndex: number): Promise<string | null> => {
      setLoading(true)
      try {
        const contract = await getStakingContractWithSigner()
        if (!contract) {
          throw new Error('Please connect your wallet first')
        }

        const tx = await contract.claimRedPacket(stakeId, checkinIndex)

        showSuccess('Claiming red packet...')

        const receipt = await tx.wait()

        let amountEth = '0'

        try {
          const event = receipt.logs.find(
            (log: { fragment?: { name: string } }) => log.fragment?.name === 'RedPacketClaimed'
          )

          if (event?.args?.[3]) {
            amountEth = formatEther(event.args[3])
          } else {
            for (const log of receipt.logs) {
              try {
                const parsed = contract.interface.parseLog(log)
                if (parsed && parsed.name === 'RedPacketClaimed') {
                  amountEth = formatEther(parsed.args[3])
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
    [showSuccess, showError]
  )

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

        const event = receipt.logs.find(
          (log: { fragment?: { name: string } }) => log.fragment?.name === 'StakeWithdrawn'
        )
        const totalAmount = event?.args?.[1]
        const amountEth = totalAmount ? formatEther(totalAmount) : '0'

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

  const refreshStake = useCallback(async (stakeId: string): Promise<LocalStake | null> => {
    const stake = await getStake(stakeId)
    if (stake) {
      await saveStake(stake)
    }
    return stake
  }, [getStake])

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

  const getLocalCheckins = useCallback(async (stakeId: string): Promise<LocalCheckin[]> => {
    return getCheckinsByStake(stakeId)
  }, [])

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
    createStake,
    checkIn,
    claimRedPacket,
    withdraw,
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

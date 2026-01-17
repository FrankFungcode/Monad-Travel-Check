/**
 * @file useContracts Hook
 * @description Custom hook for getting contract instances
 */

import { useMemo } from 'react'
import { BrowserProvider, Contract, JsonRpcSigner } from 'ethers'
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/constants/contracts'

/**
 * Get the Ethereum provider from window
 */
function getEthereumProvider() {
  if (typeof window === 'undefined') {
    return null
  }
  return (window as typeof window & { ethereum?: unknown }).ethereum || null
}

/**
 * Get a signer from the browser provider
 */
export async function getSigner(): Promise<JsonRpcSigner | null> {
  const ethereum = getEthereumProvider()
  if (!ethereum) {
    return null
  }
  const provider = new BrowserProvider(ethereum as never)
  return provider.getSigner()
}

/**
 * Get a read-only provider
 */
export function getProvider(): BrowserProvider | null {
  const ethereum = getEthereumProvider()
  if (!ethereum) {
    return null
  }
  return new BrowserProvider(ethereum as never)
}

/**
 * Contract instances type
 */
export interface ContractInstances {
  staking: Contract | null
  attraction: Contract | null
  badge: Contract | null
}

/**
 * Get contract instance (read-only)
 */
export function getStakingContract(): Contract | null {
  const provider = getProvider()
  if (!provider) return null
  return new Contract(
    CONTRACT_ADDRESSES.TravelCheckStaking,
    CONTRACT_ABIS.TravelCheckStaking,
    provider
  )
}

export function getAttractionContract(): Contract | null {
  const provider = getProvider()
  if (!provider) return null
  return new Contract(
    CONTRACT_ADDRESSES.TravelCheckAttraction,
    CONTRACT_ABIS.TravelCheckAttraction,
    provider
  )
}

export function getBadgeContract(): Contract | null {
  const provider = getProvider()
  if (!provider) return null
  return new Contract(
    CONTRACT_ADDRESSES.TravelCheckBadge,
    CONTRACT_ABIS.TravelCheckBadge,
    provider
  )
}

/**
 * Get contract instance with signer (for write operations)
 */
export async function getStakingContractWithSigner(): Promise<Contract | null> {
  const signer = await getSigner()
  if (!signer) return null
  return new Contract(
    CONTRACT_ADDRESSES.TravelCheckStaking,
    CONTRACT_ABIS.TravelCheckStaking,
    signer
  )
}

export async function getAttractionContractWithSigner(): Promise<Contract | null> {
  const signer = await getSigner()
  if (!signer) return null
  return new Contract(
    CONTRACT_ADDRESSES.TravelCheckAttraction,
    CONTRACT_ABIS.TravelCheckAttraction,
    signer
  )
}

export async function getBadgeContractWithSigner(): Promise<Contract | null> {
  const signer = await getSigner()
  if (!signer) return null
  return new Contract(
    CONTRACT_ADDRESSES.TravelCheckBadge,
    CONTRACT_ABIS.TravelCheckBadge,
    signer
  )
}

/**
 * Custom hook for getting contract instances (read-only)
 *
 * @returns Contract instances
 *
 * @example
 * const { staking, attraction, badge } = useContracts()
 */
export function useContracts(): ContractInstances {
  const contracts = useMemo(() => {
    return {
      staking: getStakingContract(),
      attraction: getAttractionContract(),
      badge: getBadgeContract(),
    }
  }, [])

  return contracts
}

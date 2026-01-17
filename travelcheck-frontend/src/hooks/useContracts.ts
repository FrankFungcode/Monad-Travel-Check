import { useMemo } from 'react'
import { BrowserProvider, Contract, JsonRpcSigner } from 'ethers'
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/constants/contracts'

function getEthereumProvider() {
  if (typeof window === 'undefined') {
    return null
  }
  return (window as typeof window & { ethereum?: unknown }).ethereum || null
}

export async function getSigner(): Promise<JsonRpcSigner | null> {
  const ethereum = getEthereumProvider()
  if (!ethereum) {
    return null
  }
  const provider = new BrowserProvider(ethereum as never)
  return provider.getSigner()
}

export function getProvider(): BrowserProvider | null {
  const ethereum = getEthereumProvider()
  if (!ethereum) {
    return null
  }
  return new BrowserProvider(ethereum as never)
}

export interface ContractInstances {
  staking: Contract | null
  attraction: Contract | null
  badge: Contract | null
}

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

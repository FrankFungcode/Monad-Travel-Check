/**
 * @file Network Configuration
 * @description Network configurations for different blockchain networks
 */

/**
 * Network configuration interface
 */
export interface NetworkConfig {
  /** Network chain ID */
  chainId: string
  /** Network chain ID in number format */
  chainIdNumber: number
  /** Network name */
  chainName: string
  /** Native currency */
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  /** RPC URLs */
  rpcUrls: string[]
  /** Block explorer URLs */
  blockExplorerUrls?: string[]
}

/**
 * Hardhat local network configuration
 */
export const HARDHAT_LOCAL: NetworkConfig = {
  chainId: '0x539', // 1337 in hex
  chainIdNumber: 1337,
  chainName: 'Hardhat Local',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['http://127.0.0.1:8545'],
  blockExplorerUrls: [],
}

/**
 * Monad Devnet configuration
 */
export const MONAD_DEVNET: NetworkConfig = {
  chainId: '0x8F', // 143 in hex
  chainIdNumber: 143,
  chainName: 'Monad Devnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://devnet.monad.xyz'], // 请根据实际情况修改
  blockExplorerUrls: [],
}

/**
 * Default network configuration
 * 默认使用 Hardhat 本地网络
 */
export const DEFAULT_NETWORK = HARDHAT_LOCAL

/**
 * All supported networks
 */
export const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  [HARDHAT_LOCAL.chainIdNumber]: HARDHAT_LOCAL,
  [MONAD_DEVNET.chainIdNumber]: MONAD_DEVNET,
}

/**
 * Check if a chain ID is supported
 */
export function isSupportedNetwork(chainId: number): boolean {
  return chainId in SUPPORTED_NETWORKS
}

/**
 * Get network config by chain ID
 */
export function getNetworkConfig(chainId: number): NetworkConfig | undefined {
  return SUPPORTED_NETWORKS[chainId]
}

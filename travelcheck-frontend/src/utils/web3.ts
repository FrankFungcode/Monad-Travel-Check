/**
 * @file Web3 Utility Functions
 * @description Functions for Web3 wallet operations using ethers.js
 */

import { BrowserProvider, formatEther } from 'ethers'
import type { NetworkConfig } from '@/constants/networks'
import { DEFAULT_NETWORK } from '@/constants/networks'

/**
 * Get the Ethereum provider from window
 *
 * @returns Ethereum provider or null
 */
function getEthereumProvider() {
  if (typeof window === 'undefined') {
    return null
  }

  // Support for window.ethereum (MetaMask, etc.)
  return (window as typeof window & { ethereum?: unknown }).ethereum || null
}

/**
 * Connect to user's wallet and return address
 *
 * @returns Promise resolving to wallet address
 * @throws Error if no wallet found or user rejected connection
 *
 * @example
 * try {
 *   const address = await connectWallet()
 *   console.log('Connected:', address)
 * } catch (error) {
 *   console.error('Failed to connect:', error)
 * }
 */
export async function connectWallet(): Promise<string> {
  const ethereum = getEthereumProvider()

  if (!ethereum) {
    throw new Error('No Ethereum wallet found. Please install MetaMask.')
  }

  try {
    const provider = new BrowserProvider(ethereum as never)
    const accounts = await provider.send('eth_requestAccounts', [])

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found')
    }

    return accounts[0] as string
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to connect wallet: ${error.message}`)
    }
    throw new Error('Failed to connect wallet')
  }
}

/**
 * Sign a message with the user's wallet
 *
 * @param message - Message to sign
 * @returns Promise resolving to signature
 * @throws Error if signing fails
 *
 * @example
 * try {
 *   const signature = await signMessage('Sign this message')
 *   console.log('Signature:', signature)
 * } catch (error) {
 *   console.error('Failed to sign:', error)
 * }
 */
export async function signMessage(message: string): Promise<string> {
  const ethereum = getEthereumProvider()

  if (!ethereum) {
    throw new Error('No Ethereum wallet found')
  }

  try {
    const provider = new BrowserProvider(ethereum as never)
    const signer = await provider.getSigner()
    const signature = await signer.signMessage(message)
    return signature
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to sign message: ${error.message}`)
    }
    throw new Error('Failed to sign message')
  }
}

/**
 * Get the balance of an address in ETH
 *
 * @param address - Ethereum address
 * @returns Promise resolving to balance in ETH as string
 *
 * @example
 * const balance = await getBalance('0x1234...')
 * console.log('Balance:', balance, 'ETH')
 * // Output: Balance: 1.5 ETH
 */
export async function getBalance(address: string): Promise<string> {
  const ethereum = getEthereumProvider()

  if (!ethereum) {
    throw new Error('No Ethereum wallet found')
  }

  try {
    const provider = new BrowserProvider(ethereum as never)

    // 获取当前网络信息用于调试
    const network = await provider.getNetwork()
    console.log('🔍 余额查询调试信息:')
    console.log('  - 地址:', address)
    console.log('  - 网络 Chain ID:', network.chainId.toString())
    console.log('  - 网络名称:', network.name)

    const balance = await provider.getBalance(address)
    console.log('  - 原始余额 (Wei):', balance.toString())

    const balanceInEth = formatEther(balance)
    console.log('  - ETH 余额:', balanceInEth)

    return balanceInEth
  } catch (error) {
    console.error('❌ 获取余额失败:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to get balance: ${error.message}`)
    }
    throw new Error('Failed to get balance')
  }
}

/**
 * Get current connected wallet address
 *
 * @returns Promise resolving to current address or null
 *
 * @example
 * const address = await getCurrentAddress()
 * if (address) {
 *   console.log('Current address:', address)
 * }
 */
export async function getCurrentAddress(): Promise<string | null> {
  const ethereum = getEthereumProvider()

  if (!ethereum) {
    return null
  }

  try {
    const provider = new BrowserProvider(ethereum as never)
    const accounts = await provider.send('eth_accounts', [])

    if (!accounts || accounts.length === 0) {
      return null
    }

    return accounts[0] as string
  } catch {
    return null
  }
}

/**
 * Get network information
 *
 * @returns Promise resolving to network info
 *
 * @example
 * const network = await getNetwork()
 * console.log('Chain ID:', network.chainId)
 * console.log('Network name:', network.name)
 */
export async function getNetwork(): Promise<{
  chainId: bigint
  name: string
}> {
  const ethereum = getEthereumProvider()

  if (!ethereum) {
    throw new Error('No Ethereum wallet found')
  }

  try {
    const provider = new BrowserProvider(ethereum as never)
    const network = await provider.getNetwork()
    return {
      chainId: network.chainId,
      name: network.name,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get network: ${error.message}`)
    }
    throw new Error('Failed to get network')
  }
}

/**
 * Switch to a specific network
 *
 * @param chainId - Target chain ID (in hex format)
 *
 * @example
 * await switchNetwork('0x1') // Switch to Ethereum mainnet
 * await switchNetwork('0x89') // Switch to Polygon
 */
export async function switchNetwork(chainId: string): Promise<void> {
  const ethereum = getEthereumProvider()

  if (!ethereum) {
    throw new Error('No Ethereum wallet found')
  }

  try {
    const provider = new BrowserProvider(ethereum as never)
    await provider.send('wallet_switchEthereumChain', [{ chainId }])
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to switch network: ${error.message}`)
    }
    throw new Error('Failed to switch network')
  }
}

/**
 * Add a network to MetaMask
 *
 * @param network - Network configuration
 *
 * @example
 * await addNetwork(HARDHAT_LOCAL)
 */
export async function addNetwork(network: NetworkConfig): Promise<void> {
  const ethereum = getEthereumProvider()

  if (!ethereum) {
    throw new Error('No Ethereum wallet found')
  }

  try {
    const provider = new BrowserProvider(ethereum as never)
    await provider.send('wallet_addEthereumChain', [
      {
        chainId: network.chainId,
        chainName: network.chainName,
        nativeCurrency: network.nativeCurrency,
        rpcUrls: network.rpcUrls,
        blockExplorerUrls: network.blockExplorerUrls,
      },
    ])
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to add network: ${error.message}`)
    }
    throw new Error('Failed to add network')
  }
}

/**
 * Switch to a network with configuration
 * Will try to switch first, if network doesn't exist, will add it
 *
 * @param network - Network configuration
 *
 * @example
 * await switchToNetwork(HARDHAT_LOCAL)
 */
export async function switchToNetwork(network: NetworkConfig): Promise<void> {
  const ethereum = getEthereumProvider()

  if (!ethereum) {
    throw new Error('No Ethereum wallet found')
  }

  try {
    // 首先尝试切换网络
    await switchNetwork(network.chainId)
    console.log(`✅ 已切换到网络: ${network.chainName} (Chain ID: ${network.chainIdNumber})`)
  } catch (switchError) {
    // 如果切换失败(网络不存在),则添加网络
    try {
      console.log(`⚠️ 网络不存在,正在添加: ${network.chainName}`)
      await addNetwork(network)
      console.log(`✅ 已添加并切换到网络: ${network.chainName}`)
    } catch (addError) {
      if (addError instanceof Error) {
        throw new Error(`Failed to switch or add network: ${addError.message}`)
      }
      throw new Error('Failed to switch or add network')
    }
  }
}

/**
 * Ensure connected to the default network (Hardhat Local)
 * If not, prompt user to switch
 *
 * @example
 * await ensureCorrectNetwork()
 */
export async function ensureCorrectNetwork(): Promise<void> {
  const ethereum = getEthereumProvider()

  if (!ethereum) {
    throw new Error('No Ethereum wallet found')
  }

  try {
    const provider = new BrowserProvider(ethereum as never)
    const network = await provider.getNetwork()
    const currentChainId = Number(network.chainId)

    console.log(`🔍 当前网络 Chain ID: ${currentChainId}`)
    console.log(`🎯 目标网络 Chain ID: ${DEFAULT_NETWORK.chainIdNumber}`)

    if (currentChainId !== DEFAULT_NETWORK.chainIdNumber) {
      console.log(`⚠️ 网络不匹配,正在切换到 ${DEFAULT_NETWORK.chainName}...`)
      await switchToNetwork(DEFAULT_NETWORK)
    } else {
      console.log(`✅ 已连接到正确的网络: ${DEFAULT_NETWORK.chainName}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to ensure correct network: ${error.message}`)
    }
    throw new Error('Failed to ensure correct network')
  }
}

/**
 * Check if wallet is connected
 *
 * @returns Promise resolving to boolean
 *
 * @example
 * const connected = await isWalletConnected()
 * console.log('Wallet connected:', connected)
 */
export async function isWalletConnected(): Promise<boolean> {
  const address = await getCurrentAddress()
  return address !== null
}

/**
 * Listen to account changes
 *
 * @param callback - Callback function receiving new accounts
 *
 * @example
 * onAccountsChanged((accounts) => {
 *   console.log('Account changed to:', accounts[0])
 * })
 */
export function onAccountsChanged(callback: (accounts: string[]) => void): void {
  const ethereum = getEthereumProvider()

  if (!ethereum || typeof ethereum !== 'object') {
    return
  }

  if ('on' in ethereum && typeof ethereum.on === 'function') {
    ethereum.on('accountsChanged', callback)
  }
}

/**
 * Listen to chain changes
 *
 * @param callback - Callback function receiving new chain ID
 *
 * @example
 * onChainChanged((chainId) => {
 *   console.log('Chain changed to:', chainId)
 * })
 */
export function onChainChanged(callback: (chainId: string) => void): void {
  const ethereum = getEthereumProvider()

  if (!ethereum || typeof ethereum !== 'object') {
    return
  }

  if ('on' in ethereum && typeof ethereum.on === 'function') {
    ethereum.on('chainChanged', callback)
  }
}

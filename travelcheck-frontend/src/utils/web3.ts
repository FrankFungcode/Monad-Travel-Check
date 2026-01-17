/**
 * @file Web3 Utility Functions
 * @description Functions for Web3 wallet operations using ethers.js
 */

import { BrowserProvider, formatEther } from 'ethers'

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
    const balance = await provider.getBalance(address)
    return formatEther(balance)
  } catch (error) {
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

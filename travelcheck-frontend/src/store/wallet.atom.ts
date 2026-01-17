/**
 * @file Wallet State Management
 * @description Jotai atoms for managing wallet connection and balance
 */

import { formatAddress, formatAmount } from '@/utils/format'
import { getBalance, connectWallet as web3ConnectWallet, ensureCorrectNetwork } from '@/utils/web3'
import { atom } from 'jotai'

/**
 * Wallet state interface
 */
export interface WalletState {
  /** Wallet address */
  address: string | null
  /** Wallet balance in ETH */
  balance: string
  /** Connection status */
  isConnected: boolean
  /** Connection in progress */
  isConnecting: boolean
}

/**
 * Base wallet atom
 */
export const walletAtom = atom<WalletState>({
  address: null,
  balance: '0',
  isConnected: false,
  isConnecting: false,
})

/**
 * Derived atom for formatted wallet address
 *
 * @example
 * const formattedAddress = useAtomValue(formattedAddressAtom)
 * // Returns: '0x1234...5678' or 'Not Connected'
 */
export const formattedAddressAtom = atom((get) => {
  const wallet = get(walletAtom)
  return wallet.address ? formatAddress(wallet.address) : 'Not Connected'
})

/**
 * Derived atom for formatted wallet balance
 *
 * @example
 * const formattedBalance = useAtomValue(formattedBalanceAtom)
 * // Returns: '1.50 ETH'
 */
export const formattedBalanceAtom = atom((get) => {
  const wallet = get(walletAtom)
  const balanceNum = Number.parseFloat(wallet.balance)
  return `${formatAmount(balanceNum, 4)} ETH`
})

/**
 * Action atom to connect wallet
 *
 * @example
 * const connectWallet = useSetAtom(connectWalletAtom)
 * await connectWallet()
 */
export const connectWalletAtom = atom(null, async (get, set) => {
  const currentWallet = get(walletAtom)

  // Prevent multiple simultaneous connection attempts
  if (currentWallet.isConnecting) {
    return
  }

  set(walletAtom, {
    ...currentWallet,
    isConnecting: true,
  })

  try {
    // 1. 连接钱包
    const address = await web3ConnectWallet()

    // 2. 确保连接到正确的网络(Hardhat Local - Chain ID 1337)
    await ensureCorrectNetwork()

    // 3. 获取余额
    const balance = await getBalance(address)

    set(walletAtom, {
      address,
      balance,
      isConnected: true,
      isConnecting: false,
    })
  } catch (error) {
    set(walletAtom, {
      address: null,
      balance: '0',
      isConnected: false,
      isConnecting: false,
    })
    throw error
  }
})

/**
 * Action atom to disconnect wallet
 *
 * @example
 * const disconnectWallet = useSetAtom(disconnectWalletAtom)
 * disconnectWallet()
 */
export const disconnectWalletAtom = atom(null, (_get, set) => {
  set(walletAtom, {
    address: null,
    balance: '0',
    isConnected: false,
    isConnecting: false,
  })
})

/**
 * Action atom to refresh wallet balance
 *
 * @example
 * const refreshBalance = useSetAtom(refreshBalanceAtom)
 * await refreshBalance()
 */
export const refreshBalanceAtom = atom(null, async (get, set) => {
  const wallet = get(walletAtom)

  if (!wallet.address) {
    return
  }

  try {
    const balance = await getBalance(wallet.address)
    set(walletAtom, {
      ...wallet,
      balance,
    })
  } catch (error) {
    console.error('Failed to refresh balance:', error)
  }
})

/**
 * Action atom to update wallet address
 *
 * @example
 * const updateAddress = useSetAtom(updateWalletAddressAtom)
 * await updateAddress('0x1234...')
 */
export const updateWalletAddressAtom = atom(null, async (get, set, address: string) => {
  const wallet = get(walletAtom)

  try {
    const balance = await getBalance(address)
    set(walletAtom, {
      ...wallet,
      address,
      balance,
      isConnected: true,
    })
  } catch (error) {
    console.error('Failed to update wallet address:', error)
  }
})

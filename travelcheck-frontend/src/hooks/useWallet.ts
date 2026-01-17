/**
 * @file useWallet Hook
 * @description Custom hook for wallet operations
 */

import { showErrorToastAtom } from '@/store/ui.atom'
import {
  connectWalletAtom,
  disconnectWalletAtom,
  formattedAddressAtom,
  formattedBalanceAtom,
  refreshBalanceAtom,
  walletAtom,
} from '@/store/wallet.atom'
import { useAtomValue, useSetAtom } from 'jotai'

/**
 * Custom hook for wallet operations
 *
 * @returns Wallet state and operations
 *
 * @example
 * const { address, balance, isConnected, connect, disconnect } = useWallet()
 *
 * // Connect wallet
 * await connect()
 *
 * // Disconnect wallet
 * disconnect()
 */
export function useWallet() {
  const wallet = useAtomValue(walletAtom)
  const formattedAddress = useAtomValue(formattedAddressAtom)
  const formattedBalance = useAtomValue(formattedBalanceAtom)
  const connectWallet = useSetAtom(connectWalletAtom)
  const disconnectWallet = useSetAtom(disconnectWalletAtom)
  const refreshBalance = useSetAtom(refreshBalanceAtom)
  const showError = useSetAtom(showErrorToastAtom)

  /**
   * Connect to user's wallet
   */
  const connect = async () => {
    try {
      await connectWallet()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect wallet'
      showError(message)
      throw error
    }
  }

  /**
   * Disconnect wallet
   */
  const disconnect = () => {
    disconnectWallet()
  }

  /**
   * Refresh wallet balance
   */
  const refresh = async () => {
    try {
      await refreshBalance()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh balance'
      showError(message)
    }
  }

  return {
    // State
    address: wallet.address,
    balance: wallet.balance,
    isConnected: wallet.isConnected,
    isConnecting: wallet.isConnecting,
    formattedAddress,
    formattedBalance,

    // Actions
    connect,
    disconnect,
    refresh,
  }
}

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

export function useWallet() {
  const wallet = useAtomValue(walletAtom)
  const formattedAddress = useAtomValue(formattedAddressAtom)
  const formattedBalance = useAtomValue(formattedBalanceAtom)
  const connectWallet = useSetAtom(connectWalletAtom)
  const disconnectWallet = useSetAtom(disconnectWalletAtom)
  const refreshBalance = useSetAtom(refreshBalanceAtom)
  const showError = useSetAtom(showErrorToastAtom)

  const connect = async () => {
    try {
      await connectWallet()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect wallet'
      showError(message)
      throw error
    }
  }

  const disconnect = () => {
    disconnectWallet()
  }

  const refresh = async () => {
    try {
      await refreshBalance()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh balance'
      showError(message)
    }
  }

  return {
    address: wallet.address,
    balance: wallet.balance,
    isConnected: wallet.isConnected,
    isConnecting: wallet.isConnecting,
    formattedAddress,
    formattedBalance,
    connect,
    disconnect,
    refresh,
  }
}

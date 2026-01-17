import { formatAddress, formatAmount } from '@/utils/format'
import { getBalance, connectWallet as web3ConnectWallet } from '@/utils/web3'
import { atom } from 'jotai'

export interface WalletState {
  address: string | null
  balance: string
  isConnected: boolean
  isConnecting: boolean
}

export const walletAtom = atom<WalletState>({
  address: null,
  balance: '0',
  isConnected: false,
  isConnecting: false,
})

export const formattedAddressAtom = atom((get) => {
  const wallet = get(walletAtom)
  return wallet.address ? formatAddress(wallet.address) : 'Not Connected'
})

export const formattedBalanceAtom = atom((get) => {
  const wallet = get(walletAtom)
  const balanceNum = Number.parseFloat(wallet.balance)
  return `${formatAmount(balanceNum, 4)} ETH`
})

export const connectWalletAtom = atom(null, async (get, set) => {
  const currentWallet = get(walletAtom)

  if (currentWallet.isConnecting) {
    return
  }

  set(walletAtom, {
    ...currentWallet,
    isConnecting: true,
  })

  try {
    const address = await web3ConnectWallet()
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

export const disconnectWalletAtom = atom(null, (_get, set) => {
  set(walletAtom, {
    address: null,
    balance: '0',
    isConnected: false,
    isConnecting: false,
  })
})

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

import { BrowserProvider, formatEther } from 'ethers'

function getEthereumProvider() {
  if (typeof window === 'undefined') {
    return null
  }
  return (window as typeof window & { ethereum?: unknown }).ethereum || null
}

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

export async function isWalletConnected(): Promise<boolean> {
  const address = await getCurrentAddress()
  return address !== null
}

export function onAccountsChanged(callback: (accounts: string[]) => void): void {
  const ethereum = getEthereumProvider()

  if (!ethereum || typeof ethereum !== 'object') {
    return
  }

  if ('on' in ethereum && typeof ethereum.on === 'function') {
    ethereum.on('accountsChanged', callback)
  }
}

export function onChainChanged(callback: (chainId: string) => void): void {
  const ethereum = getEthereumProvider()

  if (!ethereum || typeof ethereum !== 'object') {
    return
  }

  if ('on' in ethereum && typeof ethereum.on === 'function') {
    ethereum.on('chainChanged', callback)
  }
}

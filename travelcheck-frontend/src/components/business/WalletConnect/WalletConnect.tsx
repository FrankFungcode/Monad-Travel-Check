import { Button } from '@/components/common/Button'
import { useWallet } from '@/hooks/useWallet'
import { clsx } from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export interface WalletConnectProps {
  className?: string
  showBalance?: boolean
}

export function WalletConnect({ className, showBalance = true }: WalletConnectProps) {
  const { t } = useTranslation()
  const {
    address,
    formattedAddress,
    formattedBalance,
    isConnected,
    isConnecting,
    connect,
    disconnect,
  } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleConnect = useCallback(async () => {
    try {
      await connect()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }, [connect])

  const handleDisconnect = useCallback(() => {
    disconnect()
    setShowDropdown(false)
  }, [disconnect])

  const handleCopyAddress = useCallback(async () => {
    if (!address) return

    try {
      await navigator.clipboard.writeText(address)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }, [address])

  const toggleDropdown = useCallback(() => {
    setShowDropdown((prev) => !prev)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  if (!isConnected) {
    return (
      <Button
        variant="primary"
        onClick={handleConnect}
        loading={isConnecting}
        disabled={isConnecting}
        className={className}
      >
        {isConnecting ? t('common.connecting') : t('common.connectWallet')}
      </Button>
    )
  }

  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={clsx(
          'flex items-center gap-3 px-4 py-2 rounded-lg',
          'bg-card-dark border-2 border-border-dark',
          'hover:border-primary transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark'
        )}
      >
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            role="img"
            aria-label="Wallet"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>

        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-white">{formattedAddress}</span>
          {showBalance && <span className="text-xs text-text-muted">{formattedBalance}</span>}
        </div>

        <svg
          role="img"
          aria-hidden="true"
          className={clsx(
            'w-4 h-4 text-text-muted transition-transform',
            showDropdown && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div
          className={clsx(
            'absolute right-0 mt-2 w-48 rounded-lg',
            'bg-card-dark border-2 border-border-dark',
            'shadow-lg z-10',
            'animate-fadeIn'
          )}
        >
          <button
            type="button"
            onClick={handleCopyAddress}
            className={clsx(
              'w-full px-4 py-3 text-left text-sm',
              'flex items-center gap-2',
              'hover:bg-background-dark transition-colors',
              'first:rounded-t-lg'
            )}
          >
            <svg
              role="img"
              aria-hidden="true"
              className="w-4 h-4 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="text-white">{copySuccess ? t('common.copied') : t('common.copyAddress')}</span>
          </button>

          <button
            type="button"
            onClick={handleDisconnect}
            className={clsx(
              'w-full px-4 py-3 text-left text-sm',
              'flex items-center gap-2',
              'hover:bg-background-dark transition-colors',
              'text-red-400 hover:text-red-300',
              'last:rounded-b-lg'
            )}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>{t('common.disconnect')}</span>
          </button>
        </div>
      )}
    </div>
  )
}

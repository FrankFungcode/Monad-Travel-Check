/**
 * @file WalletConnect Component
 * @description Wallet connection button with dropdown menu for wallet operations
 */

import { Button } from '@/components/common/Button'
import { useWallet } from '@/hooks/useWallet'
import { clsx } from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * WalletConnect component props
 */
export interface WalletConnectProps {
  /** Custom class name */
  className?: string
  /** Show balance */
  showBalance?: boolean
}

/**
 * WalletConnect Component
 *
 * @example
 * <WalletConnect />
 *
 * @example
 * <WalletConnect showBalance />
 */
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
    refresh,
  } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  /**
   * Handle wallet connection
   */
  const handleConnect = useCallback(async () => {
    try {
      await connect()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }, [connect])

  /**
   * Handle wallet disconnection
   */
  const handleDisconnect = useCallback(() => {
    disconnect()
    setShowDropdown(false)
  }, [disconnect])

  /**
   * Handle refresh balance
   */
  const handleRefresh = useCallback(async () => {
    try {
      await refresh()
      console.log('✅ 余额刷新成功')
    } catch (error) {
      console.error('刷新余额失败:', error)
    }
  }, [refresh])

  /**
   * Handle copy address
   */
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

  /**
   * Toggle dropdown menu
   */
  const toggleDropdown = useCallback(() => {
    setShowDropdown((prev) => !prev)
  }, [])

  /**
   * Close dropdown when clicking outside
   */
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
      {/* Connected wallet button */}
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
        {/* Wallet icon */}
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

        {/* Address and balance */}
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-white">{formattedAddress}</span>
          {showBalance && <span className="text-xs text-text-muted">{formattedBalance}</span>}
        </div>

        {/* Dropdown icon */}
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

      {/* Dropdown menu */}
      {showDropdown && (
        <div
          className={clsx(
            'absolute right-0 mt-2 w-48 rounded-lg',
            'bg-card-dark border-2 border-border-dark',
            'shadow-lg z-10',
            'animate-fadeIn'
          )}
        >
          {/* Copy address option */}
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

          {/* Refresh balance option */}
          <button
            type="button"
            onClick={handleRefresh}
            className={clsx(
              'w-full px-4 py-3 text-left text-sm',
              'flex items-center gap-2',
              'hover:bg-background-dark transition-colors'
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-white">刷新余额</span>
          </button>

          {/* Disconnect option */}
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

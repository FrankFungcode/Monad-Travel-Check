/**
 * @file RedPacket Component
 * @description Animated red packet component for claiming rewards
 */

import { Button } from '@/components/common/Button'
import type { Reward } from '@/types/models.types'
import { formatAmount } from '@/utils/format'
import { clsx } from 'clsx'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * RedPacket component props
 */
export interface RedPacketProps {
  /** Reward data */
  reward: Reward
  /** Custom class name */
  className?: string
  /** Claim button click handler */
  onClaim?: (reward: Reward) => void
  /** Close handler */
  onClose?: () => void
}

/**
 * RedPacket Component
 *
 * @example
 * <RedPacket
 *   reward={myReward}
 *   onClaim={(reward) => console.log('Claim', reward.id)}
 * />
 */
export function RedPacket({ reward, className, onClaim, onClose }: RedPacketProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  /**
   * Check if red packet is expired
   */
  const isExpired = useMemo(() => {
    if (!reward.expireAt) return false
    return new Date(reward.expireAt) < new Date()
  }, [reward.expireAt])

  /**
   * Calculate time remaining
   */
  useEffect(() => {
    if (!reward.expireAt || reward.claimed) return

    const updateTimeRemaining = () => {
      const now = new Date()
      const expireDate = new Date(reward.expireAt || '')
      const diff = expireDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining(t('redPacket.expired'))
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [reward.expireAt, reward.claimed])

  /**
   * Handle red packet open
   */
  const handleOpen = useCallback(() => {
    if (reward.claimed || isExpired) return
    setIsOpen(true)
  }, [reward.claimed, isExpired])

  /**
   * Handle claim
   */
  const handleClaim = useCallback(() => {
    if (!onClaim) return
    onClaim(reward)
  }, [reward, onClaim])

  /**
   * Get status text
   */
  const statusText = useMemo(() => {
    if (reward.claimed) return t('redPacket.claimed')
    if (isExpired) return t('redPacket.expired')
    return t('redPacket.unclaimed')
  }, [reward.claimed, isExpired, t])

  return (
    <div
      className={clsx(
        'relative w-64 h-80 rounded-lg overflow-hidden',
        'bg-gradient-to-br from-red-600 to-red-800',
        'shadow-2xl',
        className
      )}
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg
          aria-hidden="true"
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2" fill="white" />
          </pattern>
          <rect width="100" height="100" fill="url(#pattern)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between p-1">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-400 rounded-full flex items-center justify-center">
            <svg
              aria-hidden="true"
              className="w-10 h-10 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{t('redPacket.title')}</h3>
          <p className="text-yellow-200 text-sm">{statusText}</p>
        </div>

        {/* Amount section */}
        {!isOpen && !reward.claimed ? (
          <div className="text-center">
            <div className="mb-4">
              <div className="text-yellow-200 text-sm mb-2">{t('redPacket.tapToOpen')}</div>
              {!isExpired && (
                <div className="text-white text-xs">{t('redPacket.expiresIn')} {timeRemaining}</div>
              )}
            </div>

            {/* Open button */}
            <button
              type="button"
              onClick={handleOpen}
              disabled={isExpired}
              className={clsx(
                'w-32 h-32 rounded-full',
                'bg-yellow-400 hover:bg-yellow-300',
                'transition-all transform hover:scale-110',
                'flex items-center justify-center',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                'focus:outline-none focus:ring-4 focus:ring-yellow-300'
              )}
            >
              <span className="text-3xl">🧧</span>
            </button>
          </div>
        ) : (
          <div className="text-center animate-fadeIn">
            <div className="mb-6">
              <div className="text-yellow-200 text-sm mb-2">
                {reward.claimed ? '已领取' : t('redPacket.congratulations')}
              </div>
              <div className="text-5xl font-bold text-white">
                {reward.claimed ? formatAmount(reward.amount || 0) : '?'}
              </div>
              <div className="text-xl text-yellow-200 mt-2">
                {reward.claimed ? 'MON' : '随机金额'}
              </div>
            </div>

            {/* Claim button */}
            {!reward.claimed && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleClaim}
                className="bg-yellow-400 hover:bg-yellow-300 text-red-600 font-bold"
              >
                {t('redPacket.claimNow')}
              </Button>
            )}

            {reward.claimed && (
              <div className="text-green-400 text-sm font-medium">✓ {t('redPacket.alreadyClaimed')}</div>
            )}
          </div>
        )}

        {/* Close button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 transition-colors flex items-center justify-center"
          >
            <svg
              role="img"
              aria-hidden="true"
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Sparkle animation overlay */}
      {isOpen && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={`sparkle-${reward.id}-${i}-${Date.now()}`}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

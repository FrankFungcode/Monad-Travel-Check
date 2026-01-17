/**
 * @file LotteryWheel Component
 * @description Interactive lottery wheel component with spin animation
 */

import { Button } from '@/components/common/Button'
import { LOTTERY_PRIZES } from '@/constants/business'
import type { LotteryPrize as LotteryPrizeModel } from '@/types/models.types'
import { clsx } from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * LotteryWheel component props
 */
export interface LotteryWheelProps {
  /** Number of spins remaining */
  chances: number
  /** Custom class name */
  className?: string
  /** Spin handler */
  onSpin?: () => Promise<LotteryPrizeModel>
  /** Result handler */
  onResult?: (prize: LotteryPrizeModel) => void
}

/**
 * Prize colors for the wheel
 */
const PRIZE_COLORS = [
  '#FF6B6B', // red
  '#4ECDC4', // teal
  '#FFE66D', // yellow
  '#95E1D3', // mint
  '#F38181', // pink
  '#AA96DA', // purple
]

/**
 * LotteryWheel Component
 *
 * @example
 * <LotteryWheel
 *   chances={3}
 *   onSpin={async () => {
 *     const prize = await spinLottery()
 *     return prize
 *   }}
 * />
 */
export function LotteryWheel({ chances, className, onSpin, onResult }: LotteryWheelProps) {
  const { t } = useTranslation()
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<LotteryPrizeModel | null>(null)

  /**
   * Calculate slice angle for each prize
   */
  const sliceAngle = 360 / LOTTERY_PRIZES.length

  /**
   * Handle spin
   */
  const handleSpin = useCallback(async () => {
    if (isSpinning || chances <= 0 || !onSpin) return

    setIsSpinning(true)
    setResult(null)

    try {
      // Call API to get prize
      const prize = await onSpin()

      // Find prize index
      const prizeIndex = LOTTERY_PRIZES.findIndex((p) => p.name === prize.name)
      const targetIndex = prizeIndex >= 0 ? prizeIndex : 0

      // Calculate target rotation
      // Spin at least 5 full rotations + target slice
      const targetSliceRotation = targetIndex * sliceAngle
      const fullRotations = 5 * 360
      const finalRotation = fullRotations + (360 - targetSliceRotation) + sliceAngle / 2

      // Set rotation with smooth animation
      setRotation(rotation + finalRotation)

      // Wait for animation to complete
      setTimeout(() => {
        setIsSpinning(false)
        setResult(prize)
        onResult?.(prize)
      }, 5000)
    } catch (error) {
      console.error('Failed to spin:', error)
      setIsSpinning(false)
    }
  }, [isSpinning, chances, onSpin, rotation, sliceAngle, onResult])

  /**
   * Reset rotation after result is shown
   */
  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        setRotation(0)
      }, 3000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [result])

  return (
    <div className={clsx('flex flex-col items-center gap-6', className)}>
      {/* Wheel container */}
      <div className="relative w-80 h-80">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <div className="relative w-full h-full">
          <svg
            className="w-full h-full transition-transform duration-5000 ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
            viewBox="0 0 100 100"
            role="img"
            aria-label="Lottery wheel"
          >
            {/* Draw prize slices */}
            {LOTTERY_PRIZES.map((prize, index) => {
              const startAngle = index * sliceAngle
              const endAngle = (index + 1) * sliceAngle

              // Convert angles to radians
              const startRad = ((startAngle - 90) * Math.PI) / 180
              const endRad = ((endAngle - 90) * Math.PI) / 180

              // Calculate path coordinates
              const x1 = 50 + 50 * Math.cos(startRad)
              const y1 = 50 + 50 * Math.sin(startRad)
              const x2 = 50 + 50 * Math.cos(endRad)
              const y2 = 50 + 50 * Math.sin(endRad)

              const largeArcFlag = sliceAngle > 180 ? 1 : 0

              const path = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

              return (
                <g key={prize.id}>
                  {/* Slice */}
                  <path
                    d={path}
                    fill={PRIZE_COLORS[index % PRIZE_COLORS.length]}
                    stroke="white"
                    strokeWidth="0.5"
                  />

                  {/* Text */}
                  <text
                    x="50"
                    y="50"
                    fill="white"
                    fontSize="4"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${startAngle + sliceAngle / 2} 50 50) translate(0 -25)`}
                  >
                    {prize.name}
                  </text>
                </g>
              )
            })}

            {/* Center circle */}
            <circle
              cx="50"
              cy="50"
              r="10"
              fill="white"
              stroke="var(--color-primary)"
              strokeWidth="2"
            />
            <circle cx="50" cy="50" r="8" fill="var(--color-primary)" />
          </svg>
        </div>

        {/* Outer ring decoration */}
        <div className="absolute inset-0 rounded-full border-4 border-primary shadow-lg" />
      </div>

      {/* Chances remaining */}
      <div className="text-center">
        <p className="text-sm text-text-muted mb-1">{t('lottery.chancesRemaining')}</p>
        <p className="text-3xl font-bold text-primary">{chances}</p>
      </div>

      {/* Spin button */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleSpin}
        disabled={isSpinning || chances <= 0}
        loading={isSpinning}
        className="min-w-32"
      >
        {isSpinning ? t('lottery.spinning') : t('lottery.spinNow')}
      </Button>

      {/* Result modal */}
      {result && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-card-dark border-2 border-primary rounded-lg p-8 max-w-md text-center animate-scaleIn">
            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => {
                const uniqueKey = `confetti-${Date.now()}-${i}-${Math.random()}`
                return (
                  <div
                    key={uniqueKey}
                    className="absolute w-2 h-2 bg-primary rounded-full animate-confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 0.5}s`,
                    }}
                  />
                )
              })}
            </div>

            {/* Result content */}
            <div className="relative z-10">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('lottery.congratulations')}</h2>
              <p className="text-text-muted mb-4">{t('lottery.youWon')}</p>
              <div className="bg-background-dark rounded-lg p-4 mb-6">
                <p className="text-3xl font-bold text-primary mb-2">{result.name}</p>
                {result.type === 'token' && result.amount && (
                  <p className="text-xl text-white">{result.amount} MON</p>
                )}
              </div>
              <Button variant="primary" size="lg" onClick={() => setResult(null)}>
                {t('lottery.claimPrize')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

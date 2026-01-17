/**
 * @file Loading Component
 * @description Loading spinner and overlay components
 */

import { clsx } from 'clsx'

/**
 * Loading spinner props
 */
export interface LoadingProps {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg'
  /** Custom className */
  className?: string
}

/**
 * Loading Spinner Component
 *
 * @example
 * <Loading />
 *
 * @example
 * <Loading size="lg" />
 */
export function Loading({ size = 'md', className }: LoadingProps) {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={clsx('inline-block', className)}>
      <svg
        className={clsx('animate-spin text-primary', sizeStyles[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="img"
        aria-label="Loading"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

/**
 * Loading Overlay Component
 *
 * Displays a full-screen loading overlay
 *
 * @example
 * {isLoading && <LoadingOverlay />}
 *
 * @example
 * <LoadingOverlay message="Loading data..." />
 */
export function LoadingOverlay({
  message,
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-75',
        className
      )}
    >
      <Loading size="lg" />
      {message && <p className="mt-4 text-primary text-lg">{message}</p>}
    </div>
  )
}

/**
 * Loading Dots Component
 *
 * Animated dots for inline loading states
 *
 * @example
 * <p>Loading<LoadingDots /></p>
 */
export function LoadingDots() {
  return (
    <span className="inline-flex gap-1 ml-1">
      <span className="animate-bounce delay-0">.</span>
      <span className="animate-bounce delay-100">.</span>
      <span className="animate-bounce delay-200">.</span>
    </span>
  )
}

/**
 * Loading Skeleton Component
 *
 * Skeleton loading placeholder
 *
 * @example
 * <LoadingSkeleton />
 *
 * @example
 * <LoadingSkeleton className="h-20 w-full" />
 */
export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('animate-pulse bg-card-dark rounded-lg', className || 'h-4 w-full')} />
  )
}

/**
 * Loading Card Component
 *
 * Card with loading content
 *
 * @example
 * {isLoading ? <LoadingCard /> : <Card>Content</Card>}
 */
export function LoadingCard() {
  return (
    <div className="bg-card-dark border border-border-dark rounded-xl p-4 space-y-3">
      <LoadingSkeleton className="h-6 w-3/4" />
      <LoadingSkeleton className="h-4 w-full" />
      <LoadingSkeleton className="h-4 w-5/6" />
      <LoadingSkeleton className="h-4 w-4/6" />
    </div>
  )
}

/**
 * Inline Loading Component
 *
 * Small inline loading spinner with optional text
 *
 * @example
 * <InlineLoading text="Saving..." />
 */
export function InlineLoading({
  text,
  className,
}: {
  text?: string
  className?: string
}) {
  return (
    <div className={clsx('inline-flex items-center gap-2', className)}>
      <Loading size="sm" />
      {text && <span className="text-sm text-text-muted">{text}</span>}
    </div>
  )
}

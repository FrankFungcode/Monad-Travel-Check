import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline'

export interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Badge({ variant = 'default', size = 'sm', children, className }: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full'

  const variantClasses = {
    default: 'bg-gray-600 text-white',
    primary: 'bg-primary/20 text-primary border border-primary/50',
    success: 'bg-green-500/20 text-green-400 border border-green-500/50',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/50',
    info: 'bg-blue-500/20 text-blue-400 border border-blue-500/50',
    outline: 'bg-transparent text-text-muted border border-border-dark',
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}>
      {children}
    </span>
  )
}

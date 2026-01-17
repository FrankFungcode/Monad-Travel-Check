import { clsx } from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  glowing?: boolean
}

function CardRoot({
  children,
  padding = 'md',
  hoverable = false,
  glowing = false,
  className,
  ...props
}: CardProps) {
  const baseStyles = 'bg-card-dark border border-border-dark rounded-xl transition-all duration-200'

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const hoverStyles = hoverable ? 'hover:shadow-lg hover:border-primary cursor-pointer' : ''
  const glowStyles = glowing ? 'shadow-glow' : 'shadow-md'

  return (
    <div
      className={clsx(baseStyles, paddingStyles[padding], hoverStyles, glowStyles, className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('border-b border-border-dark pb-3 mb-3', className)} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('border-t border-border-dark pt-3 mt-3', className)} {...props}>
      {children}
    </div>
  )
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
})

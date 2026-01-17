/**
 * @file Card Component
 * @description Reusable card container component
 */

import { clsx } from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'

/**
 * Card component props
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card content */
  children: ReactNode
  /** Card padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Enable hover effect */
  hoverable?: boolean
  /** Enable border glow effect */
  glowing?: boolean
}

/**
 * Card Component
 *
 * @example
 * <Card>
 *   <h2>Card Title</h2>
 *   <p>Card content goes here</p>
 * </Card>
 *
 * @example
 * <Card hoverable glowing padding="lg">
 *   <h2>Interactive Card</h2>
 * </Card>
 */
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

/**
 * Card Header Component
 *
 * @example
 * <Card>
 *   <CardHeader>
 *     <h2>Title</h2>
 *   </CardHeader>
 *   <CardBody>Content</CardBody>
 * </Card>
 */
export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('border-b border-border-dark pb-3 mb-3', className)} {...props}>
      {children}
    </div>
  )
}

/**
 * Card Body Component
 *
 * @example
 * <Card>
 *   <CardBody>
 *     <p>Main content</p>
 *   </CardBody>
 * </Card>
 */
export function CardBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('', className)} {...props}>
      {children}
    </div>
  )
}

/**
 * Card Footer Component
 *
 * @example
 * <Card>
 *   <CardBody>Content</CardBody>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 */
export function CardFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('border-t border-border-dark pt-3 mt-3', className)} {...props}>
      {children}
    </div>
  )
}

// Compose Card with sub-components
export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
})

import type { ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

export type Size = 'sm' | 'md' | 'lg'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export type CheckinStatus =
  | 'checked'
  | 'missed'
  | 'makeup'
  | 'attraction'
  | 'makeup-available'
  | null

export interface BaseProps {
  className?: string
  children?: ReactNode
}

export interface WithId {
  id: string
}

export interface Clickable {
  onClick?: () => void
}

export interface Disableable {
  disabled?: boolean
}

export interface Loadable {
  loading?: boolean
}

export interface RouteParams {
  [key: string]: string | undefined
}

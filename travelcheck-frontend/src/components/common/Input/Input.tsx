/**
 * @file Input Component
 * @description Reusable input field component with label and error states
 */

import { clsx } from 'clsx'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

/**
 * Input component props
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Input label */
  label?: string
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Full width input */
  fullWidth?: boolean
}

/**
 * Textarea component props
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea label */
  label?: string
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Full width textarea */
  fullWidth?: boolean
}

/**
 * Input Component
 *
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 * />
 *
 * @example
 * <Input
 *   label="Amount"
 *   type="number"
 *   error="Amount must be greater than 0"
 * />
 *
 * @example
 * <Input
 *   label="Username"
 *   helperText="Choose a unique username"
 *   fullWidth
 * />
 */
export function Input({
  label,
  error,
  helperText,
  fullWidth = false,
  className,
  id,
  ...inputProps
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  const baseStyles =
    'px-4 py-2 bg-background-dark border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2'

  const stateStyles = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : 'border-border-dark focus:ring-primary focus:border-primary'

  const textStyles = error
    ? 'text-red-100 placeholder-red-300'
    : 'text-white placeholder-text-muted'

  return (
    <div className={clsx(fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-primary mb-1">
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={clsx(
          baseStyles,
          stateStyles,
          textStyles,
          fullWidth && 'w-full',
          inputProps.disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...inputProps}
      />

      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}

      {helperText && !error && <p className="mt-1 text-sm text-text-muted">{helperText}</p>}
    </div>
  )
}

/**
 * Textarea Component
 *
 * @example
 * <Textarea
 *   label="Description"
 *   placeholder="Enter description"
 *   rows={4}
 * />
 */
export function Textarea({
  label,
  error,
  helperText,
  fullWidth = false,
  className,
  id,
  ...textareaProps
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  const baseStyles =
    'px-4 py-2 bg-background-dark border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 resize-vertical'

  const stateStyles = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : 'border-border-dark focus:ring-primary focus:border-primary'

  const textStyles = error
    ? 'text-red-100 placeholder-red-300'
    : 'text-white placeholder-text-muted'

  return (
    <div className={clsx(fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-primary mb-1">
          {label}
        </label>
      )}

      <textarea
        id={inputId}
        className={clsx(
          baseStyles,
          stateStyles,
          textStyles,
          fullWidth && 'w-full',
          textareaProps.disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...textareaProps}
      />

      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}

      {helperText && !error && <p className="mt-1 text-sm text-text-muted">{helperText}</p>}
    </div>
  )
}

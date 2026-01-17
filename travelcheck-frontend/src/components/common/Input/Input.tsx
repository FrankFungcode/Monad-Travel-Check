import { clsx } from 'clsx'
import type { InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

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

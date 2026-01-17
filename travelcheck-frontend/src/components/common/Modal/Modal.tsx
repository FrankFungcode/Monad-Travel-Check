/**
 * @file Modal Component
 * @description Modal dialog component with Portal support
 */

import { clsx } from 'clsx'
import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * Modal component props
 */
export interface ModalProps {
  /** Whether modal is open */
  isOpen: boolean
  /** Callback when modal should close */
  onClose: () => void
  /** Modal title */
  title?: string
  /** Modal content */
  children: ReactNode
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Show close button */
  showClose?: boolean
  /** Close on backdrop click */
  closeOnBackdrop?: boolean
  /** Custom className for modal content */
  className?: string
}

/**
 * Modal Component
 *
 * @example
 * const [isOpen, setIsOpen] = useState(false)
 *
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Modal Title"
 * >
 *   <p>Modal content goes here</p>
 * </Modal>
 *
 * @example
 * <Modal
 *   isOpen={true}
 *   onClose={handleClose}
 *   size="lg"
 *   showClose={false}
 * >
 *   <CustomContent />
 * </Modal>
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  closeOnBackdrop = true,
  className,
}: ModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={closeOnBackdrop ? onClose : undefined}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            closeOnBackdrop && onClose()
          }
        }}
        role="button"
        tabIndex={-1}
        aria-label="Close modal backdrop"
      />

      {/* Modal */}
      <div
        className={clsx(
          'relative bg-card-dark border border-border-dark rounded-xl shadow-glow-strong w-full',
          sizeStyles[size],
          'max-h-[90vh] overflow-y-auto',
          className
        )}
        // biome-ignore lint/a11y/useSemanticElements: Using div for better browser compatibility
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between p-4 border-b border-border-dark">
            {title && <h3 className="text-xl font-semibold text-primary">{title}</h3>}
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-text-muted hover:text-primary transition-colors p-1"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-label="Close"
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
        )}

        {/* Content */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  )

  // Render modal in portal
  return createPortal(modalContent, document.body)
}

/**
 * Modal Footer Component
 *
 * @example
 * <Modal isOpen={true} onClose={handleClose}>
 *   <p>Content</p>
 *   <ModalFooter>
 *     <Button onClick={handleClose}>Cancel</Button>
 *     <Button variant="primary">Confirm</Button>
 *   </ModalFooter>
 * </Modal>
 */
export function ModalFooter({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={clsx(
        'flex items-center justify-end gap-3 pt-4 mt-4 border-t border-border-dark',
        className
      )}
    >
      {children}
    </div>
  )
}

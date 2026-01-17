/**
 * @file UI State Management
 * @description Jotai atoms for managing UI state (loading, toasts, modals)
 */

import type { ToastType } from '@/types/components.types'
import { atom } from 'jotai'
import type { ReactNode } from 'react'

/**
 * Loading state atom
 */
export const loadingAtom = atom<boolean>(false)

/**
 * Toast state interface
 */
export interface ToastState {
  /** Toast type */
  type: ToastType
  /** Toast message */
  message: string
  /** Unique toast ID */
  id: string
  /** Duration in ms (0 = infinite) */
  duration?: number
}

/**
 * Toast atom - stores active toasts
 */
export const toastAtom = atom<ToastState | null>(null)

/**
 * Modal state interface
 */
export interface ModalState {
  /** Whether modal is open */
  isOpen: boolean
  /** Modal content */
  content: ReactNode | null
  /** Modal title */
  title?: string
  /** Whether to show close button */
  showClose?: boolean
  /** Callback when modal closes */
  onClose?: () => void
}

/**
 * Modal atom - stores modal state
 */
export const modalAtom = atom<ModalState>({
  isOpen: false,
  content: null,
  showClose: true,
})

/**
 * Action atom to set loading state
 *
 * @example
 * const setLoading = useSetAtom(setLoadingAtom)
 * setLoading(true)
 */
export const setLoadingAtom = atom(null, (_get, set, loading: boolean) => {
  set(loadingAtom, loading)
})

/**
 * Action atom to show a toast
 *
 * @example
 * const showToast = useSetAtom(showToastAtom)
 * showToast({ type: 'success', message: 'Operation completed!' })
 */
export const showToastAtom = atom(
  null,
  (_get, set, toast: Omit<ToastState, 'id'> & { duration?: number }) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    set(toastAtom, {
      ...toast,
      id,
      duration: toast.duration ?? 3000,
    })
  }
)

/**
 * Action atom to hide current toast
 *
 * @example
 * const hideToast = useSetAtom(hideToastAtom)
 * hideToast()
 */
export const hideToastAtom = atom(null, (_get, set) => {
  set(toastAtom, null)
})

/**
 * Action atom to open a modal
 *
 * @example
 * const openModal = useSetAtom(openModalAtom)
 * openModal({
 *   content: <div>Modal content</div>,
 *   title: 'Modal Title'
 * })
 */
export const openModalAtom = atom(null, (_get, set, modal: Omit<ModalState, 'isOpen'>) => {
  set(modalAtom, {
    ...modal,
    isOpen: true,
  })
})

/**
 * Action atom to close the modal
 *
 * @example
 * const closeModal = useSetAtom(closeModalAtom)
 * closeModal()
 */
export const closeModalAtom = atom(null, (get, set) => {
  const modal = get(modalAtom)
  if (modal.onClose) {
    modal.onClose()
  }
  set(modalAtom, {
    isOpen: false,
    content: null,
    showClose: true,
  })
})

/**
 * Convenience atoms for different toast types
 */

/**
 * Show success toast
 *
 * @example
 * const showSuccess = useSetAtom(showSuccessToastAtom)
 * showSuccess('Operation successful!')
 */
export const showSuccessToastAtom = atom(null, (_get, set, message: string) => {
  set(showToastAtom, { type: 'success', message })
})

/**
 * Show error toast
 *
 * @example
 * const showError = useSetAtom(showErrorToastAtom)
 * showError('Something went wrong!')
 */
export const showErrorToastAtom = atom(null, (_get, set, message: string) => {
  set(showToastAtom, { type: 'error', message })
})

/**
 * Show warning toast
 *
 * @example
 * const showWarning = useSetAtom(showWarningToastAtom)
 * showWarning('Please check your input')
 */
export const showWarningToastAtom = atom(null, (_get, set, message: string) => {
  set(showToastAtom, { type: 'warning', message })
})

/**
 * Show info toast
 *
 * @example
 * const showInfo = useSetAtom(showInfoToastAtom)
 * showInfo('New feature available!')
 */
export const showInfoToastAtom = atom(null, (_get, set, message: string) => {
  set(showToastAtom, { type: 'info', message })
})

/**
 * Sidebar state atom
 */
export const sidebarOpenAtom = atom<boolean>(false)

/**
 * Action atom to toggle sidebar
 *
 * @example
 * const toggleSidebar = useSetAtom(toggleSidebarAtom)
 * toggleSidebar()
 */
export const toggleSidebarAtom = atom(null, (get, set) => {
  const isOpen = get(sidebarOpenAtom)
  set(sidebarOpenAtom, !isOpen)
})

/**
 * Action atom to set sidebar state
 *
 * @example
 * const setSidebar = useSetAtom(setSidebarAtom)
 * setSidebar(true)
 */
export const setSidebarAtom = atom(null, (_get, set, isOpen: boolean) => {
  set(sidebarOpenAtom, isOpen)
})

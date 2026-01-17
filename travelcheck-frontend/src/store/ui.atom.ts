import type { ToastType } from '@/types/components.types'
import { atom } from 'jotai'
import type { ReactNode } from 'react'

export const loadingAtom = atom<boolean>(false)

export interface ToastState {
  type: ToastType
  message: string
  id: string
  duration?: number
}

export const toastAtom = atom<ToastState | null>(null)

export interface ModalState {
  isOpen: boolean
  content: ReactNode | null
  title?: string
  showClose?: boolean
  onClose?: () => void
}

export const modalAtom = atom<ModalState>({
  isOpen: false,
  content: null,
  showClose: true,
})

export const setLoadingAtom = atom(null, (_get, set, loading: boolean) => {
  set(loadingAtom, loading)
})

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

export const hideToastAtom = atom(null, (_get, set) => {
  set(toastAtom, null)
})

export const openModalAtom = atom(null, (_get, set, modal: Omit<ModalState, 'isOpen'>) => {
  set(modalAtom, {
    ...modal,
    isOpen: true,
  })
})

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

export const showSuccessToastAtom = atom(null, (_get, set, message: string) => {
  set(showToastAtom, { type: 'success', message })
})

export const showErrorToastAtom = atom(null, (_get, set, message: string) => {
  set(showToastAtom, { type: 'error', message })
})

export const showWarningToastAtom = atom(null, (_get, set, message: string) => {
  set(showToastAtom, { type: 'warning', message })
})

export const showInfoToastAtom = atom(null, (_get, set, message: string) => {
  set(showToastAtom, { type: 'info', message })
})

export const sidebarOpenAtom = atom<boolean>(false)

export const toggleSidebarAtom = atom(null, (get, set) => {
  const isOpen = get(sidebarOpenAtom)
  set(sidebarOpenAtom, !isOpen)
})

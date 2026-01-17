/**
 * @file 组件通用类型定义
 * @description 定义组件中使用的通用类型和Props类型
 */

import type { ReactNode } from 'react'

/**
 * 按钮变体
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

/**
 * 尺寸
 */
export type Size = 'sm' | 'md' | 'lg'

/**
 * Toast类型
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * 打卡状态
 */
export type CheckinStatus =
  | 'checked'
  | 'missed'
  | 'makeup'
  | 'attraction'
  | 'makeup-available'
  | null

/**
 * 基础Props接口
 */
export interface BaseProps {
  /** 自定义类名 */
  className?: string
  /** 子元素 */
  children?: ReactNode
}

/**
 * 带ID的Props接口
 */
export interface WithId {
  /** ID */
  id: string
}

/**
 * 可点击的Props接口
 */
export interface Clickable {
  /** 点击事件 */
  onClick?: () => void
}

/**
 * 可禁用的Props接口
 */
export interface Disableable {
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 加载状态Props接口
 */
export interface Loadable {
  /** 是否加载中 */
  loading?: boolean
}

/**
 * 路由参数
 */
export interface RouteParams {
  /** 参数键值对 */
  [key: string]: string | undefined
}

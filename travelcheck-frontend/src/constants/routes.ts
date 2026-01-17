/**
 * Route Path Constants
 */

export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Authenticated Routes
  DASHBOARD: '/dashboard',

  // Stake Management
  STAKES: '/stakes',
  STAKE_CREATE: '/stakes/create',
  STAKE_DETAIL: '/stakes/:id',

  // Check-in
  CHECKIN: '/checkin',
  CHECKIN_HISTORY: '/checkin/history',

  // Financial
  WALLET: '/wallet',
  TRANSACTIONS: '/transactions',
  WITHDRAW: '/withdraw',

  // Lottery
  LOTTERY: '/lottery',
  LOTTERY_HISTORY: '/lottery/history',

  // User Profile
  PROFILE: '/profile',
  SETTINGS: '/settings',

  // Help & Support
  HELP: '/help',
  FAQ: '/faq',
  TERMS: '/terms',
  PRIVACY: '/privacy',

  // Error Pages
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/401',
  SERVER_ERROR: '/500',
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = (typeof ROUTES)[RouteKey]

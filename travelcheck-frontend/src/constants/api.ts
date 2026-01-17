/**
 * API Path Constants
 */

export const API_PATHS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
  },

  // User
  USER: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
    GET_BALANCE: '/api/users/balance',
  },

  // Stakes
  STAKES: {
    LIST: '/api/stakes',
    CREATE: '/api/stakes',
    DETAIL: '/api/stakes/:id',
    UPDATE: '/api/stakes/:id',
    DELETE: '/api/stakes/:id',
    STATS: '/api/stakes/stats',
  },

  // Check-in
  CHECKIN: {
    CREATE: '/api/checkins',
    LIST: '/api/checkins',
    DETAIL: '/api/checkins/:id',
    MAKEUP: '/api/checkins/makeup',
    STATS: '/api/checkins/stats',
  },

  // Wallet & Transactions
  WALLET: {
    BALANCE: '/api/wallet/balance',
    TRANSACTIONS: '/api/wallet/transactions',
    DEPOSIT: '/api/wallet/deposit',
    WITHDRAW: '/api/wallet/withdraw',
  },

  // Red Packets
  REDPACKET: {
    LIST: '/api/redpackets',
    CLAIM: '/api/redpackets/claim',
    STATS: '/api/redpackets/stats',
  },

  // Lottery
  LOTTERY: {
    DRAW: '/api/lottery/draw',
    HISTORY: '/api/lottery/history',
    PRIZES: '/api/lottery/prizes',
  },

  // Statistics
  STATS: {
    DASHBOARD: '/api/stats/dashboard',
    USER_STATS: '/api/stats/user',
  },
} as const

/**
 * Helper function to replace path parameters
 * @param path - API path with parameters (e.g., '/api/stakes/:id')
 * @param params - Object with parameter values (e.g., { id: '123' })
 * @returns Formatted path (e.g., '/api/stakes/123')
 */
export const formatApiPath = (path: string, params: Record<string, string | number>): string => {
  let formattedPath = path
  for (const [key, value] of Object.entries(params)) {
    formattedPath = formattedPath.replace(`:${key}`, String(value))
  }
  return formattedPath
}

/**
 * @file IndexedDB Service
 * @description Local database service for storing check-in content
 */

const DB_NAME = 'TravelCheckDB'
const DB_VERSION = 1

// Store names
const STORES = {
  CHECKINS: 'checkins',
  STAKES: 'stakes',
} as const

/**
 * Local check-in record (stored in IndexedDB)
 */
export interface LocalCheckin {
  id: string // unique id: `${stakeId}-${checkinIndex}`
  stakeId: string
  checkinIndex: number
  contentHash: string
  content: string
  images: string[] // base64 or blob URLs
  location: {
    lat: number
    lng: number
  } | null
  timestamp: number
  txHash?: string // transaction hash after on-chain
}

/**
 * Local stake record (cached from chain)
 */
export interface LocalStake {
  id: string // stakeId from chain
  amount: string // in wei
  milestone: number
  mode: number // 0 = SEALED, 1 = ANYTIME
  checkedDays: number
  isPerfect: boolean
  accumulatedInterest: string
  status: number // 0 = ACTIVE, 1 = COMPLETED, 2 = WITHDRAWN
  startTime: number
  endTime: number
  completedAt: number
  withdrawnAt: number
  lastUpdated: number
}

/**
 * Open the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create checkins store
      if (!db.objectStoreNames.contains(STORES.CHECKINS)) {
        const checkinsStore = db.createObjectStore(STORES.CHECKINS, { keyPath: 'id' })
        checkinsStore.createIndex('stakeId', 'stakeId', { unique: false })
        checkinsStore.createIndex('timestamp', 'timestamp', { unique: false })
      }

      // Create stakes store
      if (!db.objectStoreNames.contains(STORES.STAKES)) {
        const stakesStore = db.createObjectStore(STORES.STAKES, { keyPath: 'id' })
        stakesStore.createIndex('status', 'status', { unique: false })
      }
    }
  })
}

// ============ Check-in Operations ============

/**
 * Save a check-in record locally
 */
export async function saveCheckin(checkin: LocalCheckin): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CHECKINS], 'readwrite')
    const store = transaction.objectStore(STORES.CHECKINS)
    const request = store.put(checkin)

    request.onerror = () => reject(new Error('Failed to save checkin'))
    request.onsuccess = () => resolve()
  })
}

/**
 * Get a check-in by ID
 */
export async function getCheckin(id: string): Promise<LocalCheckin | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CHECKINS], 'readonly')
    const store = transaction.objectStore(STORES.CHECKINS)
    const request = store.get(id)

    request.onerror = () => reject(new Error('Failed to get checkin'))
    request.onsuccess = () => resolve(request.result || null)
  })
}

/**
 * Get all check-ins for a stake
 */
export async function getCheckinsByStake(stakeId: string): Promise<LocalCheckin[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CHECKINS], 'readonly')
    const store = transaction.objectStore(STORES.CHECKINS)
    const index = store.index('stakeId')
    const request = index.getAll(stakeId)

    request.onerror = () => reject(new Error('Failed to get checkins'))
    request.onsuccess = () => resolve(request.result || [])
  })
}

/**
 * Get all check-ins
 */
export async function getAllCheckins(): Promise<LocalCheckin[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CHECKINS], 'readonly')
    const store = transaction.objectStore(STORES.CHECKINS)
    const request = store.getAll()

    request.onerror = () => reject(new Error('Failed to get all checkins'))
    request.onsuccess = () => resolve(request.result || [])
  })
}

/**
 * Delete a check-in
 */
export async function deleteCheckin(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CHECKINS], 'readwrite')
    const store = transaction.objectStore(STORES.CHECKINS)
    const request = store.delete(id)

    request.onerror = () => reject(new Error('Failed to delete checkin'))
    request.onsuccess = () => resolve()
  })
}

// ============ Stake Operations ============

/**
 * Save a stake record locally (cache)
 */
export async function saveStake(stake: LocalStake): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.STAKES], 'readwrite')
    const store = transaction.objectStore(STORES.STAKES)
    const request = store.put(stake)

    request.onerror = () => reject(new Error('Failed to save stake'))
    request.onsuccess = () => resolve()
  })
}

/**
 * Get a stake by ID
 */
export async function getStake(id: string): Promise<LocalStake | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.STAKES], 'readonly')
    const store = transaction.objectStore(STORES.STAKES)
    const request = store.get(id)

    request.onerror = () => reject(new Error('Failed to get stake'))
    request.onsuccess = () => resolve(request.result || null)
  })
}

/**
 * Get all stakes
 */
export async function getAllStakes(): Promise<LocalStake[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.STAKES], 'readonly')
    const store = transaction.objectStore(STORES.STAKES)
    const request = store.getAll()

    request.onerror = () => reject(new Error('Failed to get all stakes'))
    request.onsuccess = () => resolve(request.result || [])
  })
}

/**
 * Delete a stake
 */
export async function deleteStake(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.STAKES], 'readwrite')
    const store = transaction.objectStore(STORES.STAKES)
    const request = store.delete(id)

    request.onerror = () => reject(new Error('Failed to delete stake'))
    request.onsuccess = () => resolve()
  })
}

/**
 * Clear all data
 */
export async function clearAllData(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CHECKINS, STORES.STAKES], 'readwrite')

    transaction.objectStore(STORES.CHECKINS).clear()
    transaction.objectStore(STORES.STAKES).clear()

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(new Error('Failed to clear data'))
  })
}

// ============ Utility Functions ============

/**
 * Generate check-in ID
 */
export function generateCheckinId(stakeId: string, checkinIndex: number): string {
  return `${stakeId}-${checkinIndex}`
}

/**
 * Calculate content hash (SHA256)
 */
export async function calculateContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return '0x' + hashHex
}

/**
 * Convert image file to base64
 */
export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

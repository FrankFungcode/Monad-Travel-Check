const DB_NAME = 'TravelCheckDB'
const DB_VERSION = 1

const STORES = {
  CHECKINS: 'checkins',
  STAKES: 'stakes',
} as const

export interface LocalCheckin {
  id: string
  stakeId: string
  checkinIndex: number
  contentHash: string
  content: string
  images: string[]
  location: {
    lat: number
    lng: number
  } | null
  timestamp: number
  txHash?: string
}

export interface LocalStake {
  id: string
  amount: string
  milestone: number
  mode: number
  checkedDays: number
  isPerfect: boolean
  accumulatedInterest: string
  status: number
  startTime: number
  endTime: number
  completedAt: number
  withdrawnAt: number
  lastUpdated: number
}

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

      if (!db.objectStoreNames.contains(STORES.CHECKINS)) {
        const checkinsStore = db.createObjectStore(STORES.CHECKINS, { keyPath: 'id' })
        checkinsStore.createIndex('stakeId', 'stakeId', { unique: false })
        checkinsStore.createIndex('timestamp', 'timestamp', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.STAKES)) {
        const stakesStore = db.createObjectStore(STORES.STAKES, { keyPath: 'id' })
        stakesStore.createIndex('status', 'status', { unique: false })
      }
    }
  })
}

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

export function generateCheckinId(stakeId: string, checkinIndex: number): string {
  return `${stakeId}-${checkinIndex}`
}

export async function calculateContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return '0x' + hashHex
}

export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

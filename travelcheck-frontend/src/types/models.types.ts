export interface User {
  id: string
  walletAddress: string
  nickname: string | null
  avatar: string | null
  totalCheckins: number
  currentStreak: number
  maxStreak: number
  lotteryChances: number
  badges: string[]
  createdAt: Date
}

export type StakeMode = 'sealed' | 'anytime'

export type StakeStatus = 'active' | 'completed' | 'withdrawn'

export interface Stake {
  id: string
  userId: string
  type: 'daily' | 'attraction'
  amount: number
  milestone: 10 | 20 | 30 | 50
  mode: StakeMode
  checkedDays: number
  isPerfect: boolean
  accumulatedInterest: number
  status: StakeStatus
  startDate: Date
  endDate: Date
  completedAt: Date | null
  withdrawnAt: Date | null
  createdAt: Date
}

export interface Checkin {
  id: string
  stakeId: string
  userId: string
  type: 'daily' | 'attraction' | 'makeup'
  content: string
  images: string[]
  location: {
    lat: number
    lng: number
  } | null
  date: string
  createdAt: Date
}

export interface AttractionTask {
  id: string
  name: string
  description: string
  location: {
    name: string
    address: string
    lat: number
    lng: number
    radius: number
  }
  coverImage: string
  overviewImage: string
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  rewardApy: number
  minStake: number
  startDate: Date
  endDate: Date
  status: 'upcoming' | 'active' | 'expiring' | 'completed'
  rewardAmount?: string
  totalSlots: number
  claimedSlots: number
  createdAt: Date
}

export interface Reward {
  id: string
  userId: string
  stakeId: string
  type: 'redpacket' | 'lottery' | 'badge'
  amount: number | null
  badgeId: string | null
  expireAt: Date | null
  claimed: boolean
  claimedAt: Date | null
  createdAt: Date
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  requirement: string
  createdAt: Date
}

export interface LotteryPrize {
  id: string
  name: string
  type: 'token' | 'physical'
  amount: number | null
  probability: number
  image: string | null
  createdAt: Date
}

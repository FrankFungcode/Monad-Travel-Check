import type {
  AttractionTask,
  Badge,
  Checkin,
  LotteryPrize,
  Reward,
  Stake,
  User,
} from './models.types'

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T | null
  timestamp: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginationResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface GetNonceRequest {
  walletAddress: string
}

export interface GetNonceResponse {
  nonce: string
}

export interface VerifySignatureRequest {
  walletAddress: string
  signature: string
  nonce: string
}

export interface VerifySignatureResponse {
  token: string
  user: User
}

export interface CreateStakeRequest {
  type: 'daily' | 'attraction'
  amount: number
  milestone: 10 | 20 | 30 | 50
  mode: 'sealed' | 'anytime'
  taskId?: string
}

export type CreateStakeResponse = Stake

export type GetStakesResponse = Stake[]

export interface SwitchMilestoneRequest {
  milestone: 10 | 20 | 30 | 50
}

export interface WithdrawStakeResponse {
  amount: number
  stake: Stake
}

export interface SubmitCheckinRequest {
  stakeId: string
  content: string
  images: string[]
  location?: {
    lat: number
    lng: number
  }
}

export interface SubmitCheckinResponse {
  checkin: Checkin
  reward?: Reward
}

export interface SubmitMakeupRequest {
  stakeId: string
  date: string
  content: string
  images: string[]
}

export type SubmitMakeupResponse = Checkin

export interface GetCalendarResponse {
  year: number
  month: number
  checkins: Record<
    string,
    {
      status: 'checked' | 'missed' | 'makeup' | 'attraction'
      canMakeup: boolean
    }
  >
}

export interface GetAttractionsRequest extends PaginationParams {
  difficulty?: 'easy' | 'medium' | 'hard'
  status?: 'upcoming' | 'active' | 'expiring'
}

export type GetAttractionsResponse = PaginationResponse<AttractionTask>

export type GetAttractionDetailResponse = AttractionTask

export interface JoinAttractionRequest {
  amount: number
  milestone: 10 | 20 | 30 | 50
  mode: 'sealed' | 'anytime'
}

export type JoinAttractionResponse = Stake

export interface ClaimRedPacketResponse {
  amount: number
  reward: Reward
}

export interface GetLotteryChancesResponse {
  chances: number
}

export interface SpinLotteryResponse {
  prize: LotteryPrize
  reward: Reward
}

export interface GetBadgesResponse {
  owned: Badge[]
  available: Badge[]
}

export interface UploadImageResponse {
  url: string
}

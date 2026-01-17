/**
 * @file API请求/响应类型定义
 * @description 定义所有API接口的请求参数和响应数据类型
 */

import type {
  AttractionTask,
  Badge,
  Checkin,
  LotteryPrize,
  Reward,
  Stake,
  User,
} from './models.types'

/**
 * 统一API响应格式
 */
export interface ApiResponse<T = unknown> {
  /** 状态码 */
  code: number
  /** 消息 */
  message: string
  /** 数据 */
  data: T | null
  /** 时间戳 */
  timestamp: string
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  /** 页码（从1开始） */
  page?: number
  /** 每页数量 */
  pageSize?: number
}

/**
 * 分页响应数据
 */
export interface PaginationResponse<T> {
  /** 数据列表 */
  items: T[]
  /** 总数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 总页数 */
  totalPages: number
}

// ==================== 认证相关 ====================

/**
 * 获取Nonce请求
 */
export interface GetNonceRequest {
  /** 钱包地址 */
  walletAddress: string
}

/**
 * 获取Nonce响应
 */
export interface GetNonceResponse {
  /** 随机字符串 */
  nonce: string
}

/**
 * 验证签名请求
 */
export interface VerifySignatureRequest {
  /** 钱包地址 */
  walletAddress: string
  /** 签名 */
  signature: string
  /** Nonce */
  nonce: string
}

/**
 * 验证签名响应
 */
export interface VerifySignatureResponse {
  /** JWT Token */
  token: string
  /** 用户信息 */
  user: User
}

// ==================== 质押相关 ====================

/**
 * 创建质押请求
 */
export interface CreateStakeRequest {
  /** 质押类型 */
  type: 'daily' | 'attraction'
  /** 质押金额 */
  amount: number
  /** 里程碑天数 */
  milestone: 10 | 20 | 30 | 50
  /** 锁定方式 */
  mode: 'sealed' | 'anytime'
  /** 景点任务ID（仅景点任务） */
  taskId?: string
}

/**
 * 创建质押响应
 */
export type CreateStakeResponse = Stake

/**
 * 获取质押列表响应
 */
export type GetStakesResponse = Stake[]

/**
 * 切换里程碑请求
 */
export interface SwitchMilestoneRequest {
  /** 新的里程碑天数 */
  milestone: 10 | 20 | 30 | 50
}

/**
 * 取回本金响应
 */
export interface WithdrawStakeResponse {
  /** 取回金额（本金+利息） */
  amount: number
  /** 更新后的质押记录 */
  stake: Stake
}

// ==================== 打卡相关 ====================

/**
 * 提交打卡请求
 */
export interface SubmitCheckinRequest {
  /** 质押ID */
  stakeId: string
  /** 打卡内容 */
  content: string
  /** 图片URL列表 */
  images: string[]
  /** GPS位置（景点任务必需） */
  location?: {
    lat: number
    lng: number
  }
}

/**
 * 提交打卡响应
 */
export interface SubmitCheckinResponse {
  /** 打卡记录 */
  checkin: Checkin
  /** 红包奖励（如果有） */
  reward?: Reward
}

/**
 * 提交补卡请求
 */
export interface SubmitMakeupRequest {
  /** 质押ID */
  stakeId: string
  /** 补卡日期 */
  date: string
  /** 打卡内容 */
  content: string
  /** 图片URL列表 */
  images: string[]
}

/**
 * 提交补卡响应
 */
export type SubmitMakeupResponse = Checkin

/**
 * 获取日历数据响应
 */
export interface GetCalendarResponse {
  /** 年份 */
  year: number
  /** 月份 */
  month: number
  /** 打卡状态映射（日期 -> 状态） */
  checkins: Record<
    string,
    {
      status: 'checked' | 'missed' | 'makeup' | 'attraction'
      canMakeup: boolean
    }
  >
}

// ==================== 景点任务相关 ====================

/**
 * 获取景点任务列表请求
 */
export interface GetAttractionsRequest extends PaginationParams {
  /** 难度筛选 */
  difficulty?: 'easy' | 'medium' | 'hard'
  /** 状态筛选 */
  status?: 'upcoming' | 'active' | 'expiring'
}

/**
 * 获取景点任务列表响应
 */
export type GetAttractionsResponse = PaginationResponse<AttractionTask>

/**
 * 获取景点任务详情响应
 */
export type GetAttractionDetailResponse = AttractionTask

/**
 * 参与景点任务请求
 */
export interface JoinAttractionRequest {
  /** 质押金额 */
  amount: number
  /** 里程碑天数 */
  milestone: 10 | 20 | 30 | 50
  /** 锁定方式 */
  mode: 'sealed' | 'anytime'
}

/**
 * 参与景点任务响应
 */
export type JoinAttractionResponse = Stake

// ==================== 奖励相关 ====================

/**
 * 领取红包响应
 */
export interface ClaimRedPacketResponse {
  /** 领取金额 */
  amount: number
  /** 更新后的奖励记录 */
  reward: Reward
}

/**
 * 获取抽奖次数响应
 */
export interface GetLotteryChancesResponse {
  /** 剩余次数 */
  chances: number
}

/**
 * 执行抽奖响应
 */
export interface SpinLotteryResponse {
  /** 中奖奖品 */
  prize: LotteryPrize
  /** 奖励记录 */
  reward: Reward
}

/**
 * 获取徽章列表响应
 */
export interface GetBadgesResponse {
  /** 已拥有的徽章 */
  owned: Badge[]
  /** 未拥有的徽章 */
  available: Badge[]
}

// ==================== 文件上传相关 ====================

/**
 * 上传图片响应
 */
export interface UploadImageResponse {
  /** 图片URL */
  url: string
}

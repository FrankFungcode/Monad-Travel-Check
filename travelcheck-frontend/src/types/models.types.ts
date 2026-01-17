/**
 * @file 业务实体类型定义
 * @description 定义所有业务数据模型的TypeScript类型
 */

/**
 * 用户模型
 */
export interface User {
  /** 用户ID */
  id: string
  /** 钱包地址 */
  walletAddress: string
  /** 昵称 */
  nickname: string | null
  /** 头像URL */
  avatar: string | null
  /** 总打卡次数 */
  totalCheckins: number
  /** 当前连续打卡天数 */
  currentStreak: number
  /** 最大连续打卡天数 */
  maxStreak: number
  /** 抽奖机会次数 */
  lotteryChances: number
  /** 拥有的徽章ID列表 */
  badges: string[]
  /** 创建时间 */
  createdAt: Date
}

/**
 * 质押模式
 */
export type StakeMode = 'sealed' | 'anytime'

/**
 * 质押状态
 */
export type StakeStatus = 'active' | 'completed' | 'withdrawn'

/**
 * 质押记录模型
 */
export interface Stake {
  /** 质押ID */
  id: string
  /** 用户ID */
  userId: string
  /** 质押类型（daily=每日任务, attraction=景点任务） */
  type: 'daily' | 'attraction'
  /** 质押金额（MON代币数量） */
  amount: number
  /** 里程碑（景点数） */
  milestone: 10 | 20 | 30 | 50
  /** 锁定方式 */
  mode: StakeMode
  /** 已打卡天数 */
  checkedDays: number
  /** 是否完美完成（无断卡或已补卡） */
  isPerfect: boolean
  /** 累计利息 */
  accumulatedInterest: number
  /** 状态 */
  status: StakeStatus
  /** 开始日期 */
  startDate: Date
  /** 预计结束日期 */
  endDate: Date
  /** 实际结束日期 */
  completedAt: Date | null
  /** 取回时间 */
  withdrawnAt: Date | null
  /** 创建时间 */
  createdAt: Date
}

/**
 * 打卡记录模型
 */
export interface Checkin {
  /** 打卡ID */
  id: string
  /** 质押ID */
  stakeId: string
  /** 用户ID */
  userId: string
  /** 打卡类型（daily=每日, attraction=景点, makeup=补卡） */
  type: 'daily' | 'attraction' | 'makeup'
  /** 打卡内容 */
  content: string
  /** 图片URL列表 */
  images: string[]
  /** GPS位置信息 */
  location: {
    /** 纬度 */
    lat: number
    /** 经度 */
    lng: number
  } | null
  /** 打卡日期 */
  date: string
  /** 创建时间 */
  createdAt: Date
}

/**
 * 景点任务模型
 */
export interface AttractionTask {
  /** 任务ID */
  id: string
  /** 任务名称 */
  name: string
  /** 任务描述 */
  description: string
  /** 景点位置信息 */
  location: {
    /** 地点名称 */
    name: string
    /** 详细地址 */
    address: string
    /** 纬度 */
    lat: number
    /** 经度 */
    lng: number
    /** 半径（米）- 有效打卡范围 */
    radius: number
  }
  /** 封面图片URL */
  coverImage: string
  /** 任务概览图片 */
  overviewImage: string
  /** 任务时长（天） */
  duration: number
  /** 难度 */
  difficulty: 'easy' | 'medium' | 'hard'
  /** 奖励APY（年化收益率） */
  rewardApy: number
  /** 最低质押金额 */
  minStake: number
  /** 任务开始时间 */
  startDate: Date
  /** 任务结束时间 */
  endDate: Date
  /** 任务状态 */
  status: 'upcoming' | 'active' | 'expiring' | 'completed'
  /** 奖励金额 (MON) */
  rewardAmount?: string
  /** 总名额 */
  totalSlots: number
  /** 已领名额 */
  claimedSlots: number
  /** 创建时间 */
  createdAt: Date
}

/**
 * 奖励记录模型
 */
export interface Reward {
  /** 奖励ID */
  id: string
  /** 用户ID */
  userId: string
  /** 质押ID */
  stakeId: string
  /** 奖励类型 */
  type: 'redpacket' | 'lottery' | 'badge'
  /** 奖励金额（MON代币，仅红包和抽奖） */
  amount: number | null
  /** 徽章ID（仅徽章奖励） */
  badgeId: string | null
  /** 过期时间（仅红包） */
  expireAt: Date | null
  /** 是否已领取 */
  claimed: boolean
  /** 领取时间 */
  claimedAt: Date | null
  /** 创建时间 */
  createdAt: Date
}

/**
 * 徽章模型
 */
export interface Badge {
  /** 徽章ID */
  id: string
  /** 徽章名称 */
  name: string
  /** 徽章描述 */
  description: string
  /** 徽章图标URL */
  icon: string
  /** 获取条件 */
  requirement: string
  /** 创建时间 */
  createdAt: Date
}

/**
 * 抽奖奖品模型
 */
export interface LotteryPrize {
  /** 奖品ID */
  id: string
  /** 奖品名称 */
  name: string
  /** 奖品类型 */
  type: 'token' | 'physical'
  /** 奖品金额（MON代币，仅虚拟奖品） */
  amount: number | null
  /** 中奖概率 */
  probability: number
  /** 奖品图片URL */
  image: string | null
  /** 创建时间 */
  createdAt: Date
}

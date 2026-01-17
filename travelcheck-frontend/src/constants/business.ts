/**
 * Business Constants
 * These constants define the core business rules and configurations
 */

// Stake Amount Limits (in MON)
export const MIN_STAKE_AMOUNT = 0.0001;
export const MAX_STAKE_AMOUNT = 1000;

// Check-in Milestones (in days) - must match contract
export const MILESTONES = [10, 20, 30, 50] as const;
export type Milestone = (typeof MILESTONES)[number];

// Interest Rates for Sealed Stakes (Principal locked until completion)
// Rates are in basis points (500 = 5%)
export const INTEREST_RATES_SEALED: Record<Milestone, number> = {
  10: 0.05, // 5% for 10 days
  20: 0.08, // 8% for 20 days
  30: 0.14, // 14% for 30 days
  50: 0.2 // 20% for 50 days
};

// Interest Rates for Anytime Withdrawal Stakes (50% of sealed)
export const INTEREST_RATES_ANYTIME: Record<Milestone, number> = {
  10: 0.025, // 2.5% for 10 days
  20: 0.04, // 4% for 20 days
  30: 0.07, // 7% for 30 days
  50: 0.1 // 10% for 50 days
};

// Red Packet Rates (percentage of stake amount)
export const REDPACKET_RATE_SEALED = {
  min: 0.001, // 0.1% minimum
  max: 0.003 // 0.3% maximum
} as const;

export const REDPACKET_RATE_ANYTIME = {
  min: 0.0003, // 0.03% minimum
  max: 0.0006 // 0.06% maximum
} as const;

// Make-up Check-in Rules
export const MAX_MAKEUP_CHANCES = 3;
export const MAKEUP_DEADLINE_DAYS = 3;

// Lottery Configuration
export interface LotteryPrize {
  id: string;
  name: string;
  value: number;
  probability: number;
  type: "cash" | "voucher" | "physical";
  description?: string;
}

export const LOTTERY_PRIZES: LotteryPrize[] = [
  {
    id: "grand_prize",
    name: "Grand Prize",
    value: 1000,
    probability: 0.001,
    type: "cash",
    description: "$1000 cash prize"
  },
  {
    id: "first_prize",
    name: "First Prize",
    value: 500,
    probability: 0.005,
    type: "cash",
    description: "$500 cash prize"
  },
  {
    id: "second_prize",
    name: "Second Prize",
    value: 100,
    probability: 0.01,
    type: "cash",
    description: "$100 cash prize"
  },
  {
    id: "third_prize",
    name: "Third Prize",
    value: 50,
    probability: 0.05,
    type: "cash",
    description: "$50 cash prize"
  },
  {
    id: "fourth_prize",
    name: "Fourth Prize",
    value: 20,
    probability: 0.1,
    type: "voucher",
    description: "$20 voucher"
  },
  {
    id: "fifth_prize",
    name: "Fifth Prize",
    value: 10,
    probability: 0.2,
    type: "voucher",
    description: "$10 voucher"
  },
  {
    id: "consolation",
    name: "Consolation Prize",
    value: 1,
    probability: 0.634,
    type: "voucher",
    description: "$1 voucher"
  }
];

// Stake Types
export enum StakeType {
  SEALED = "sealed",
  ANYTIME = "anytime"
}

// Stake Status
export enum StakeStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  FAILED = "failed",
  WITHDRAWN = "withdrawn"
}

// Transaction Types
export enum TransactionType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  STAKE = "stake",
  UNSTAKE = "unstake",
  INTEREST = "interest",
  REDPACKET = "redpacket",
  LOTTERY = "lottery",
  REFUND = "refund"
}

// Check-in Status
export enum CheckinStatus {
  COMPLETED = "completed",
  MISSED = "missed",
  MADE_UP = "made_up"
}

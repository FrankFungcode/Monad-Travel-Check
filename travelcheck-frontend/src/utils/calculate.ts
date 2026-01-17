/**
 * @file Calculation Utility Functions
 * @description Functions for calculating interest, red packets, and daily rewards
 */

import {
  INTEREST_RATES_ANYTIME,
  INTEREST_RATES_SEALED,
  type Milestone,
  REDPACKET_RATE_ANYTIME,
  REDPACKET_RATE_SEALED
} from "@/constants/business";
import type { StakeMode } from "@/types/models.types";

/**
 * Calculate total interest earned for a stake
 *
 * @param amount - Stake amount
 * @param milestone - Target milestone (10, 20, 30, or 50 days)
 * @param mode - Stake mode ('sealed' or 'anytime')
 * @param days - Number of days completed
 * @param isPerfect - Whether the stake is perfect (no missed check-ins)
 * @returns Total interest earned
 *
 * @example
 * calculateInterest(100, 10, 'sealed', 10, true)
 * // Returns: 5.0 (100 * 0.05)
 *
 * @example
 * calculateInterest(100, 20, 'anytime', 10, true)
 * // Returns: 2.0 (100 * 0.04 * 0.5)
 *
 * @example
 * calculateInterest(100, 50, 'sealed', 50, false)
 * // Returns: 0 (not perfect, no interest for sealed stakes)
 */
export function calculateInterest(
  amount: number,
  milestone: Milestone,
  mode: StakeMode,
  days: number,
  isPerfect: boolean
): number {
  if (amount <= 0 || days <= 0) {
    return 0;
  }

  // Get interest rate based on mode
  const interestRate =
    mode === "sealed"
      ? INTEREST_RATES_SEALED[milestone]
      : INTEREST_RATES_ANYTIME[milestone];

  // Calculate base interest
  let interest = amount * interestRate;

  // For anytime mode, prorate interest based on days completed
  if (mode === "anytime") {
    const progress = Math.min(days / milestone, 1);
    interest *= progress;
  }

  // For sealed mode, only get full interest if perfect completion
  if (mode === "sealed" && !isPerfect) {
    return 0;
  }

  return interest;
}

/**
 * Calculate red packet amount for a check-in
 *
 * @param amount - Stake amount
 * @param mode - Stake mode ('sealed' or 'anytime')
 * @returns Random red packet amount
 *
 * @example
 * calculateRedPacket(100, 'sealed')
 * // Returns: random value between 0.1 and 0.3 (0.1% to 0.3% of stake)
 *
 * @example
 * calculateRedPacket(1000, 'anytime')
 * // Returns: random value between 0.3 and 0.6 (0.03% to 0.06% of stake)
 */
export function calculateRedPacket(amount: number, mode: StakeMode): number {
  if (amount <= 0) {
    return 0;
  }

  const rate =
    mode === "sealed" ? REDPACKET_RATE_SEALED : REDPACKET_RATE_ANYTIME;

  // Generate random amount within the rate range
  const randomRate = rate.min + Math.random() * (rate.max - rate.min);
  return amount * randomRate;
}

/**
 * Calculate daily interest rate for a stake
 *
 * @param amount - Stake amount
 * @param milestone - Target milestone
 * @param mode - Stake mode
 * @returns Daily interest amount
 *
 * @example
 * calculateDailyInterest(100, 30, 'sealed')
 * // Returns: 0.1667 (100 * 0.05 / 30)
 *
 * @example
 * calculateDailyInterest(100, 50, 'anytime')
 * // Returns: 0.0274 (100 * 0.1 / 50)
 */
export function calculateDailyInterest(
  amount: number,
  milestone: Milestone,
  mode: StakeMode
): number {
  if (amount <= 0) {
    return 0;
  }

  const interestRate =
    mode === "sealed"
      ? INTEREST_RATES_SEALED[milestone]
      : INTEREST_RATES_ANYTIME[milestone];

  return (amount * interestRate) / milestone;
}

/**
 * Calculate total return (principal + interest)
 *
 * @param amount - Original stake amount
 * @param interest - Accumulated interest
 * @returns Total return amount
 *
 * @example
 * calculateTotalReturn(100, 5)
 * // Returns: 105
 */
export function calculateTotalReturn(amount: number, interest: number): number {
  return amount + interest;
}

/**
 * Calculate APY (Annual Percentage Yield) for a stake
 *
 * @param milestone - Target milestone in days
 * @param mode - Stake mode
 * @returns APY as decimal (e.g., 0.05 for 5%)
 *
 * @example
 * calculateAPY(30, 'sealed')
 * // Returns: 0.6083 (60.83% APY)
 *
 * @example
 * calculateAPY(50, 'anytime')
 * // Returns: 0.1 (10% APY)
 */
export function calculateAPY(milestone: Milestone, mode: StakeMode): number {
  const interestRate =
    mode === "sealed"
      ? INTEREST_RATES_SEALED[milestone]
      : INTEREST_RATES_ANYTIME[milestone];

  // Convert to annual rate
  const annualRate = (interestRate / milestone) * 50;

  return annualRate;
}

/**
 * Calculate progress percentage
 *
 * @param current - Current value
 * @param target - Target value
 * @returns Progress percentage (0-100)
 *
 * @example
 * calculateProgress(25, 100)
 * // Returns: 25
 *
 * @example
 * calculateProgress(150, 100)
 * // Returns: 100 (capped at 100%)
 */
export function calculateProgress(current: number, target: number): number {
  if (target <= 0) {
    return 0;
  }

  const progress = (current / target) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

/**
 * Calculate estimated completion date
 *
 * @param startDate - Start date
 * @param milestone - Target milestone in days
 * @returns Estimated completion date
 *
 * @example
 * calculateCompletionDate(new Date('2024-01-01'), 30)
 * // Returns: Date('2024-01-31')
 */
export function calculateCompletionDate(
  startDate: Date,
  milestone: number
): Date {
  const completionDate = new Date(startDate);
  completionDate.setDate(completionDate.getDate() + milestone);
  return completionDate;
}

/**
 * Calculate days remaining until target date
 *
 * @param targetDate - Target date
 * @returns Days remaining (0 if past target)
 *
 * @example
 * calculateDaysRemaining(new Date('2024-12-31'))
 * // Returns: number of days until Dec 31, 2024
 */
export function calculateDaysRemaining(targetDate: Date): number {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Math.max(days, 0);
}

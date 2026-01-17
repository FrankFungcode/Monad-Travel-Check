/**
 * @file StakeCard Component
 * @description Card component displaying stake information and actions
 */

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import type { Stake } from "@/types/models.types";
import { formatAmount } from "@/utils/format";
import { clsx } from "clsx";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * StakeCard component props
 */
export interface StakeCardProps {
  /** Stake data */
  stake: Stake;
  /** Custom class name */
  className?: string;
  /** Checkin button click handler */
  onCheckin?: (stake: Stake) => void;
  /** Withdraw button click handler */
  onWithdraw?: (stake: Stake) => void;
  /** View details handler */
  onViewDetails?: (stake: Stake) => void;
}

/**
 * StakeCard Component
 *
 * @example
 * <StakeCard
 *   stake={myStake}
 *   onCheckin={(stake) => console.log('Checkin', stake.id)}
 *   onWithdraw={(stake) => console.log('Withdraw', stake.id)}
 * />
 */
export function StakeCard({
  stake,
  className,
  onCheckin,
  onWithdraw,
  onViewDetails
}: StakeCardProps) {
  const { t } = useTranslation();

  /**
   * Calculate progress percentage
   */
  const progress = useMemo(() => {
    return Math.min((stake.checkedDays / stake.milestone) * 100, 100);
  }, [stake.checkedDays, stake.milestone]);

  /**
   * Get status badge variant
   */
  const statusVariant = useMemo(() => {
    switch (stake.status) {
      case "active":
        return "success";
      case "completed":
        return "info";
      case "withdrawn":
        return "default";
      default:
        return "default";
    }
  }, [stake.status]);

  /**
   * Get status label
   */
  const statusLabel = useMemo(() => {
    switch (stake.status) {
      case "active":
        return t('stakeCard.active');
      case "completed":
        return t('stakeCard.completed');
      case "withdrawn":
        return t('stakeCard.withdrawn');
      default:
        return stake.status;
    }
  }, [stake.status, t]);

  /**
   * Get type badge variant and label
   */
  const typeInfo = useMemo(() => {
    if (stake.type === "daily") {
      return { variant: "primary" as const, label: t('stakeCard.dailyTask') };
    }
    return { variant: "warning" as const, label: t('stakeCard.attractionTask') };
  }, [stake.type, t]);

  /**
   * Get mode label
   */
  const modeLabel = useMemo(() => {
    return stake.mode === "sealed" ? t('stakeCard.sealed') : t('stakeCard.anytime');
  }, [stake.mode, t]);

  /**
   * Check if can checkin today
   */
  const canCheckinToday = useMemo(() => {
    return stake.status === "active";
  }, [stake.status]);

  /**
   * Check if can withdraw
   */
  const canWithdraw = useMemo(() => {
    return (
      stake.status === "completed" ||
      (stake.status === "active" && stake.mode === "anytime")
    );
  }, [stake.status, stake.mode]);

  return (
    <Card className={clsx("hover:border-primary transition-colors", className)}>
      <Card.Header>
        {/* Title and badges */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
              <Badge variant="outline">{modeLabel}</Badge>
            </div>
            <h3 className="text-lg font-semibold text-white">
              {formatAmount(stake.amount)} MON
            </h3>
            <p className="text-sm text-text-muted">
              {stake.milestone} {t('stakeCard.countsMilestone')}
            </p>
          </div>

          {/* Perfect indicator */}
          {stake.isPerfect && stake.status === "active" && (
            <div className="flex items-center gap-1 text-primary">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-medium">{t('stakeCard.perfect')}</span>
            </div>
          )}
        </div>
      </Card.Header>

      <Card.Body>
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">{t('stakeCard.progress')}</span>
            <span className="text-sm font-medium text-white">
              {stake.checkedDays} / {stake.milestone} {t('stakeCard.counts')}
            </span>
          </div>
          <div className="w-full h-2 bg-background-dark rounded-full overflow-hidden">
            <div
              className={clsx(
                "h-full transition-all duration-500",
                stake.isPerfect ? "bg-primary" : "bg-yellow-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-text-muted text-right">
            {progress.toFixed(1)}%
          </div>
        </div>

        {/* Interest information */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-background-dark rounded-lg">
          <div>
            <p className="text-xs text-text-muted mb-1">{t('stakeCard.accumulatedInterest')}</p>
            <p className="text-sm font-semibold text-primary">
              {formatAmount(stake.accumulatedInterest)} MON
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">{t('stakeCard.totalReturn')}</p>
            <p className="text-sm font-semibold text-white">
              {formatAmount(stake.amount + stake.accumulatedInterest)} MON
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="mt-4 space-y-1 text-xs text-text-muted">
          <div className="flex justify-between">
            <span>{t('stakeCard.startDate')}:</span>
            <span>{new Date(stake.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('stakeCard.expectedEnd')}:</span>
            <span>{new Date(stake.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </Card.Body>

      <Card.Footer>
        <div className="flex gap-2">
          {/* Checkin button */}
          {canCheckinToday && onCheckin && (
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => onCheckin(stake)}
            >
              {t('common.checkInToday')}
            </Button>
          )}

          {/* Withdraw button */}
          {canWithdraw && onWithdraw && (
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => onWithdraw(stake)}
            >
              {t('common.withdraw')}
            </Button>
          )}

          {/* View details button */}
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => onViewDetails(stake)}
            >
              {t('common.viewDetails')}
            </Button>
          )}
        </div>
      </Card.Footer>
    </Card>
  );
}

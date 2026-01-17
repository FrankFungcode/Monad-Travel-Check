/**
 * @file TaskCard Component
 * @description Card component for displaying attraction task information
 */

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import type { AttractionTask } from "@/types/models.types";
import { formatAmount } from "@/utils/format";
import { clsx } from "clsx";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * TaskCard component props
 */
export interface TaskCardProps {
  /** Task data */
  task: AttractionTask;
  /** Custom class name */
  className?: string;
  /** Join button click handler (or primary action) */
  onJoin?: (task: AttractionTask) => void;
  /** Custom label for the primary action button */
  actionLabel?: string;
  /** View details handler */
  onViewDetails?: (task: AttractionTask) => void;
}

/**
 * TaskCard Component
 *
 * @example
 * <TaskCard
 *   task={myTask}
 *   onJoin={(task) => console.log('Join', task.id)}
 *   actionLabel="Check In"
 * />
 */
export function TaskCard({
  task,
  className,
  onJoin,
  actionLabel,
  onViewDetails
}: TaskCardProps) {
  const { t } = useTranslation();

  /**
   * Get difficulty badge variant
   */
  const difficultyVariant = useMemo(() => {
    switch (task.difficulty) {
      case "easy":
        return "success";
      case "medium":
        return "warning";
      case "hard":
        return "danger";
      default:
        return "default";
    }
  }, [task.difficulty]);

  /**
   * Get status badge variant
   */
  const statusVariant = useMemo(() => {
    switch (task.status) {
      case "upcoming":
        return "info";
      case "active":
        return "success";
      case "expiring":
        return "warning";
      case "completed":
        return "default";
      default:
        return "default";
    }
  }, [task.status]);

  /**
   * Get status label
   */
  const statusLabel = useMemo(() => {
    switch (task.status) {
      case "upcoming":
        return t("taskCard.upcoming");
      case "active":
        return t("taskCard.active");
      case "expiring":
        return t("taskCard.expiringSoon");
      case "completed":
        return t("taskCard.completed");
      default:
        return task.status;
    }
  }, [task.status, t]);

  /**
   * Format difficulty
   */
  const difficultyLabel = useMemo(() => {
    switch (task.difficulty) {
      case "easy":
        return t("taskCard.easy");
      case "medium":
        return t("taskCard.medium");
      case "hard":
        return t("taskCard.hard");
      default:
        return task.difficulty;
    }
  }, [task.difficulty, t]);

  /**
   * Check if can join
   */
  const canJoin = useMemo(() => {
    return task.status === "active" || task.status === "upcoming";
  }, [task.status]);

  /**
   * Calculate count remaining
   */
  const countRemaining = useMemo(() => {
    const now = new Date();
    const end = new Date(task.endDate);
    const diff = end.getTime() - now.getTime();
    const count = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, count);
  }, [task.endDate]);

  return (
    <Card className={clsx("hover:border-primary transition-colors", className)}>
      {/* Cover image */}
      <div className="relative h-48 -m-4 mb-4 overflow-hidden rounded-t-lg">
        <img
          src={task.coverImage}
          alt={task.name}
          className="w-full h-full object-cover"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent" />

        {/* Badges overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant={difficultyVariant}>{difficultyLabel}</Badge>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>

        {/* count remaining */}
        {task.status !== "completed" && (
          <div className="absolute bottom-4 right-4 bg-background-dark/80 px-3 py-1 rounded-lg">
            <span className="text-sm text-white font-medium">
              {countRemaining} {t("taskCard.countLeft")}
            </span>
          </div>
        )}
      </div>

      <Card.Header>
        {/* Task name and location */}
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-white mb-1">{task.name}</h3>
          <div className="flex items-center gap-1 text-text-muted text-sm">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{task.location.name}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-text-muted line-clamp-2">
          {task.description}
        </p>
      </Card.Header>

      <Card.Body>
        {/* Task details grid */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-background-dark rounded-lg">
          <div>
            <p className="text-xs text-text-muted mb-1">
              {t("taskCard.duration")}
            </p>
            <p className="text-sm font-semibold text-white">
              {task.duration} {t("taskCard.daysLeft")}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">
              {t("taskCard.rewardApy")}
            </p>
            <p className="text-sm font-semibold text-primary">
              {task.rewardApy}%
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">
              {t("taskCard.minStake")}
            </p>
            <p className="text-sm font-semibold text-white">
              {formatAmount(task.minStake)} MON
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">
              {t("taskCard.difficulty")}
            </p>
            <p className="text-sm font-semibold text-white">
              {difficultyLabel}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="mt-4 space-y-1 text-xs text-text-muted">
          <div className="flex justify-between">
            <span>{t("taskCard.startDate")}:</span>
            <span>{new Date(task.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("taskCard.endDate")}:</span>
            <span>{new Date(task.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </Card.Body>

      <Card.Footer>
        <div className="flex gap-2">
          {/* Join button */}
          {canJoin && onJoin && (
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => onJoin(task)}
            >
              {actionLabel || t("common.joinTask")}
            </Button>
          )}

          {/* View details button */}
          {onViewDetails && (
            <Button
              variant={canJoin ? "outline" : "primary"}
              size="md"
              fullWidth
              onClick={() => onViewDetails(task)}
            >
              {t("common.viewDetails")}
            </Button>
          )}
        </div>
      </Card.Footer>
    </Card>
  );
}

/**
 * @file useCountdown Hook
 * @description Custom hook for countdown timer
 */

import { formatCountdown } from "@/utils/format";
import { useEffect, useState } from "react";

/**
 * Custom hook for countdown timer
 *
 * @param targetDate - Target date for countdown
 * @param onComplete - Optional callback when countdown reaches zero
 * @returns Countdown state
 *
 * @example
 * const { timeLeft, formatted, isComplete } = useCountdown(
 *   new Date('2026-12-31'),
 *   () => console.log('Countdown complete!')
 * )
 *
 * return <div>{formatted}</div>
 * // Displays: "23:59:42"
 */
export function useCountdown(targetDate: Date | null, onComplete?: () => void) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(0);
      setIsComplete(true);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft(0);
        setIsComplete(true);
        if (onComplete) {
          onComplete();
        }
        return 0;
      }

      const seconds = Math.floor(difference / 1000);
      setTimeLeft(seconds);
      setIsComplete(false);
      return seconds;
    };

    // Calculate initial time
    calculateTimeLeft();

    // Update every second
    const interval = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  return {
    /** Total seconds remaining */
    timeLeft,
    /** Formatted countdown string (HH:mm:ss or mm:ss) */
    formatted: formatCountdown(timeLeft),
    /** Whether countdown is complete */
    isComplete,
    /** Individual time units */
    days: Math.floor(timeLeft / 86400),
    hours: Math.floor((timeLeft % 86400) / 3600),
    minutes: Math.floor((timeLeft % 3600) / 60),
    seconds: Math.floor(timeLeft % 60)
  };
}

/**
 * Custom hook for interval-based countdown
 *
 * @param initialSeconds - Starting seconds
 * @param onComplete - Optional callback when countdown reaches zero
 * @returns Countdown state and controls
 *
 * @example
 * const { timeLeft, formatted, start, pause, reset } = useIntervalCountdown(60)
 *
 * // Start countdown
 * start()
 *
 * // Pause countdown
 * pause()
 *
 * // Reset to initial value
 * reset()
 */
export function useIntervalCountdown(
  initialSeconds: number,
  onComplete?: () => void
) {
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsComplete(true);
          if (onComplete) {
            onComplete();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const start = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
      setIsComplete(false);
    }
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setTimeLeft(initialSeconds);
    setIsRunning(false);
    setIsComplete(false);
  };

  const resume = () => {
    if (timeLeft > 0 && !isRunning) {
      setIsRunning(true);
    }
  };

  return {
    /** Total seconds remaining */
    timeLeft,
    /** Formatted countdown string */
    formatted: formatCountdown(timeLeft),
    /** Whether countdown is running */
    isRunning,
    /** Whether countdown is complete */
    isComplete,
    /** Individual time units */
    days: Math.floor(timeLeft / 86400),
    hours: Math.floor((timeLeft % 86400) / 3600),
    minutes: Math.floor((timeLeft % 3600) / 60),
    seconds: Math.floor(timeLeft % 60),
    /** Controls */
    start,
    pause,
    reset,
    resume
  };
}

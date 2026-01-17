/**
 * @file CalendarGrid Component
 * @description Calendar component displaying check-in status for each day
 */

import { Button } from '@/components/common/Button'
import type { CheckinStatus } from '@/types/components.types'
import { clsx } from 'clsx'
import { useMemo, useState } from 'react'

/**
 * Day cell data
 */
export interface DayData {
  /** Day number */
  day: number
  /** Check-in status */
  status: CheckinStatus
  /** Can makeup */
  canMakeup: boolean
  /** Is current month */
  isCurrentMonth: boolean
}

/**
 * CalendarGrid component props
 */
export interface CalendarGridProps {
  /** Calendar year */
  year: number
  /** Calendar month (1-12) */
  month: number
  /** Check-in status data (date string -> status) */
  checkins: Record<
    string,
    {
      status: 'checked' | 'missed' | 'makeup' | 'attraction'
      canMakeup: boolean
    }
  >
  /** Custom class name */
  className?: string
  /** Day click handler */
  onDayClick?: (date: Date, data: DayData) => void
  /** Month change handler */
  onMonthChange?: (year: number, month: number) => void
}

/**
 * CalendarGrid Component
 *
 * @example
 * <CalendarGrid
 *   year={2026}
 *   month={1}
 *   checkins={{
 *     '2026-01-01': { status: 'checked', canMakeup: false },
 *     '2026-01-02': { status: 'missed', canMakeup: true },
 *   }}
 *   onDayClick={(date) => console.log('Clicked', date)}
 * />
 */
export function CalendarGrid({
  year,
  month,
  checkins,
  className,
  onDayClick,
  onMonthChange,
}: CalendarGridProps) {
  const [currentYear, setCurrentYear] = useState(year)
  const [currentMonth, setCurrentMonth] = useState(month)

  /**
   * Week day labels
   */
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  /**
   * Generate calendar days
   */
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1)
    const lastDay = new Date(currentYear, currentMonth, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: DayData[] = []

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthLastDay = new Date(currentYear, currentMonth - 1, 0).getDate()
      const day = prevMonthLastDay - startingDayOfWeek + i + 1
      days.push({
        day,
        status: null,
        canMakeup: false,
        isCurrentMonth: false,
      })
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const checkinData = checkins[dateString]

      let status: CheckinStatus = null
      let canMakeup = false

      if (checkinData) {
        if (checkinData.status === 'checked') {
          status = 'checked'
        } else if (checkinData.status === 'missed') {
          status = checkinData.canMakeup ? 'makeup-available' : 'missed'
          canMakeup = checkinData.canMakeup
        } else if (checkinData.status === 'makeup') {
          status = 'makeup'
        } else if (checkinData.status === 'attraction') {
          status = 'attraction'
        }
      }

      days.push({
        day,
        status,
        canMakeup,
        isCurrentMonth: true,
      })
    }

    // Add empty cells for days after the month ends
    const remainingCells = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        status: null,
        canMakeup: false,
        isCurrentMonth: false,
      })
    }

    return days
  }, [currentYear, currentMonth, checkins])

  /**
   * Get day cell styles based on status
   */
  const getDayStyles = (data: DayData) => {
    if (!data.isCurrentMonth) {
      return 'text-gray-600 cursor-default'
    }

    const baseStyles = 'cursor-pointer hover:border-primary'

    switch (data.status) {
      case 'checked':
        return clsx(baseStyles, 'bg-primary/20 border-primary text-primary')
      case 'missed':
        return clsx(baseStyles, 'bg-red-500/20 border-red-500/50 text-red-400')
      case 'makeup':
        return clsx(baseStyles, 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400')
      case 'attraction':
        return clsx(baseStyles, 'bg-blue-500/20 border-blue-500/50 text-blue-400')
      case 'makeup-available':
        return clsx(
          baseStyles,
          'bg-orange-500/20 border-orange-500/50 text-orange-400 ring-2 ring-orange-500'
        )
      default:
        return clsx(baseStyles, 'text-text-muted')
    }
  }

  /**
   * Get status icon
   */
  const getStatusIcon = (status: CheckinStatus) => {
    switch (status) {
      case 'checked':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'missed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'makeup':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'attraction':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
        )
      case 'makeup-available':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )
      default:
        return null
    }
  }

  /**
   * Handle previous month
   */
  const handlePrevMonth = () => {
    let newMonth = currentMonth - 1
    let newYear = currentYear

    if (newMonth < 1) {
      newMonth = 12
      newYear -= 1
    }

    setCurrentMonth(newMonth)
    setCurrentYear(newYear)
    onMonthChange?.(newYear, newMonth)
  }

  /**
   * Handle next month
   */
  const handleNextMonth = () => {
    let newMonth = currentMonth + 1
    let newYear = currentYear

    if (newMonth > 12) {
      newMonth = 1
      newYear += 1
    }

    setCurrentMonth(newMonth)
    setCurrentYear(newYear)
    onMonthChange?.(newYear, newMonth)
  }

  /**
   * Handle day click
   */
  const handleDayClick = (data: DayData) => {
    if (!data.isCurrentMonth || !onDayClick) return

    const date = new Date(currentYear, currentMonth - 1, data.day)
    onDayClick(date, data)
  }

  return (
    <div className={clsx('w-full', className)}>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>

        <h3 className="text-lg font-semibold text-white">
          {new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
          })}
        </h3>

        <Button variant="ghost" size="sm" onClick={handleNextMonth}>
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-text-muted py-2">
            {day}
          </div>
        ))}

        {/* Day cells */}
        {calendarDays.map((data, index) => (
          <button
            type="button"
            key={`${data.day}-${index}`}
            onClick={() => handleDayClick(data)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleDayClick(data)
              }
            }}
            className={clsx(
              'aspect-square flex flex-col items-center justify-center',
              'border-2 rounded-lg transition-all',
              getDayStyles(data)
            )}
          >
            <span className="text-sm font-medium">{data.day}</span>
            {data.isCurrentMonth && data.status && (
              <div className="mt-1">{getStatusIcon(data.status)}</div>
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/20 border border-primary" />
          <span className="text-text-muted">Checked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/50" />
          <span className="text-text-muted">Missed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/50" />
          <span className="text-text-muted">Makeup</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/50" />
          <span className="text-text-muted">Attraction</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/50 ring-2 ring-orange-500" />
          <span className="text-text-muted">Can Makeup</span>
        </div>
      </div>
    </div>
  )
}

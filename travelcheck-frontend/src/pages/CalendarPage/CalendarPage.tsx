/**
 * @file CalendarPage Component
 * @description Page displaying check-in calendar
 */

import { CalendarGrid } from '@/components/business/CalendarGrid'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStaking } from '@/hooks/useStaking'
import { useTranslation } from 'react-i18next'

/**
 * CalendarPage Component
 */
export function CalendarPage() {
  const { stakeId } = useParams<{ stakeId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { getStake, getCheckinRecords } = useStaking()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [checkins, setCheckins] = useState<Record<string, { status: 'checked' | 'missed' | 'makeup'; canMakeup: boolean }>>({})
  const [stakeInfo, setStakeInfo] = useState<{ checkedDays: number; milestone: number } | null>(null)

  // Load stake info and check-in records
  useEffect(() => {
    const loadData = async () => {
      if (!stakeId) return

      try {
        // Load stake info
        const stake = await getStake(stakeId)
        if (stake) {
          setStakeInfo({
            checkedDays: stake.checkedDays,
            milestone: stake.milestone,
          })

          // Set calendar to stake start date
          const startDate = new Date(stake.startTime * 1000)
          setYear(startDate.getFullYear())
          setMonth(startDate.getMonth() + 1)
        }

        // Load check-in records
        const records = await getCheckinRecords(stakeId)
        console.log('Check-in records:', records)

        // Convert records to calendar format
        const checkinMap: Record<string, { status: 'checked'; canMakeup: false }> = {}
        records.forEach((record) => {
          const date = new Date(Number(record.timestamp) * 1000)
          const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          checkinMap[dateKey] = { status: 'checked', canMakeup: false }
        })

        setCheckins(checkinMap)
        console.log('Calendar checkins:', checkinMap)
      } catch (error) {
        console.error('Failed to load calendar data:', error)
      }
    }

    loadData()
  }, [stakeId, getStake, getCheckinRecords])

  const handleDayClick = (date: Date) => {
    console.log('Clicked date:', date)
  }

  const checkedDaysCount = Object.keys(checkins).length
  const completionRate = stakeInfo ? Math.round((checkedDaysCount / stakeInfo.milestone) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('calendar.title')}</h1>
          <p className="text-text-muted">{t('calendar.subtitle')}</p>
        </div>
        <Button variant="primary" onClick={() => navigate(`/checkin/${stakeId}`)}>
          {t('calendar.checkinToday')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <Card.Body>
            <p className="text-sm text-text-muted mb-1">{t('calendar.totalCheckedDays')}</p>
            <p className="text-2xl font-bold text-white">{checkedDaysCount}</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <p className="text-sm text-text-muted mb-1">{t('calendar.targetDays')}</p>
            <p className="text-2xl font-bold text-primary">{stakeInfo?.milestone || 0} {t('calendar.day')}</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <p className="text-sm text-text-muted mb-1">{t('calendar.completionRate')}</p>
            <p className="text-2xl font-bold text-primary">{completionRate}%</p>
          </Card.Body>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <Card.Body>
          <CalendarGrid year={year} month={month} checkins={checkins} onDayClick={handleDayClick} />
        </Card.Body>
      </Card>
    </div>
  )
}

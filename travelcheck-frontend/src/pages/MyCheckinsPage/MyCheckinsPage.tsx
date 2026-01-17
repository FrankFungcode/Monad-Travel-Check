/**
 * @file MyCheckinsPage Component
 * @description Page for viewing and managing all user check-ins and stakes
 */

import { StakeCard } from '@/components/business/StakeCard'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import type { Stake } from '@/types/models.types'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useStaking } from '@/hooks/useStaking'
import { useWallet } from '@/hooks/useWallet'
import { formatEther } from 'ethers'

/**
 * MyCheckinsPage Component
 */
export function MyCheckinsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { address, isConnected } = useWallet()
  const { getUserStakes, getStake } = useStaking()
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [stakes, setStakes] = useState<Stake[]>([])

  // Load user stakes from blockchain
  useEffect(() => {
    const loadStakes = async () => {
      if (!address || !isConnected) {
        setStakes([])
        return
      }

      try {
        // Get user's stake IDs
        const stakeIds = await getUserStakes(address)
        console.log('User stake IDs:', stakeIds)

        // Fetch details for each stake
        const stakePromises = stakeIds.map(async (stakeId) => {
          const stakeData = await getStake(stakeId)
          if (!stakeData) return null

          // Convert blockchain data to UI format
          const stake: Stake = {
            id: stakeId,
            userId: address,
            type: 'daily', // We can enhance this later if needed
            amount: parseFloat(formatEther(stakeData.amount)),
            milestone: stakeData.milestone as 10 | 20 | 30 | 50,
            mode: stakeData.mode === 0 ? 'sealed' : 'anytime',
            checkedDays: stakeData.checkedDays,
            isPerfect: stakeData.isPerfect,
            accumulatedInterest: parseFloat(formatEther(stakeData.accumulatedInterest)),
            status: stakeData.status === 0 ? 'active' : stakeData.status === 1 ? 'completed' : 'withdrawn',
            startDate: new Date(stakeData.startTime * 1000),
            endDate: new Date(stakeData.endTime * 1000),
            completedAt: stakeData.completedAt > 0 ? new Date(stakeData.completedAt * 1000) : null,
            withdrawnAt: stakeData.withdrawnAt > 0 ? new Date(stakeData.withdrawnAt * 1000) : null,
            createdAt: new Date(stakeData.startTime * 1000),
          }
          return stake
        })

        const loadedStakes = (await Promise.all(stakePromises)).filter((s): s is Stake => s !== null)
        setStakes(loadedStakes)
        console.log('Loaded stakes:', loadedStakes)
      } catch (error) {
        console.error('Failed to load stakes:', error)
      }
    }

    loadStakes()
  }, [address, isConnected, getUserStakes, getStake])

  const filteredStakes = stakes.filter((stake) => {
    if (filter === 'all') return true
    return stake.status === filter
  })

  const activeStakes = stakes.filter((s) => s.status === 'active')
  const completedStakes = stakes.filter((s) => s.status === 'completed')

  const handleCheckin = (stakeId: string) => {
    navigate(`/checkin/${stakeId}`)
  }

  const handleViewDetails = (stakeId: string) => {
    navigate(`/calendar/${stakeId}`)
  }

  const handleCreateStake = () => {
    navigate('/stake')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('checkins.title')}</h1>
        <p className="text-text-muted">{t('checkins.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <Card.Body>
            <p className="text-sm text-text-muted mb-1">{t('checkins.myStakes')}</p>
            <p className="text-2xl font-bold text-white">{stakes.length}</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <p className="text-sm text-text-muted mb-1">{t('checkins.activeStakes')}</p>
            <p className="text-2xl font-bold text-primary">{activeStakes.length}</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <p className="text-sm text-text-muted mb-1">{t('checkins.completedStakes')}</p>
            <p className="text-2xl font-bold text-white">{completedStakes.length}</p>
          </Card.Body>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <Card.Body>
          <div className="flex gap-2 overflow-x-auto">
            {[
              { value: 'all' as const, label: t('common.all', { defaultValue: 'All' }), icon: '📋' },
              { value: 'active' as const, label: t('checkins.activeStakes'), icon: '🔥' },
              { value: 'completed' as const, label: t('checkins.completedStakes'), icon: '✅' },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilter(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${filter === tab.value
                  ? 'bg-primary text-background-dark'
                  : 'bg-background-dark text-text-muted hover:text-primary'
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Stakes Grid */}
      {filteredStakes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStakes.map((stake) => (
            <StakeCard
              key={stake.id}
              stake={stake}
              onCheckin={stake.status === 'active' ? () => handleCheckin(stake.id) : undefined}
              onViewDetails={() => handleViewDetails(stake.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <Card.Body>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t('checkins.noActiveStakes')}
              </h3>
              <p className="text-text-muted mb-6">{t('checkins.createFirstStake')}</p>
              <Button variant="primary" onClick={handleCreateStake}>
                {t('home.createNewStake')}
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}

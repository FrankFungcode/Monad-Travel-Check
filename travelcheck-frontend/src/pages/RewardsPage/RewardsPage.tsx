/**
 * @file RewardsPage Component
 * @description Page for viewing and claiming rewards (Red Packets & Badges)
 */

import { LotteryWheel } from '@/components/business/LotteryWheel'
import { RedPacket } from '@/components/business/RedPacket'
import { Badge } from '@/components/common/Badge'
import { Card } from '@/components/common/Card'
import { BadgeInfo, useBadges } from '@/hooks/useBadges'
import { useStaking } from '@/hooks/useStaking'
import { useWallet } from '@/hooks/useWallet'
import type { LotteryPrize, Reward } from '@/types/models.types'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * RewardsPage Component
 */
export function RewardsPage() {
  const { t } = useTranslation()
  const { address } = useWallet()
  const {
    getUserStakes,
    getCheckinRecords,
    getTotalRedPacketClaimed,
    claimRedPacket: claimRedPacketFn,
  } = useStaking()
  const { getUserBadges } = useBadges()

  const [activeTab, setActiveTab] = useState<'redpackets' | 'lottery' | 'badges'>('redpackets')
  const [lotteryChances] = useState(0) // Logic for lottery not yet implemented on chain

  // Real data state
  const [redPackets, setRedPackets] = useState<Reward[]>([])
  const [badges, setBadges] = useState<BadgeInfo[]>([])
  const [totalEarned, setTotalEarned] = useState('0.00')
  const [unclaimedCount, setUnclaimedCount] = useState(0)
  const [badgesEarnedCount, setBadgesEarnedCount] = useState(0)

  const [loading, setLoading] = useState(false)

  // Load data
  useEffect(() => {
    if (!address) return

    const loadData = async () => {
      setLoading(true)
      try {
        // 1. Load Stakes and Red Packets
        const stakeIds = await getUserStakes(address)
        const allRedPackets: Reward[] = []
        let totalClaimed = 0

        // Process each stake in parallel
        await Promise.all(
          stakeIds.map(async (stakeId) => {
            // Get records
            const records = await getCheckinRecords(stakeId)

            // Get total claimed amount for this stake
            const stakeClaimed = await getTotalRedPacketClaimed(stakeId)
            totalClaimed += parseFloat(stakeClaimed)

            // Check each record for red packet status
            await Promise.all(
              records.map(async (record, index) => {
                // Use localStorage to check if red packet is claimed
                const storageKey = `redpacket_${stakeId}_${index}`
                const storedAmount = localStorage.getItem(storageKey)
                const claimed = !!storedAmount

                // Construct reward object
                allRedPackets.push({
                  id: `${stakeId}-${index}`,
                  userId: address,
                  stakeId: stakeId,
                  type: 'redpacket',
                  amount: storedAmount ? parseFloat(storedAmount) : 0,
                  badgeId: null,
                  expireAt: new Date(Number(record.timestamp) * 1000 + 24 * 3600 * 1000), // 24h expiry
                  claimed: claimed,
                  claimedAt: claimed ? new Date() : null,
                  createdAt: new Date(Number(record.timestamp) * 1000),
                })
              })
            )
          })
        )

        // Sort red packets by date (newest first)
        allRedPackets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        setRedPackets(allRedPackets)

        // Calculate stats
        setTotalEarned(totalClaimed.toFixed(4))
        setUnclaimedCount(allRedPackets.filter(r => !r.claimed).length)

        // 2. Load Badges
        const userBadges = await getUserBadges(address)
        setBadges(userBadges)
        setBadgesEarnedCount(userBadges.filter(b => b.earned).length)

      } catch (error) {
        console.error('Failed to load rewards data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [address, getUserStakes, getCheckinRecords, getTotalRedPacketClaimed, getUserBadges])

  const handleSpin = async (): Promise<LotteryPrize> => {
    // Simulate API call for lottery (not yet implemented)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: '1',
          name: 'Coming Soon',
          type: 'token',
          amount: 0,
          probability: 0,
          image: null,
          createdAt: new Date(),
        })
      }, 1000)
    })
  }

  const handleClaimRedPacket = async (reward: Reward) => {
    if (!reward.stakeId) return
    // Parse index from ID (format: stakeId-index)
    const parts = reward.id.split('-')
    const index = parseInt(parts[parts.length - 1])

    if (isNaN(index)) return

    const amount = await claimRedPacketFn(reward.stakeId, index)
    if (amount) {
      // Save amount to localStorage
      const storageKey = `redpacket_${reward.stakeId}_${index}`
      localStorage.setItem(storageKey, amount)

      // Update local state to mark as claimed
      setRedPackets(prev => prev.map(r => {
        if (r.id === reward.id) {
          return {
            ...r,
            claimed: true,
            claimedAt: new Date(),
            amount: parseFloat(amount)
          }
        }
        return r
      }))

      // Update total earned
      setTotalEarned(prev => (parseFloat(prev) + parseFloat(amount)).toFixed(4))
      setUnclaimedCount(prev => prev - 1)
    }
  }

  if (!address) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-white mb-4">{t('common.connectWallet')}</h2>
        <p className="text-text-muted">{t('rewards.connectToView')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('rewards.title')}</h1>
        <p className="text-text-muted">{t('rewards.subtitle')}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body>
            <p className="text-sm text-text-muted mb-1">{t('rewards.totalEarned')}</p>
            <p className="text-2xl font-bold text-primary">{totalEarned} MON</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <p className="text-sm text-text-muted mb-1">{t('rewards.unclaimed')}</p>
            <p className="text-2xl font-bold text-white">{unclaimedCount}</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <p className="text-sm text-text-muted mb-1">{t('rewards.lotteryChances')}</p>
            <p className="text-2xl font-bold text-primary">{lotteryChances}</p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <p className="text-sm text-text-muted mb-1">{t('rewards.badgesEarned')}</p>
            <p className="text-2xl font-bold text-white">
              {badgesEarnedCount} / {badges.length || '-'}
            </p>
          </Card.Body>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <Card.Body>
          <div className="flex gap-2 overflow-x-auto">
            {[
              { value: 'redpackets', label: t('rewards.redPackets'), icon: '🧧' },
              { value: 'lottery', label: t('rewards.lottery'), icon: '🎰' },
              { value: 'badges', label: t('rewards.badges'), icon: '🏆' },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.value
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

      {/* Red Packets Tab */}
      {activeTab === 'redpackets' && (
        <>
          {redPackets.length === 0 && !loading ? (
            <div className="text-center py-12 text-text-muted">
              {t('rewards.noRedPackets')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {redPackets.map((packet) => (
                <RedPacket key={packet.id} reward={packet} onClaim={handleClaimRedPacket} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Lottery Tab */}
      {activeTab === 'lottery' && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-xl text-white font-bold mb-4">Coming Soon</div>
          <LotteryWheel chances={lotteryChances} onSpin={handleSpin} />
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <Card key={badge.id} className={badge.earned ? '' : 'opacity-50'}>
              <Card.Body>
                <div className="text-center">
                  <div className="text-6xl mb-3">{badge.icon}</div>
                  <h3 className="font-semibold text-white mb-1">{badge.name}</h3>
                  {badge.earned ? (
                    <Badge variant="success">{t('rewards.earned')}</Badge>
                  ) : (
                    <Badge variant="default">{t('rewards.locked')}</Badge>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [globalStats] = useState({
    participants: 12405,
    participantsGrowth: 5,
    tasksCompleted: 85200,
    tasksGrowth: 12,
    activeToday: 2300,
  })

  const [userStreak] = useState(5)

  return (
    <div className="space-y-12">
      <div className="text-center space-y-6 py-12">
        <div className="flex justify-center">
          <Badge variant="success" size="md" className="inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {t('home.liveOnMainnet')}
          </Badge>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
          {t('home.title').split('，')[0]}，
          <br />
          <span className="text-primary">{t('home.title').split('，')[1]}</span>
        </h1>

        <p className="text-lg md:text-xl text-text-muted max-w-3xl mx-auto">
          {t('home.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden hover:border-primary transition-all cursor-pointer group">
          <div
            className="relative h-64 bg-gradient-to-br from-teal-900 to-teal-700 -m-4 mb-4"
            onClick={() => navigate('/stake')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/stake')}
            role="button"
            tabIndex={0}
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800')] bg-cover bg-center opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 to-transparent" />

            <div className="absolute top-4 left-4">
              <Badge variant="success" className="flex items-center gap-2">
                <span>🔥</span>
                {t('home.dailyTaskCheckin.streak', { defaultValue: `Streak: ${userStreak} Days` }).replace('5', String(userStreak))}
              </Badge>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('home.dailyTaskCheckin.title')}
              </h2>
              <p className="text-sm text-gray-300 mb-4">
                {t('home.dailyTaskCheckin.description')}
              </p>

              <Button variant="primary" className="group-hover:bg-primary/90">
                {t('home.dailyTaskCheckin.startCheckin')}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden hover:border-primary transition-all cursor-pointer group">
          <div
            className="relative h-64 bg-gradient-to-br from-blue-900 to-purple-900 -m-4 mb-4"
            onClick={() => navigate('/attractions')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/attractions')}
            role="button"
            tabIndex={0}
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800')] bg-cover bg-center opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 to-transparent" />

            <div className="absolute top-4 right-4">
              <Badge variant="success" className="animate-pulse">
                {t('home.newTasksAvailable', { defaultValue: 'New Tasks Available' })}
              </Badge>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {t('home.attractionHunt.title')}
              </h2>
              <p className="text-sm text-gray-300 mb-1">
                {t('home.attractionHunt.description')}
              </p>
              <p className="text-sm text-primary mb-4">
                45 {t('home.attractionHunt.locationsNearby')}
              </p>

              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-background-dark group-hover:bg-white group-hover:text-background-dark">
                {t('home.attractionHunt.viewTasks')}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Body>
            <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
              <span>🌍</span>
              <span className="uppercase tracking-wide">{t('home.stats.globalParticipants')}</span>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-bold text-white">
                {globalStats.participants.toLocaleString()}
              </p>
              <Badge variant="success" size="sm">
                ↗ {globalStats.participantsGrowth}%
              </Badge>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
              <span>✓</span>
              <span className="uppercase tracking-wide">{t('home.stats.tasksCompleted')}</span>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-bold text-white">
                {(globalStats.tasksCompleted / 1000).toFixed(1)}k
              </p>
              <Badge variant="success" size="sm">
                ↗ {globalStats.tasksGrowth}%
              </Badge>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
              <span>⚡</span>
              <span className="uppercase tracking-wide">{t('home.stats.activeToday')}</span>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-bold text-white">
                {globalStats.activeToday.toLocaleString()}
              </p>
              <span className="text-text-muted text-sm">
                {t('home.travelers', { defaultValue: 'Travelers' })}
              </span>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

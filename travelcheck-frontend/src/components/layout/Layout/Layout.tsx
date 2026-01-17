import { WalletConnect } from '@/components/business/WalletConnect'
import { ThemeBackground } from '@/components/common/ThemeBackground'
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

export interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { t, i18n } = useTranslation()

  const navItems = [
    { path: '/', label: t('nav.home'), icon: '🏠' },
    { path: '/stake', label: t('nav.stake'), icon: '💰' },
    { path: '/checkins', label: t('nav.checkin'), icon: '📝' },
    { path: '/attractions', label: t('nav.attractions'), icon: '🗺️' },
    { path: '/rewards', label: t('nav.rewards'), icon: '🎁' },
    { path: '/profile', label: t('nav.profile'), icon: '👤' },
  ]

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN'
    i18n.changeLanguage(newLang)
  }

  return (
    <div className="min-h-screen bg-background-dark text-white relative overflow-hidden">
      <ThemeBackground className="fixed inset-0 z-0 pointer-events-none text-primary" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 bg-background-dark/95 backdrop-blur">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-12">
                <Link to="/" className="flex items-center gap-2">
                  <span className="text-2xl">✈️</span>
                  <span className="text-xl font-bold text-white">{t('common.appName')}</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={clsx(
                          'font-medium transition-colors text-sm',
                          isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                        )}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <ThemeSwitcher />

                <button
                  onClick={toggleLanguage}
                  className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors border border-gray-700 rounded-lg hover:border-gray-500"
                  type="button"
                >
                  {i18n.language === 'zh-CN' ? 'EN' : '中文'}
                </button>

                <WalletConnect />
              </div>
            </div>
          </div>

          <div className="md:hidden border-t border-border-dark">
            <div className="container mx-auto px-6">
              <div className="flex items-center gap-1 overflow-x-auto py-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={clsx(
                        'flex items-center gap-2 px-4 py-2 font-medium transition-colors text-sm whitespace-nowrap rounded-lg',
                        isActive ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-white'
                      )}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">{children}</main>

        <footer className="mt-16 border-t-2 border-border-dark bg-card-dark py-8">
          <div className="container mx-auto px-6 text-center text-text-muted text-sm">
            <p>{t('footer.copyright')}</p>
            <p className="mt-2">{t('footer.tagline')}</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

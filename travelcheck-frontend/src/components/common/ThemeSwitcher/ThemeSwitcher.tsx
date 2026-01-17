import { useTheme } from '@/contexts/ThemeContext'
import type { ThemeId } from '@/types/theme.types'
import { clsx } from 'clsx'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export interface ThemeSwitcherProps {
  className?: string
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { t } = useTranslation()
  const { theme, themeId, setTheme, availableThemes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
    return undefined
  }, [isOpen])

  const handleThemeSelect = (selectedThemeId: ThemeId) => {
    setTheme(selectedThemeId)
    setIsOpen(false)
  }

  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 text-sm font-medium',
          'border rounded-lg transition-all duration-200',
          'hover:border-primary/50 hover:bg-primary/10',
          isOpen ? 'border-primary bg-primary/10' : 'border-gray-700 text-gray-400'
        )}
        type="button"
        aria-label="Switch theme"
        aria-expanded={isOpen}
      >
        <span className="text-lg">{theme.icon}</span>
        <span className={clsx('hidden sm:inline', isOpen && 'text-white')}>{t(`theme.${theme.id}`)}</span>
        <svg
          className={clsx('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={clsx(
            'absolute right-0 mt-2 w-56 rounded-lg overflow-hidden',
            'bg-card-dark border border-border-dark shadow-glow-strong',
            'animate-fadeIn z-50'
          )}
        >
          <div className="py-1">
            {availableThemes.map((themeOption) => {
              const isSelected = themeOption.id === themeId
              return (
                <button
                  key={themeOption.id}
                  onClick={() => handleThemeSelect(themeOption.id as ThemeId)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3',
                    'text-left transition-colors',
                    isSelected
                      ? 'bg-primary/20 text-primary font-medium'
                      : 'text-gray-300 hover:bg-background-dark hover:text-white'
                  )}
                  type="button"
                >
                  <span className="text-2xl">{themeOption.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{t(`theme.${themeOption.id}`)}</div>
                  </div>
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: themeOption.colors.primary }}
                    aria-hidden="true"
                  />
                  {isSelected && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

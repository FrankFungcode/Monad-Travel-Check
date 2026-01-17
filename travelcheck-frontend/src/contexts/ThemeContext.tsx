import { DEFAULT_THEME_ID, THEME_STORAGE_KEY, THEMES } from '@/config/themes'
import type { Theme, ThemeId } from '@/types/theme.types'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

interface ThemeContextValue {
  theme: Theme
  themeId: ThemeId
  setTheme: (themeId: ThemeId) => void
  availableThemes: Theme[]
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return (stored as ThemeId) || DEFAULT_THEME_ID
  })

  const theme = useMemo(() => THEMES[themeId], [themeId])
  const availableThemes = useMemo(() => Object.values(THEMES), [])

  const applyTheme = useCallback((currentTheme: Theme) => {
    const root = document.documentElement

    root.style.setProperty('--color-primary', currentTheme.colors.primary)
    root.style.setProperty('--color-primary-hover', currentTheme.colors.primaryHover)
    root.style.setProperty('--color-background-dark', currentTheme.colors.backgroundDark)
    root.style.setProperty('--color-card-dark', currentTheme.colors.cardDark)
    root.style.setProperty('--color-border-dark', currentTheme.colors.borderDark)
    root.style.setProperty('--color-text-muted', currentTheme.colors.textMuted)
    root.style.setProperty('--color-glow', currentTheme.colors.glowColor)
    root.style.setProperty('--color-glow-strong', currentTheme.colors.glowColorStrong)
  }, [])

  const handleSetTheme = useCallback(
    (newThemeId: ThemeId) => {
      setThemeId(newThemeId)
      localStorage.setItem(THEME_STORAGE_KEY, newThemeId)
      applyTheme(THEMES[newThemeId])
    },
    [applyTheme]
  )

  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  const value = useMemo(
    () => ({
      theme,
      themeId,
      setTheme: handleSetTheme,
      availableThemes,
    }),
    [theme, themeId, handleSetTheme, availableThemes]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

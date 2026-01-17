/**
 * @file Theme Context
 * @description Provides theme management functionality across the application
 */

import { DEFAULT_THEME_ID, THEME_STORAGE_KEY, THEMES } from '@/config/themes'
import type { Theme, ThemeId } from '@/types/theme.types'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Theme context value
 */
interface ThemeContextValue {
  /** Current active theme */
  theme: Theme
  /** Current theme ID */
  themeId: ThemeId
  /** Set theme by ID */
  setTheme: (themeId: ThemeId) => void
  /** Available themes */
  availableThemes: Theme[]
}

/**
 * Theme context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  children: ReactNode
}

/**
 * Theme Provider Component
 * Manages theme state and applies CSS variables to the document root
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Load theme from localStorage or use default
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return (stored as ThemeId) || DEFAULT_THEME_ID
  })

  const theme = useMemo(() => THEMES[themeId], [themeId])
  const availableThemes = useMemo(() => Object.values(THEMES), [])

  /**
   * Apply theme colors to CSS variables
   */
  const applyTheme = useCallback((currentTheme: Theme) => {
    const root = document.documentElement

    // Set CSS custom properties for dynamic theming
    root.style.setProperty('--color-primary', currentTheme.colors.primary)
    root.style.setProperty('--color-primary-hover', currentTheme.colors.primaryHover)
    root.style.setProperty('--color-background-dark', currentTheme.colors.backgroundDark)
    root.style.setProperty('--color-card-dark', currentTheme.colors.cardDark)
    root.style.setProperty('--color-border-dark', currentTheme.colors.borderDark)
    root.style.setProperty('--color-text-muted', currentTheme.colors.textMuted)
    root.style.setProperty('--color-glow', currentTheme.colors.glowColor)
    root.style.setProperty('--color-glow-strong', currentTheme.colors.glowColorStrong)
  }, [])

  /**
   * Handle theme change
   */
  const handleSetTheme = useCallback(
    (newThemeId: ThemeId) => {
      setThemeId(newThemeId)
      localStorage.setItem(THEME_STORAGE_KEY, newThemeId)
      applyTheme(THEMES[newThemeId])
    },
    [applyTheme]
  )

  /**
   * Apply theme on mount and when theme changes
   */
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

/**
 * Hook to access theme context
 * @throws {Error} If used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

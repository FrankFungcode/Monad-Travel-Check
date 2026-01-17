/**
 * @file Theme Types
 * @description Type definitions for theme system
 */

/**
 * Theme color configuration
 */
export interface ThemeColors {
  /** Primary color */
  primary: string
  /** Primary hover color */
  primaryHover: string
  /** Dark background color */
  backgroundDark: string
  /** Card background color */
  cardDark: string
  /** Border color */
  borderDark: string
  /** Muted text color */
  textMuted: string
  /** Glow shadow color (RGBA) */
  glowColor: string
  /** Strong glow shadow color (RGBA) */
  glowColorStrong: string
}

/**
 * Theme configuration
 */
export interface Theme {
  /** Unique theme ID */
  id: string
  /** Display name */
  name: string
  /** Theme icon */
  icon: string
  /** Color scheme */
  colors: ThemeColors
}

/**
 * Available theme IDs
 */
export type ThemeId = 'forest' | 'ocean' | 'sunset' | 'sakura' | 'violet'

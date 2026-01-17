/**
 * @file Theme Configurations
 * @description Predefined theme color schemes for the application
 */

import type { Theme, ThemeId } from '@/types/theme.types'

/**
 * Available themes for the application
 * Each theme is designed to evoke different travel experiences
 */
export const THEMES: Record<ThemeId, Theme> = {
  /**
   * Forest Green - Fresh and natural
   * Evokes hiking, forest trails, and nature exploration
   */
  forest: {
    id: 'forest',
    name: 'Forest Green',
    icon: '🌲',
    colors: {
      primary: '#13ec5b',
      primaryHover: '#0fd650',
      backgroundDark: '#102216',
      cardDark: '#1a2c20',
      borderDark: '#23482f',
      textMuted: '#92c9a4',
      glowColor: 'rgba(19, 236, 91, 0.3)',
      glowColorStrong: 'rgba(19, 236, 91, 0.5)',
    },
  },

  /**
   * Ocean Blue - Deep and serene
   * Evokes ocean views, beaches, and coastal adventures
   */
  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    icon: '🌊',
    colors: {
      primary: '#1E40AF',
      primaryHover: '#1E3A8A',
      backgroundDark: '#0F172A',
      cardDark: '#1E293B',
      borderDark: '#334155',
      textMuted: '#94A3B8',
      glowColor: 'rgba(30, 64, 175, 0.3)',
      glowColorStrong: 'rgba(30, 64, 175, 0.5)',
    },
  },

  /**
   * Sunset Orange - Warm and vibrant
   * Evokes desert sunsets, golden hour, and warm destinations
   */
  sunset: {
    id: 'sunset',
    name: 'Sunset Orange',
    icon: '🌅',
    colors: {
      primary: '#F97316',
      primaryHover: '#EA580C',
      backgroundDark: '#1A120B',
      cardDark: '#2D1B0E',
      borderDark: '#4A2C1A',
      textMuted: '#D4A574',
      glowColor: 'rgba(249, 115, 22, 0.3)',
      glowColorStrong: 'rgba(249, 115, 22, 0.5)',
    },
  },

  /**
   * Sakura Pink - Romantic and gentle
   * Evokes cherry blossoms, spring travels, and cultural experiences
   */
  sakura: {
    id: 'sakura',
    name: 'Sakura Pink',
    icon: '🌸',
    colors: {
      primary: '#EC4899',
      primaryHover: '#DB2777',
      backgroundDark: '#1F0A1A',
      cardDark: '#2D1424',
      borderDark: '#4A2338',
      textMuted: '#E9A5C7',
      glowColor: 'rgba(236, 72, 153, 0.3)',
      glowColorStrong: 'rgba(236, 72, 153, 0.5)',
    },
  },

  /**
   * Violet Purple - Mysterious and elegant
   * Evokes luxury travel, night markets, and exotic destinations
   */
  violet: {
    id: 'violet',
    name: 'Violet Purple',
    icon: '🔮',
    colors: {
      primary: '#8B5CF6',
      primaryHover: '#7C3AED',
      backgroundDark: '#150A2A',
      cardDark: '#1F1139',
      borderDark: '#352353',
      textMuted: '#C4B5FD',
      glowColor: 'rgba(139, 92, 246, 0.3)',
      glowColorStrong: 'rgba(139, 92, 246, 0.5)',
    },
  },
}

/**
 * Default theme ID
 */
export const DEFAULT_THEME_ID: ThemeId = 'ocean'

/**
 * Local storage key for theme preference
 */
export const THEME_STORAGE_KEY = 'travelcheck-theme'

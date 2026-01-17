export interface ThemeColors {
  primary: string
  primaryHover: string
  backgroundDark: string
  cardDark: string
  borderDark: string
  textMuted: string
  glowColor: string
  glowColorStrong: string
}

export interface Theme {
  id: string
  name: string
  icon: string
  colors: ThemeColors
}

export type ThemeId = 'forest' | 'ocean' | 'sunset' | 'sakura' | 'violet'

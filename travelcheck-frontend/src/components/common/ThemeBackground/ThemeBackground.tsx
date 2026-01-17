import { useTheme } from '@/contexts/ThemeContext'
import type { ThemeId } from '@/types/theme.types'

export interface ThemeBackgroundProps {
  className?: string
}

function ForestBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="forest-pattern" x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
          <path d="M50 160 L50 130 M50 130 L35 145 M50 130 L65 145 M50 120 L37 133 M50 120 L63 133 M50 110 L40 123 M50 110 L60 123"
                stroke="currentColor" strokeWidth="3" fill="none" opacity="0.8" />
          <circle cx="50" cy="105" r="22" fill="currentColor" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#forest-pattern)" />
    </svg>
  )
}

function OceanBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="ocean-pattern" x="0" y="0" width="200" height="120" patternUnits="userSpaceOnUse">
          <path d="M-50 50 Q-25 35 0 50 T50 50 T100 50 T150 50 T200 50 T250 50"
                stroke="currentColor" strokeWidth="3" fill="none" opacity="0.7" />
          <path d="M-50 70 Q-20 58 10 70 T70 70 T130 70 T190 70 T250 70"
                stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.5" />
          <circle cx="30" cy="25" r="4" fill="currentColor" opacity="0.3" />
          <circle cx="140" cy="30" r="3.5" fill="currentColor" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ocean-pattern)" />
    </svg>
  )
}

function SunsetBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="sunset-pattern" x="0" y="0" width="280" height="200" patternUnits="userSpaceOnUse">
          <line x1="140" y1="60" x2="140" y2="15" stroke="currentColor" strokeWidth="4" opacity="0.6" />
          <circle cx="140" cy="60" r="28" fill="currentColor" opacity="0.5" />
          <path d="M0 140 Q40 120 80 140 T160 140 T240 140 T320 140"
                stroke="currentColor" strokeWidth="3" fill="none" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sunset-pattern)" />
    </svg>
  )
}

function SakuraBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="sakura-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          <path d="M20 20 Q60 40 100 30 T180 40"
                stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.5" />
          <g opacity="0.6">
            <circle cx="50" cy="35" r="5" fill="currentColor" />
            <circle cx="44" cy="31" r="4" fill="currentColor" />
            <circle cx="56" cy="31" r="4" fill="currentColor" />
          </g>
          <ellipse cx="150" cy="75" rx="4" ry="7" fill="currentColor" opacity="0.4" transform="rotate(30 150 75)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sakura-pattern)" />
    </svg>
  )
}

function VioletBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="violet-pattern" x="0" y="0" width="250" height="200" patternUnits="userSpaceOnUse">
          <circle cx="180" cy="50" r="24" fill="currentColor" opacity="0.6" />
          <circle cx="186" cy="50" r="24" fill="var(--color-background-dark)" opacity="0.7" />
          <g opacity="0.7">
            <path d="M50 40 L52.5 46 L59 46 L54 50.5 L56.5 57 L50 52 L43.5 57 L46 50.5 L41 46 L47.5 46 Z"
                  fill="currentColor" />
          </g>
          <circle cx="90" cy="48" r="3" fill="currentColor" opacity="0.45" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#violet-pattern)" />
    </svg>
  )
}

const BACKGROUND_COMPONENTS: Record<ThemeId, () => JSX.Element> = {
  forest: ForestBackground,
  ocean: OceanBackground,
  sunset: SunsetBackground,
  sakura: SakuraBackground,
  violet: VioletBackground,
}

export function ThemeBackground({ className }: ThemeBackgroundProps) {
  const { themeId } = useTheme()
  const BackgroundComponent = BACKGROUND_COMPONENTS[themeId]

  return (
    <div className={className} aria-hidden="true">
      <BackgroundComponent />
    </div>
  )
}

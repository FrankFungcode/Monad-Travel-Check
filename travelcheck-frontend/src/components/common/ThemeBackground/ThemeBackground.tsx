/**
 * @file ThemeBackground Component
 * @description Renders theme-specific background patterns
 */

import { useTheme } from '@/contexts/ThemeContext'
import type { ThemeId } from '@/types/theme.types'

/**
 * ThemeBackground component props
 */
export interface ThemeBackgroundProps {
  /** Custom class name */
  className?: string
}

/**
 * Forest theme background - tree patterns
 */
function ForestBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="forest-pattern" x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
          {/* Trees */}
          <path d="M50 160 L50 130 M50 130 L35 145 M50 130 L65 145 M50 120 L37 133 M50 120 L63 133 M50 110 L40 123 M50 110 L60 123"
                stroke="currentColor" strokeWidth="3" fill="none" opacity="0.8" />
          <path d="M130 155 L130 125 M130 125 L117 138 M130 125 L143 138 M130 116 L120 128 M130 116 L140 128"
                stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.6" />
          {/* Leaves - larger circles */}
          <circle cx="50" cy="105" r="22" fill="currentColor" opacity="0.5" />
          <circle cx="45" cy="110" r="18" fill="currentColor" opacity="0.4" />
          <circle cx="55" cy="110" r="18" fill="currentColor" opacity="0.4" />
          <circle cx="130" cy="110" r="18" fill="currentColor" opacity="0.4" />
          <circle cx="125" cy="115" r="14" fill="currentColor" opacity="0.35" />
          {/* Small plants */}
          <path d="M100 170 Q100 160 95 155 M100 170 Q100 160 105 155"
                stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />
          <path d="M20 165 Q20 157 16 153 M20 165 Q20 157 24 153"
                stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#forest-pattern)" />
    </svg>
  )
}

/**
 * Ocean theme background - wave patterns
 */
function OceanBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="ocean-pattern" x="0" y="0" width="200" height="120" patternUnits="userSpaceOnUse">
          {/* Waves */}
          <path d="M-50 50 Q-25 35 0 50 T50 50 T100 50 T150 50 T200 50 T250 50"
                stroke="currentColor" strokeWidth="3" fill="none" opacity="0.7" />
          <path d="M-50 70 Q-20 58 10 70 T70 70 T130 70 T190 70 T250 70"
                stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.5" />
          <path d="M-50 90 Q-30 83 -10 90 T30 90 T70 90 T110 90 T150 90 T190 90 T230 90"
                stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" />
          {/* Bubbles - larger and more visible */}
          <circle cx="30" cy="25" r="4" fill="currentColor" opacity="0.3" />
          <circle cx="80" cy="18" r="3" fill="currentColor" opacity="0.25" />
          <circle cx="140" cy="30" r="3.5" fill="currentColor" opacity="0.3" />
          <circle cx="170" cy="22" r="2.5" fill="currentColor" opacity="0.25" />
          <circle cx="50" cy="105" r="2.5" fill="currentColor" opacity="0.2" />
          <circle cx="120" cy="110" r="3" fill="currentColor" opacity="0.25" />
          <circle cx="180" cy="105" r="2" fill="currentColor" opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ocean-pattern)" />
    </svg>
  )
}

/**
 * Sunset theme background - sun rays and desert dunes
 */
function SunsetBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="sunset-pattern" x="0" y="0" width="280" height="200" patternUnits="userSpaceOnUse">
          {/* Sun rays */}
          <line x1="140" y1="60" x2="140" y2="15" stroke="currentColor" strokeWidth="4" opacity="0.6" />
          <line x1="140" y1="60" x2="175" y2="30" stroke="currentColor" strokeWidth="3.5" opacity="0.5" />
          <line x1="140" y1="60" x2="105" y2="30" stroke="currentColor" strokeWidth="3.5" opacity="0.5" />
          <line x1="140" y1="60" x2="190" y2="50" stroke="currentColor" strokeWidth="3" opacity="0.45" />
          <line x1="140" y1="60" x2="90" y2="50" stroke="currentColor" strokeWidth="3" opacity="0.45" />
          <line x1="140" y1="60" x2="200" y2="70" stroke="currentColor" strokeWidth="2.5" opacity="0.4" />
          <line x1="140" y1="60" x2="80" y2="70" stroke="currentColor" strokeWidth="2.5" opacity="0.4" />
          {/* Sun */}
          <circle cx="140" cy="60" r="28" fill="currentColor" opacity="0.5" />
          <circle cx="140" cy="60" r="22" fill="currentColor" opacity="0.35" />
          <circle cx="140" cy="60" r="15" fill="currentColor" opacity="0.25" />
          {/* Desert dunes */}
          <path d="M0 140 Q40 120 80 140 T160 140 T240 140 T320 140"
                stroke="currentColor" strokeWidth="3" fill="none" opacity="0.5" />
          <path d="M0 165 Q50 150 100 165 T200 165 T300 165"
                stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.4" />
          {/* Cacti */}
          <path d="M50 180 L50 155 M44 168 L50 168 M50 162 L56 162"
                stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.5" />
          <path d="M230 185 L230 163 M225 173 L230 173"
                stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.45" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sunset-pattern)" />
    </svg>
  )
}

/**
 * Sakura theme background - cherry blossom petals
 */
function SakuraBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="sakura-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          {/* Cherry blossom branches */}
          <path d="M20 20 Q60 40 100 30 T180 40"
                stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.5" />
          <path d="M30 100 Q70 110 110 105 T190 115"
                stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M10 160 Q50 170 90 165 T170 175"
                stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" />
          {/* Cherry blossoms - 5 petals each - larger */}
          <g opacity="0.6">
            <circle cx="50" cy="35" r="5" fill="currentColor" />
            <circle cx="44" cy="31" r="4" fill="currentColor" />
            <circle cx="56" cy="31" r="4" fill="currentColor" />
            <circle cx="46" cy="41" r="4" fill="currentColor" />
            <circle cx="54" cy="41" r="4" fill="currentColor" />
          </g>
          <g opacity="0.55">
            <circle cx="130" cy="35" r="5" fill="currentColor" />
            <circle cx="125" cy="31" r="3.5" fill="currentColor" />
            <circle cx="135" cy="31" r="3.5" fill="currentColor" />
            <circle cx="126" cy="40" r="3.5" fill="currentColor" />
            <circle cx="134" cy="40" r="3.5" fill="currentColor" />
          </g>
          <g opacity="0.5">
            <circle cx="80" cy="110" r="4.5" fill="currentColor" />
            <circle cx="75" cy="107" r="3.5" fill="currentColor" />
            <circle cx="85" cy="107" r="3.5" fill="currentColor" />
            <circle cx="76" cy="115" r="3.5" fill="currentColor" />
            <circle cx="84" cy="115" r="3.5" fill="currentColor" />
          </g>
          <g opacity="0.45">
            <circle cx="160" cy="110" r="4" fill="currentColor" />
            <circle cx="156" cy="107" r="3" fill="currentColor" />
            <circle cx="164" cy="107" r="3" fill="currentColor" />
            <circle cx="157" cy="114" r="3" fill="currentColor" />
            <circle cx="163" cy="114" r="3" fill="currentColor" />
          </g>
          {/* Falling petals - larger */}
          <ellipse cx="150" cy="75" rx="4" ry="7" fill="currentColor" opacity="0.4" transform="rotate(30 150 75)" />
          <ellipse cx="40" cy="135" rx="3.5" ry="6" fill="currentColor" opacity="0.35" transform="rotate(-20 40 135)" />
          <ellipse cx="170" cy="145" rx="3" ry="5" fill="currentColor" opacity="0.3" transform="rotate(45 170 145)" />
          <ellipse cx="100" cy="60" rx="3" ry="5" fill="currentColor" opacity="0.35" transform="rotate(15 100 60)" />
          <ellipse cx="30" cy="180" rx="2.5" ry="4.5" fill="currentColor" opacity="0.3" transform="rotate(-35 30 180)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sakura-pattern)" />
    </svg>
  )
}

/**
 * Violet theme background - mystical stars and moon
 */
function VioletBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="violet-pattern" x="0" y="0" width="250" height="200" patternUnits="userSpaceOnUse">
          {/* Moon */}
          <circle cx="180" cy="50" r="24" fill="currentColor" opacity="0.6" />
          <circle cx="186" cy="50" r="24" fill="var(--color-background-dark)" opacity="0.7" />
          {/* Stars - larger */}
          <g opacity="0.7">
            <path d="M50 40 L52.5 46 L59 46 L54 50.5 L56.5 57 L50 52 L43.5 57 L46 50.5 L41 46 L47.5 46 Z"
                  fill="currentColor" />
          </g>
          <g opacity="0.65">
            <path d="M120 70 L122 75 L127 75 L123 79 L125 84 L120 80 L115 84 L117 79 L113 75 L118 75 Z"
                  fill="currentColor" />
          </g>
          <g opacity="0.6">
            <path d="M200 95 L202 100 L207 100 L203 104 L205 109 L200 105 L195 109 L197 104 L193 100 L198 100 Z"
                  fill="currentColor" />
          </g>
          <g opacity="0.55">
            <path d="M80 125 L81.5 129 L85.5 129 L82.5 132 L84 136 L80 133 L76 136 L77.5 132 L74.5 129 L78.5 129 Z"
                  fill="currentColor" />
          </g>
          <g opacity="0.6">
            <path d="M30 155 L31.5 160 L36 160 L32.5 163.5 L34 168 L30 164.5 L26 168 L27.5 163.5 L24 160 L28.5 160 Z"
                  fill="currentColor" />
          </g>
          <g opacity="0.5">
            <path d="M220 165 L221 168 L224 168 L221.5 170.5 L222.5 173.5 L220 171 L217.5 173.5 L218.5 170.5 L216 168 L219 168 Z"
                  fill="currentColor" />
          </g>
          {/* Sparkles - larger */}
          <circle cx="90" cy="48" r="3" fill="currentColor" opacity="0.45" />
          <circle cx="150" cy="82" r="2.5" fill="currentColor" opacity="0.4" />
          <circle cx="60" cy="98" r="3" fill="currentColor" opacity="0.45" />
          <circle cx="170" cy="135" r="2.5" fill="currentColor" opacity="0.4" />
          <circle cx="110" cy="165" r="3" fill="currentColor" opacity="0.45" />
          <circle cx="145" cy="125" r="2" fill="currentColor" opacity="0.35" />
          {/* Constellation lines */}
          <line x1="50" y1="40" x2="120" y2="70" stroke="currentColor" strokeWidth="1" opacity="0.35" />
          <line x1="120" y1="70" x2="200" y2="95" stroke="currentColor" strokeWidth="1" opacity="0.35" />
          <line x1="80" y1="125" x2="30" y2="155" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#violet-pattern)" />
    </svg>
  )
}

/**
 * Background pattern components by theme
 */
const BACKGROUND_COMPONENTS: Record<ThemeId, () => JSX.Element> = {
  forest: ForestBackground,
  ocean: OceanBackground,
  sunset: SunsetBackground,
  sakura: SakuraBackground,
  violet: VioletBackground,
}

/**
 * ThemeBackground Component
 * Renders a decorative background pattern based on the current theme
 *
 * @example
 * <ThemeBackground />
 */
export function ThemeBackground({ className }: ThemeBackgroundProps) {
  const { themeId } = useTheme()
  const BackgroundComponent = BACKGROUND_COMPONENTS[themeId]

  return (
    <div className={className} aria-hidden="true">
      <BackgroundComponent />
    </div>
  )
}

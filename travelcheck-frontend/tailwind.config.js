/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #1E40AF)',
          hover: 'var(--color-primary-hover, #1E3A8A)',
        },
        background: {
          dark: 'var(--color-background-dark, #0F172A)',
        },
        card: {
          dark: 'var(--color-card-dark, #1E293B)',
        },
        border: {
          dark: 'var(--color-border-dark, #334155)',
        },
        text: {
          muted: 'var(--color-text-muted, #94A3B8)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        glow: '0 0 20px var(--color-glow, rgba(30, 64, 175, 0.3))',
        'glow-strong': '0 0 30px var(--color-glow-strong, rgba(30, 64, 175, 0.5))',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

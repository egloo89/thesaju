import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        saju: {
          black: '#0A0A0F',
          deep: '#12121A',
          card: '#1A1A26',
          border: '#2A2A3E',
          gold: '#C9A84C',
          'gold-light': '#E8C97A',
          'gold-dark': '#9A7A2E',
          red: '#C0392B',
          blue: '#1A3A5C',
          purple: '#6B2FA0',
          green: '#1E6B3C',
          accent: '#8B5CF6',
          'accent-light': '#A78BFA',
        },
        ohaeng: {
          wood: '#2D6A4F',
          fire: '#C0392B',
          earth: '#D4A017',
          metal: '#A0A0B0',
          water: '#1A3A5C',
        }
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-noto-serif)', 'Georgia', 'serif'],
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #C9A84C 0%, #E8C97A 50%, #9A7A2E 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0A0A0F 0%, #12121A 100%)',
        'gradient-card': 'linear-gradient(135deg, #1A1A26 0%, #12121A 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          from: { boxShadow: '0 0 10px #C9A84C40, 0 0 20px #C9A84C20' },
          to: { boxShadow: '0 0 20px #C9A84C80, 0 0 40px #C9A84C40' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      boxShadow: {
        'gold': '0 0 20px rgba(201, 168, 76, 0.3)',
        'gold-lg': '0 0 40px rgba(201, 168, 76, 0.4)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}

export default config

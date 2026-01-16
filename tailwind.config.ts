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
        brand: {
          DEFAULT: '#CCFF00', // Volt Lime
          hover: '#B2DE00',
        },
        graphite: {
          900: '#0F172A', // Main Background
          800: '#1E293B', // Card Surface
          700: '#334155', // Elevated Surface / Border Subtle
          600: '#475569', // Border Strong / Input Border
          400: '#94A3B8', // Muted Text
        },
        status: {
          error: '#EF4444',
          warning: '#F59E0B',
          success: '#2DD4BF', // Teal (Never Green)
          info: '#38BDF8',
        },
      },
      fontFamily: {
        display: ['var(--font-barlow)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        manrope: ['var(--font-manrope)', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(204, 255, 0, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'spin-slow': 'spin 8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
export default config

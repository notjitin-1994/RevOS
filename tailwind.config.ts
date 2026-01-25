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
          50: '#F5FFCC',
          100: '#EBFF99',
          200: '#D4FF33',
          300: '#C2E617',
          400: '#A3C914',
          500: '#84AC10',
          600: '#658F0D',
          700: '#467209',
          800: '#275506',
          900: '#183A04',
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
        // 2026 Design System - Neo Mint & Fresh Colors
        neo: {
          mint: '#00D4AA',
          'mint-light': '#4DE6C8',
          'mint-dark': '#00A886',
          orange: '#FF9F43',
          'orange-light': '#FFB976',
          'orange-dark': '#E5852F',
        },
      },
      fontFamily: {
        display: ['var(--font-barlow)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        manrope: ['var(--font-manrope)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(15, 23, 42, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'spin-slow': 'spin 8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
      // Add safe area utilities for iPhone home bar
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [
    function({ addUtilities }: { addUtilities: any }) {
      addUtilities({
        '.scrollbar-hide': {
          /* Firefox */
          'scrollbar-width': 'none',
          /* IE/Edge */
          '-ms-overflow-style': 'none',
          /* WebKit */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-thin': {
          /* Firefox */
          'scrollbar-width': 'thin',
          'scrollbar-color': '#CBD5E1 transparent',
          /* WebKit */
          '&::-webkit-scrollbar': {
            height: '8px',
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#CBD5E1',
            'border-radius': '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#94A3B8',
          },
        },
        '.pb-safe': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.pt-safe': {
          'padding-top': 'env(safe-area-inset-top)',
        },
      });
    },
  ],
} as Config // Add type assertion to extend config
export default config

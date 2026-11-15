/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: {
          50: '#27272a',
          100: '#1e1e24',
          200: '#18181b',
          300: '#121215',
          400: '#0c0c0e',
        },
        border: {
          subtle: '#27272a',
          muted: '#3f3f46',
          bright: '#52525b',
        },
        accent: {
          emerald: '#10b981',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          rose: '#f43f5e',
          violet: '#8b5cf6',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-emerald': 'glowEmerald 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowEmerald: {
          '0%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(16, 185, 129, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}

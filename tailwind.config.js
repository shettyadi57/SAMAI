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
        navy: {
          950: '#070A14',
          900: '#0B1020',
          800: '#131B33',
          700: '#1A2544',
          600: '#263761',
        },
        surface: {
          dark: '#111827',
          card: '#161F36',
          light: '#F8FAFC',
        },
        brand: {
          emerald: '#10B981',
          'emerald-hover': '#059669',
          cyan: '#38BDF8',
          blue: '#2563EB',
          purple: '#8B5CF6',
        },
        risk: {
          critical: '#EF4444',
          high: '#F97316',
          moderate: '#FACC15',
          low: '#10B981',
        }
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-blue': '0 0 25px -5px rgba(56, 189, 248, 0.35)',
        'glow-card': '0 10px 40px -10px rgba(0, 0, 0, 0.6), 0 0 20px 2px rgba(56, 189, 248, 0.15)',
        'glow-authority': '0 20px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px 2px rgba(56, 189, 248, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#171A1F',
          50: '#F6F7F8',
          100: '#E4E7EB',
          200: '#CBD1D7',
          700: '#2A2E36',
          800: '#20242B',
          900: '#171A1F',
          950: '#0E1013'
        },
        transit: {
          emerald: '#10B981',
          'emerald-dark': '#047857',
          'emerald-light': '#ECFDF5',
          coral: '#F97316',
          'coral-light': '#FFF7ED',
          amber: '#F59E0B',
          'amber-light': '#FEF3C7',
          purple: '#8B5CF6',
          'purple-light': '#F5F3FF',
          bg: '#F6F7F4',
          card: '#FFFFFF',
          border: '#E4E7EC',
          text: '#171A1F',
          'text-muted': '#667085'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}

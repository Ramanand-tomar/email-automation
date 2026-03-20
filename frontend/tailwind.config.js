/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f0ff',
          100: '#e4e2ff',
          200: '#ccc9ff',
          300: '#aba5ff',
          400: '#8878fb',
          500: '#7357f6',
          600: '#6236eb',
          700: '#5428d0',
          800: '#4522aa',
          900: '#3a1e8a',
        },
        accent: {
          400: '#38bdf8',
          500: '#0ea5e9',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #6236eb 0%, #0ea5e9 100%)',
        'card-gradient': 'linear-gradient(135deg, #7357f6 0%, #38bdf8 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow:    '0 0 40px rgba(115, 87, 246, 0.35)',
        'glow-sm': '0 0 20px rgba(115, 87, 246, 0.25)',
      },
    },
  },
  plugins: [],
}

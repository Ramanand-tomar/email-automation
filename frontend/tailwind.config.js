/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        accent: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0f766e 0%, #115e59 60%, #1e293b 100%)',
        'card-gradient': 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow:    '0 0 40px rgba(20, 184, 166, 0.20)',
        'glow-sm': '0 0 20px rgba(20, 184, 166, 0.15)',
      },
    },
  },
  plugins: [],
}

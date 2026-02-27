/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        fuel: {
          50: '#fff8ed',
          100: '#ffefd3',
          200: '#ffdba6',
          300: '#ffc06d',
          400: '#ff9932',
          500: '#ff7d0a',
          600: '#f06200',
          700: '#c74b02',
          800: '#9e3b0b',
          900: '#7f330d',
        },
        slate: {
          950: '#0a0f1a',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
          50: '#f8fafc',
        }
      }
    },
  },
  plugins: [],
}

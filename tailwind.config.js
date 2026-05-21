/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1FBFAD',
          dark: '#169E8E',
          light: '#3FD4C2',
          accent: '#B9F36C',
        },
      },
      borderRadius: {
        card: '20px',
        btn: '14px',
      },
      boxShadow: {
        card: '0 8px 24px -8px rgba(31, 191, 173, 0.18)',
        elevated: '0 16px 40px -12px rgba(31, 191, 173, 0.28)',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
    },
  },
  plugins: [
    function ({ addBase, theme }) {
      addBase({
        'input[type="text"], input[type="email"], input[type="password"], input[type="url"], input[type="search"], textarea': {
          color: theme('colors.gray.900'),
          backgroundColor: theme('colors.white'),
          '&::placeholder': {
            color: theme('colors.gray.500'),
          },
        },
      });
    },
  ],
};
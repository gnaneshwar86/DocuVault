/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Livvic', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f7fa',
          100: '#e4e8f0',
          200: '#cbd4e1',
          300: '#a3b3cc',
          400: '#738cb3',
          500: '#486594',
          600: '#374f76',
          700: '#2d3f5f',
          800: '#25334e',
          900: '#1d273c',
          950: '#121927',
        },
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bbdffd',
          300: '#7cc2fc',
          400: '#36a2fa',
          500: '#0c85eb',
          600: '#0267c7',
          700: '#0352a1',
          800: '#074685',
          900: '#0c3b6e',
          950: '#082548',
        },
      },
    },
  },
  plugins: [],
}

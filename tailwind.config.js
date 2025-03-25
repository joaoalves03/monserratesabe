/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        transitionProperty: {
          'height': 'height'
        },
        primary: {
          100: 'hsl(216, 100%, 90%)',
          200: 'hsl(216, 100%, 80%)',
          300: 'hsl(216, 100%, 70%)',
          400: 'hsl(216, 100%, 60%)',
          500: 'hsl(216, 100%, 50%)',
          600: 'hsl(216, 100%, 40%)',
          700: 'hsl(216, 100%, 30%)',
          800: 'hsl(216, 100%, 20%)',
          900: 'hsl(216, 100%, 10%)'
        },
      }
    },
  },
  plugins: [],
}
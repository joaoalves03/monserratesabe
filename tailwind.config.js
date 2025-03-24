/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: 'hsl(49, 93%, 80%)',
          200: 'hsl(49, 93%, 70%)',
          300: 'hsl(49, 93%, 60%)',
          400: 'hsl(49, 93%, 50%)',
          500: 'hsl(49, 93%, 40%)',
          600: 'hsl(49, 93%, 30%)',
          700: 'hsl(49, 93%, 20%)',
          800: 'hsl(49, 93%, 10%)',
          900: 'hsl(49, 93%, 5%)'
        },
      }
    },
  },
  plugins: [],
}
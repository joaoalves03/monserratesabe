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
          50: 'hsl(200, 23%, 5%)',
          100: 'hsl(202, 22%, 10%)',
          200: 'hsl(199, 22%, 20%)',
          300: 'hsl(200, 22%, 30%)',
          400: 'hsl(200, 22%, 40%)',
          500: 'hsl(200, 22%, 50%)',
          600: 'hsl(200, 22%, 60%)',
          700: 'hsl(200, 22%, 70%)',
          800: 'hsl(199, 22%, 80%)',
          900: 'hsl(202, 22%, 90%)',
          950: 'hsl(200, 23%, 95%)',
        }
      }
    },
  },
  plugins: [],
}
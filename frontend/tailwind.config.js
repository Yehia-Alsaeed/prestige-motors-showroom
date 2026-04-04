/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: '#0F1115',
        section: '#161A20',
        card: '#1E242C',
        primary: '#F5F7FA',
        secondary: '#A7B0BA',
        subtle: '#2C3440',
        gold: '#D6B25E',
        metallic: '#8E9AAF',
      }
    },
  },
  plugins: [],
}

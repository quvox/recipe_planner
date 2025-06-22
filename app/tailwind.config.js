/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic Medium', 'Meiryo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
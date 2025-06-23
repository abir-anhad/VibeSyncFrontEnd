// ==========================================================================================
// file: tailwind.config.js
// ==========================================================================================
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      aspectRatio: {
        '4/3': '4 / 3',
      },
    },
  },
  plugins: [],
}

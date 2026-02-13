/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0e1a',
        'dark-surface': '#131722',
        'dark-surface-light': '#1e2231',
        'dark-border': '#2a2e39',
        'accent-green': '#26a69a',
        'accent-red': '#ef5350',
      }
    },
  },
  plugins: [],
}

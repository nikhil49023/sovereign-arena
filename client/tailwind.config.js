/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#0a0d14',
          panel: '#111520',
          border: '#1e2638',
          accent: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          text: '#e2e8f0',
          muted: '#94a3b8'
        }
      }
    },
  },
  plugins: [],
}

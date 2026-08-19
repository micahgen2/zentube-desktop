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
        background: {
          DEFAULT: '#0f0f11',
          card: '#18181b',
          elevated: '#222227',
          hover: '#2a2a32',
        },
        brand: {
          DEFAULT: '#ef4444',
          hover: '#dc2626',
          light: '#f87171',
          accent: '#8b5cf6',
        },
        zen: {
          bg: '#0a0a0c',
          panel: '#121216',
          border: '#27272a',
          text: '#f4f4f5',
          subtext: '#a1a1aa',
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#060b13',
          card: '#0a0f1b',
          sidebar: '#080d16',
          border: '#1e293b',
        },
        primary: {
          DEFAULT: '#00b4d8', // Cyan accent
          light: '#38bdf8',
          dark: '#075985',
        },
        secondary: {
          DEFAULT: '#1e293b', // Slate background for components
        },
        bsnl: {
          blue: '#005BAA',
          cyan: '#00D2FF',
          light: '#F0F9FF',
        }
      },
      borderRadius: {
        'xl': '12px',
      },
      spacing: {
        '2': '8px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -2px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}

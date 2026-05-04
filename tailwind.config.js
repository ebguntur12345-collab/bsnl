/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#005BAA', // BSNL Blue
          light: '#00B4D8',
          dark: '#002D62',
        },
        secondary: {
          DEFAULT: '#00D2FF', // Vibrant Cyan
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

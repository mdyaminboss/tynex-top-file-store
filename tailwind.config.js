/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#030305',
          900: '#0a0a0f',
          800: '#13131a',
          700: '#1c1c26',
        },
        accent: {
          red: '#ff2a4d',
          blue: '#00f0ff',
        }
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(255, 42, 77, 0.3)',
        'glow-blue': '0 0 20px rgba(0, 240, 255, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
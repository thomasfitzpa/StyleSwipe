/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: '#9b8cff',
          light: '#b8a9ff',
          dark: '#7d6bdb',
        },
        'secondary': {
          DEFAULT: '#47e7c1',
          light: '#6bffd4',
          dark: '#2dc4a1',
        },
        'dark': {
          bg: '#1a1a24',
          card: 'rgba(255, 255, 255, 0.08)',
          light: '#2a2a38',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Inter', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          950: '#040507',
          900: '#080a0e',
          850: '#0e1117',
          800: '#141720',
          700: '#1e222e',
          600: '#2c3242',
        },
        ivory: {
          50: '#faf8f5',
          100: '#f3efe8',
          200: '#e6e0d4',
          300: '#d5cdbd',
          400: '#a89f8d',
          500: '#7d7463',
        },
        crimson: {
          DEFAULT: '#991b1b',
          glow: '#ef4444',
          dark: '#58111a',
          accent: '#b91c1c',
        },
        amber: {
          clue: '#d97706',
          glow: '#f59e0b',
          subtle: '#78350f',
        }
      },
      fontFamily: {
        serif: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Space Grotesk"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'noir-lg': '0 20px 50px rgba(0, 0, 0, 0.85)',
        'crimson-glow': '0 0 25px rgba(185, 28, 28, 0.45)',
        'amber-glow': '0 0 25px rgba(217, 119, 6, 0.35)',
      },
      backgroundImage: {
        'radial-vignette': 'radial-gradient(circle at center, transparent 40%, rgba(4, 5, 7, 0.88) 100%)',
      }
    },
  },
  plugins: [],
}

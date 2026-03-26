/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        canopy: {
          bg:       '#0f1a0f',
          surface:  '#162016',
          surface2: '#1e2d1e',
          border:   '#2a3d2a',
          green:    '#5aad5a',
          soft:     '#3d7a3d',
          accent:   '#a8d5a2',
          muted:    '#8aaa8a',
          warn:     '#d4a843',
          danger:   '#c05a4a',
        },
      },
    },
  },
  plugins: [],
}

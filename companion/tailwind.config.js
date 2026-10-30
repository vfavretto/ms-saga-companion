/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ps2: {
          dark: '#080c18',
          card: '#0c162d',
          border: '#1e3a6c',
          glow: '#00d4ff',
          accent: '#ffb703',
          danger: '#ff3366',
          success: '#00f59b',
          muted: '#5c78a5',
          text: '#e2edff',
        }
      },
      fontFamily: {
        mono: ['Consolas', 'Courier New', 'monospace'],
        display: ['Impact', 'Arial Black', 'sans-serif'],
      },
      boxShadow: {
        'ps2-box': 'inset 2px 2px 0px rgba(255, 255, 255, 0.15), inset -2px -2px 0px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 20, 60, 0.6)',
        'ps2-bevel': 'inset 1px 1px 0px rgba(100, 200, 255, 0.3), inset -1px -1px 0px rgba(0, 0, 0, 0.7)',
        'glow-cyan': '0 0 15px rgba(0, 212, 255, 0.4)',
        'glow-amber': '0 0 15px rgba(255, 183, 3, 0.4)',
        'glow-danger': '0 0 15px rgba(255, 51, 102, 0.5)',
      }
    },
  },
  plugins: [],
}

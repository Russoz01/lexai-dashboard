import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
      colors: {
        brand: {
          50:  '#e8f5ee',
          100: '#c6e6d3',
          200: '#a3d7b8',
          300: '#7fc89d',
          400: '#52b07a',
          500: '#2d6a4f',
          600: '#255a43',
          700: '#1d4a36',
          800: '#153a2a',
          900: '#0d2a1e',
        },
      },
    },
  },
  plugins: [],
}

export default config

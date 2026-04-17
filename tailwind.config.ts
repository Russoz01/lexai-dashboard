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
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(calc(-100% - 3rem))' },
        },
        'marquee-reverse': {
          from: { transform: 'translateX(calc(-100% - 3rem))' },
          to:   { transform: 'translateX(0)' },
        },
        grid: {
          '0%':   { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        marquee: 'marquee var(--duration, 40s) linear infinite',
        'marquee-reverse': 'marquee-reverse var(--duration, 40s) linear infinite',
        grid: 'grid 15s linear infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config

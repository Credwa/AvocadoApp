/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.gutter-xs': `px-2`,
        '.gutter-sm': `px-4`,
        '.gutter-md': `px-6`,
        '.gutter-lg': `px-8`,
        '.text-neutral': 'text-zinc-600 dark:text-zinc-200'
      })
    })
  ],
  theme: {
    screens: {
      sm: '380px',
      md: '420px',
      lg: '680px',
      tablet: '1024px'
    },
    extend: {
      colors: {
        primary: {
          lighter: '#c2aeff',
          light: '#a580ff',
          main: '#8a4dff',
          dark: '#6f16eb'
        },
        secondary: {
          lighter: '#81f4ab',
          light: '#43e57e',
          main: '#1bd760',
          dark: '#0faa48',
          darker: '#10853c'
        },
        dark: {
          background: '#0d0d0d',
          card: '#171717',
          input: '#333333'
        }
      }
    }
  }
}

// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        baby: {
          accent: 'var(--baby-accent)',
          soft: 'var(--baby-soft)',
          dark: 'var(--baby-dark)',
          text: 'var(--baby-text)'
        },
        cardbg: 'var(--card-bg)'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem'
      }
    },
  },
  plugins: [],
}
const defaultTheme = require('tailwindcss/defaultTheme')
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    fontFamily: {
      sans: ['Roboto', 'monospace'],
      serif: ['Inconsolata', 'monospace'],
      display: ['Orbitron', 'sans-serif'],
      body: ['Inconsolata', 'monospace'],
      mono: ['Inconsolata', 'Roboto Mono', 'monospace'],
      copy: ['Roboto', 'Arial', 'sans-serif'],
    },
    screens: require('./tailwind.screens'),
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-lighter': 'var(--primary-lighter)',
        'primary-lightest': 'var(--primary-lightest)',
        inactive: 'var(--inactive)',
        success: 'var(--success)',
        'primary-darker': 'var(--primary-darker)',
        error: 'red',
        lines: 'var(--lines)',
        copy: 'var(--copy)',
        label: 'var(--label)',
        background: {
          dark: 'var(--bg-dark)',
          'dark-02': 'var(--bg-dark-02)',
          'dark-05': 'var(--bg-dark-05)',
          'dark-09': 'var(--bg-dark-09)',
        },
      },
      fontSize: {
        display: 'clamp(0px, 8.2vw, 132px)',
        xxs: ['0.6rem', '.8rem'],
      },
      letterSpacing: {
        button: '0.2rem',
        label: '0.1rem',
      },
      animation: {
        'blink-slow': 'blink-slow 2s linear infinite',
        'blink-normal': 'blink-slow 0.8s linear infinite',
        'fui-flash': 'fui-flash 0.3s ease-in 3',
        shake: 'shake 0.07s linear infinite',
      },
      dropShadow: {
        glow: 'var(--golden-glow)',
        "glow-harder": 'var(--golden-glow-harder)',
      },
      keyframes: {
        shake: {
          '0%, 100%': {
            transform: 'translate3d(0, 0, 0)',
            textShadow: '0 0 0 transparent, 0 0 0 transparent, 0 0 0 transparent',
          },
          '25%': {
            transform: 'translate3d(-1px, 0, 0)',
            textShadow: '-2px 0 0 var(--primary), 0 0 0 transparent, 0 0 0 transparent',
          },
          '50%': {
            transform: 'translate3d(1px, 0, 0)',
            textShadow: '0 0 0 transparent, 2px 0 0 green, 0 0 0 transparent',
          },
          '75%': {
            transform: 'translate3d(-1px, 0, 0)',
            textShadow: '0 0 0 transparent, 0 0 0 transparent, 2px 0 0 blue',
          },
        },
        'blink-slow': {
          '0%': { opacity: '0' },
          '49%': { opacity: '0' },
          '50%': { opacity: '1' },
          '99%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'fui-flash': {
          '0%, 100%': {
            opacity: '1',
            transform: 'none',
            filter: 'none',
          },
          '10%, 30%, 50%, 70%, 90%': {
            opacity: '0',
            transform: 'translate(-5px, 5px) scaleY(1.6) skew(-5deg, 5deg)',
            filter: 'hue-rotate(180deg) brightness(1.5)',
          },
          '20%, 40%, 60%, 80%': {
            opacity: '1',
            transform: 'translate(5px, -5px) scaleY(0.4) skew(5deg, -5deg)',
            filter: 'hue-rotate(-180deg) brightness(0.5)',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/container-queries')],
}

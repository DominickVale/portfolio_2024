const defaultTheme = require('tailwindcss/defaultTheme')
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    fontFamily: {
      sans: ['Roboto'],
      serif: ['Inconsolata'],
      display: ['Orbitron'],
      body: ['Inconsolata'],
      mono: ['Inconsolata', 'Roboto Mono'],
      copy: ['Roboto', 'Arial'],
    },
    screens: {
      xs: '420px',
      ...defaultTheme.screens,
      tall: { raw: '((min-height: 500px) and (min-width: 640px))' },
      taller: { raw: '((min-height: 650px) and (min-width: 640px))' },
      'laptop-h': { raw: '((min-height: 720px) and (min-width: 1024px))' },
    },
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-lightest': 'var(--primary-lightest)',
        inactive: 'var(--inactive)',
        success: 'var(--success)',
        'primary-darker': 'var(--primary-darker)',
        error: 'red',
        lines: 'var(--lines)',
        copy: 'var(--copy)',
        background: {
          dark: 'var(--bg-dark)',
          'dark-02': 'var(--bg-dark-02)',
          'dark-light': 'var(--bg-dark-light)',
          'dark-lightest': 'var(--bg-dark-lightest)',
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
        'fui-flash': 'fui-flash 0.8s ease-in',
      },
      keyframes: {
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

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
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
          "dark-02": 'var(--bg-dark-02)',
          "dark-light": 'var(--bg-dark-light)',
        },
      },
      fontFamily: {
        sans: ['Roboto'],
        serif: ['Inconsolata'],
        display: ['Orbitron'],
        body: ['Inconsolata'],
        mono: ['Inconsolata', 'Roboto Mono'],
        copy: ['Roboto', 'Arial']
      },
      fontSize: {
        display: 'clamp(0px, 8.2vw, 132px)',
        xxs: ['0.6rem', '.8rem'],
      },
      letterSpacing: {
        button: '0.2rem',
      },
      animation: {
        'blink-slow': 'blink-slow 2s linear infinite',
        'blink-normal': 'blink-slow 0.8s linear infinite',
      },
      keyframes: {
        'blink-slow': {
          '0%': { opacity: '0' },
          '49%': { opacity: '0' },
          '50%': { opacity: '1' },
          '99%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      screens: {
        xs: '420px',
        tall: { raw: '((min-height: 500px) and (min-width: 640px))' },
        taller: { raw: '((min-height: 650px) and (min-width: 640px))' },
        "laptop-h": { raw: '((min-height: 720px) and (min-width: 1024px))' },
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}

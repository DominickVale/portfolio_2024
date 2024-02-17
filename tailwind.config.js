/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: "#FF3D00",
        inactive: "#a7a7a7",
        success: "#96D800",
        background: {
          dark: "#111010",
        },
      },
      fontFamily: {
        sans: ['Roboto'],
        serif: ['Inconsolata'],
        display: ['Orbitron'],
        body: ['Inconsolata'],
        mono: ['Inconsolata', 'Roboto Mono']
      },
      fontSize: {
        display: "clamp(0px, 8.2vw, 132px)",
        xxs:[ "0.6rem", ".8rem"]
      },
       animation: {
        'blink-slow': 'blink-slow 2s linear infinite',
      },
      keyframes: {
        'blink-slow': {
          '0%': { opacity: '0' },
          '49%': { opacity: '0' },
          '50%': { opacity: '1' },
          '99%': { opacity: '1' },
          '100%': { opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}

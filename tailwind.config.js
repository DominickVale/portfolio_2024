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
        display: "clamp(0px, 8.2vw, 132px)"
      }
    },
  },
  plugins: [],
}

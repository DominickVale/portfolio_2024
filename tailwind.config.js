/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        // Simple 16 column grid
        'layout-lg': "1fr repeat(10, minmax(5rem, 7rem)) 1fr",
        'layout-md': "1fr repeat(5, minmax(5rem, 7rem)) 1fr",
        'layout-sm': "1fr 1fr 1fr 1fr",
      },
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

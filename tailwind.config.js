/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        // Simple 16 column grid
        layout: "1fr repeat(10, 7rem) 1fr",
      },
      colors: {
        primary: "#FF3D00",
        background: {
          dark: "#111010",
        },
      },
      fontFamily: {
        sans: ['Inconsolata'],
        serif: ['Inconsolata'],
        display: ['Orbitron'],
        body: ['Inconsolata'],
      },
    },
  },
  plugins: [],
}

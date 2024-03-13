import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import glsl from "vite-plugin-glsl";

import mdx from "@astrojs/mdx";

const plugins = [
  glsl({
    include: [
      "**/*.glsl",
      "**/*.vert",
      "**/*.frag",
    ],
    exclude: undefined, // Glob pattern, or array of glob patterns to ignore
    warnDuplicatedImports: true, // Warn if the same chunk was imported multiple times
    defaultExtension: "glsl", // Shader suffix when no extension is specified
    compress: true, // Compress output shader code
    watch: true, // Recompile shader on change
    root: "/", // Directory for root imports
  }),
];

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), mdx()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "load"
  },
  vite: {
    plugins
  }
});

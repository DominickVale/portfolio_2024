# TODOs

- check @TODOS.
- Reduced animations for prefer-reduced-motion
- Optimize imports (no import \* from ...) (also split js into as many independent chunks as possible)
- Test accessibility
- Figure out some hacks for font rendering
- Add more post-processing (blur/aberration on transitions based on position speed etc.)
- Add preload when dragging thumb after 50% of progress in a slice

# REMINDERS

- Sounds should mainly be comprised of lower frequencies, try to make them only hearable headphone users

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

import PrettierConf from 'eslint-config-prettier'
import AstroPlugin from 'eslint-plugin-astro'
import PrettierPlugin from 'eslint-plugin-prettier'

const eslintconfig = [
  PrettierConf,
  {
    plugins: {
      astro: AstroPlugin,
      prettier: PrettierPlugin,
    },
    rules: {
      'no-unused-vars': 'error',
    },
  },
]

export default eslintconfig

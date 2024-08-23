import { BlendFunction } from 'postprocessing'

export const ICON_IDS = ['home', 'works', 'about', 'blog', 'settings', 'brand', 'lab', 'copy', 'contact', 'context-menu', 'debug', 'audio', 'visit', 'close'] as const

export const SVGNS = 'http://www.w3.org/2000/svg'

export const EMAIL = 'holla@domenicovale.it'

export const PROJECTS_LIST = [
  {
    name: 'ambientify',
    linkWebsite: 'https://play.google.com/store/apps/details?id=com.dominickv.ambientify&hl=en_US',
    linkCase: '/blog/ambientify',
    image: 'ambientify-thumbnail',
    data: {
      role: 'EVERYTHING',
      client: 'N/A',
      year: '2020—ONGOING',
      tech: 'REACT-NATIVE, FIREBASE, ANDROID NDK, JSI, C++, REVENUECAT, KOTLIN',
    },
  },
  {
    name: 'vidra',
    linkWebsite: 'https://web.archive.org/web/20210727234808/https://www.vidra.com/',
    linkCase: '/blog/vidra',
    image: 'vidra-thumbnail',
    data: {
      role: 'FRONT-END',
      client: 'Bemind.me',
      year: '2020—2021',
      tech: 'REACT-NATIVE, REACT, HANDLEBARS, SASS, NEXTJS',
    },
  },
  {
    name: 'e-corp ctf',
    linkWebsite: 'https://ecorp.ctf.intigriti.io',
    linkCase: '/blog/e-corp-ctf',
    image: 'ecorp-thumbnail',
    data: {
      role: 'EVERYTHING',
      client: 'Intigriti.com',
      year: '2023',
      tech: 'REACT, NEXTJS, GRAPHQL, POTHOS, TAILWIND, APOLLO, MDX, GSAP, THREEJS, DOCKER-COMPOSE, BASH, PUPPETEER',
    },
  },
  {
    name: 'portfolio v1',
    linkWebsite: 'https://domenicovale.netlify.app',
    linkCase: '/blog/portfolio-v1',
    image: 'portfolio1-thumbnail',
    data: {
      role: 'EVERYTHING',
      client: 'N/A',
      year: '2019',
      tech: 'GATBSY, REACT, STYLED-COMPONENTS, GSAP',
    },
  },
] as const

export const LORENZ_PRESETS = {
  default: {
    sigma: 10,
    rho: 28,
    beta: 8 / 3,
    speed: 5,
    dt: 0.01,
    lorenzColor: 'rgb(255, 176, 102)',
    bloomIntensity: 14,
    bloomLuminanceThreshold: 0,
    bloomLuminanceSmoothing: 0,
    bloomRadius: 0.64,
    bloomBlendFunction: BlendFunction.MULTIPLY,
  },
  golden2: {
    lorenzColor: 'rgb(255,124,0)',
    chromaticAberration: 0,
    bloomIntensity: 8,
    bloomLuminanceThreshold: 0,
    bloomLuminanceSmoothing: 0,
    bloomRadius: 0.85,
    bloomBlendFunction: BlendFunction.ADD,
  },
  collapsed: {
    sigma: 100,
    rho: -100,
    beta: 8 / 3,
    speed: 5,
    dt: 0.01,
    rotationX: 0.0502654824574367,
    rotationY: 0,
    rotationZ: -0.8733,
    positionX: -0.22,
    positionZ: 25,
    positionY: 10,
  },
  collapsedAfter: {
    sigma: 100,
    rho: 100,
    beta: 8 / 3,
    speed: 5,
    dt: 0.01,
    rotationX: 0.0502654824574367,
    rotationY: 0,
    rotationZ: -0.8733,
    positionX: 0.5,
    positionY: 10,
    positionZ: 25,
    bloomIntensity: 100,
  },
}

export const INPUT_SOUND_SPRITES = {
  '0': [0, 119.97732426303854],
  '1': [1200.0000000000002, 129.97732426303844],
  '2': [2400.0000000000005, 124.94331065759656],
}

export const TITLE_REVEAL_SOUND_SPRITES = {
  '0': [0, 1079.9773242630386],
  '1': [2200, 1879.9773242630388],
  '2': [4400, 2079.977324263039],
}

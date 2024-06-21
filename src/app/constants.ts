import { BlendFunction } from 'postprocessing'

export const ICON_IDS = ['home', 'works', 'about', 'blog', 'settings', 'brand', 'lab', 'copy', 'contact', 'context-menu', 'debug', 'audio'] as const

export const SVGNS = 'http://www.w3.org/2000/svg'

export const EMAIL = 'holla@domenicovale.it'

export const PROJECTS_LIST = [
  {
    name: 'ambientify',
    linkWebsite: 'https://play.google.com/store/apps/details?id=com.dominickv.ambientify&hl=en_US',
    linkCase: '/blog/ambientify',
    image: 'ambientify1',
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
    image: 'ecorp',
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
    image: 'ecorp',
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
    image: 'reggaecat',
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
    positionY: 4.5,
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
    positionY: 4.5,
    positionZ: 25,
    bloomIntensity: 100,
  },
}

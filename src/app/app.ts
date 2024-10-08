import Cursor from './modules/Cursor'
import Menus from './modules/Menus'
import TextScramble from './modules/animations/TextScramble'
import Experience from './gl/Experience'
import { $, $all, showCursorMessage } from './utils'
import Typewriter from './modules/animations/Typewriter'
import Animations from './modules/animations'
import { Core as TaxiCore } from '@dominickvale/taxi'
import DefaultRenderer from './modules/renderers/base'
import DefaultTransition from './modules/transitions/base'
import WorksRenderer from './modules/renderers/WorksRenderer'
import FromWorkTransition from './modules/transitions/fromWorks'
import BlogRenderer from './modules/renderers/BlogRenderer'
import FromBlogTransition from './modules/transitions/fromBlog'
import ContactsRenderer from './modules/renderers/ContactsRenderer'
import FromContactsTransition from './modules/transitions/fromContacts'
import HomeRenderer from './modules/renderers/HomeRenderer'
import BlogArticleRenderer from './modules/renderers/BlogArticleRenderer'
import FromBlogArticleTransition from './modules/transitions/fromBlogArticle'
import AboutRenderer from './modules/renderers/AboutRenderer'
import FromAboutTransition from './modules/transitions/fromAbout'
import Preloader from './modules/Preloader'
import FromHomeTransition from './modules/transitions/fromHome'
import Audio from './modules/AudioWrapper'
import * as THREE from 'three'
import WipRenderer from './modules/renderers/WipRenderer'
import FromWIPTransition from './modules/transitions/fromWIP'

export default class App {
  experience: Experience
  menus: Menus
  cursor: Cursor
  scrambles: TextScramble
  typewriter: Typewriter
  taxi: TaxiCore
  isTransitioning: boolean
  isFirstTime: boolean
  preloaderFinished: Boolean
  preloader: Preloader
  overridePreloader: boolean
  audio: Audio
  reducedMotion: boolean
    animations: Animations

  constructor(public debug = false) {
    //@TODO: use cache check
    this.isFirstTime = !localStorage.getItem('visited')
    this.preloaderFinished = false
    window.app = this
    // used for debugging purposes, skips intro
    window.app.overridePreloader = import.meta.env.PUBLIC_DEBUG_OVERRIDE_PRELOADER
    this.isTransitioning = true
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.cursor = new Cursor()
    this.experience = new Experience($('#webgl') as HTMLCanvasElement, this.cursor)
    this.menus = new Menus(this.onToggleDebug.bind(this))
    this.scrambles = new TextScramble()
    this.typewriter = new Typewriter()
    this.preloader = new Preloader()
    this.animations = new Animations()
    this.animations.init(this.cursor, this.experience)

    this.audio = new Audio()

    this.taxi = new TaxiCore({
      allowInterruption: false,
      reloadCssFilter: (element) => true,
      transitions: {
        default: DefaultTransition,
        fromWIP: FromWIPTransition,
        fromWorks: FromWorkTransition,
        fromBlog: FromBlogTransition,
        fromContacts: FromContactsTransition,
        fromBlogArticle: FromBlogArticleTransition,
        fromAbout: FromAboutTransition,
        fromHome: FromHomeTransition,
      },
      renderers: {
        default: HomeRenderer,
        about: AboutRenderer,
        works: WorksRenderer,
        blog: BlogRenderer,
        contact: ContactsRenderer,
        blogArticle: BlogArticleRenderer,
        lab: WipRenderer,
        '404': WipRenderer,
      },
    })
    this.taxi.on('NAVIGATE_IN', ({ to, trigger }) => {
      this.menus.reload()
      this.scrambles.reload()
      this.cursor.reload()

      const currentUrl = window.location.href
      $all('nav li a').forEach((link, i) => {
        const l = link as HTMLAnchorElement
        if (l.href === currentUrl || (l.href.includes('blog') && currentUrl.includes('blog'))) {
          l.classList.add('active')
        } else {
          l.classList.remove('active')
        }
      })

      // recompute audio events
      this.audio.setupEvents()
    })

    // stop any playing looping audio still playing while transitioning
    this.taxi.on('NAVIGATE_OUT', ({ to, trigger }) => {
      window.app.audio.activeSounds.forEach(s => {
        if(s?.loop() && s.id != "background"){
          window.app.audio.stop(s.id)
        }
      })
    })

    this.taxi.addRoute('/works', '.*', 'fromWorks')
    this.taxi.addRoute('/about.*', '.*', 'fromAbout')
    this.taxi.addRoute('/blog/.*', '.*', 'fromBlogArticle')
    this.taxi.addRoute('/blog', '.*', 'fromBlog')
    this.taxi.addRoute('/contact', '.*', 'fromContacts')
    this.taxi.addRoute('/', '.*', 'fromHome')
    this.taxi.addRoute('.*', '.*', 'fromWIP')

    if (!this.preloaderFinished) this.preloader.init()
  }

  onToggleDebug() {
    if (this.debug) {
      this.debug = false
      this.experience.debug.stop()
    } else {
      this.debug = true
      this.experience.debug.start()
    }
  }
}

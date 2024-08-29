import { $, $all, debounce, fitTextToContainerScr, getZPosition } from '../../utils'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

import Experience from '../../gl/Experience'
import BaseRenderer from './base'
import { TypewriterPlugin } from '../animations/TypeWriterPlugin'
import { blurStagger } from '../animations/gsap'
import Lenis from 'lenis'
import { LORENZ_PRESETS } from 'src/app/constants'
import { CustomEase } from 'gsap/all'
gsap.registerPlugin(TypewriterPlugin)
gsap.registerPlugin(CustomEase)

export default class BlogRenderer extends BaseRenderer {
  currIdx: number
  oldIdx: number
  aIds: string[]
  experience: Experience
  tlStack: gsap.core.Timeline[]
  isFirstRender: boolean
  articles: HTMLElement[]
  static enterTL: gsap.core.Timeline
  handleActiveArticleBound: (event: UIEvent) => void
  lenis: Lenis

  initialLoad() {
    super.initialLoad()
  }

  onEnter() {
    super.onEnter()
    this.currIdx = 0
    this.oldIdx = 0
    this.isFirstRender = true

    this.experience = new Experience()

    this.articles = Array.from($all('.blog-article'))
    this.aIds = this.articles.map((a) => a.id)
    this.tlStack = []

    this.resizeTitles()

    BaseRenderer.resizeHandlers.push(this.resizeTitles.bind(this))
    BaseRenderer.resizeHandlers.push(this.handleLorenzResize.bind(this))

    this.handleActiveArticleBound = this.handleActiveArticle.bind(this)
    this.articles.forEach((article) => {
      article.addEventListener('focus', this.handleActiveArticleBound)
      article.addEventListener('mouseover', this.handleActiveArticleBound)
      article.addEventListener('touchstart', this.handleActiveArticleBound)
    })

    this.prepareAnimations()
    this.createEnterAnim()
    if (window.app.preloaderFinished) {
      BlogRenderer.enterTL.play()
    } else {
      window.addEventListener('preload-end', () => {
        BlogRenderer.enterTL.play()
      })
    }
  }

  onEnterCompleted() {
    // run after the transition.onEnter has fully completed
  }

  onLeave() {
    // run before the transition.onLeave method is called
    window.removeEventListener('wheel', this.handleActiveArticleBound)
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    this.lenis.destroy()
  }

  onLeaveCompleted() {
    // run after the transition.onleave has fully completed
  }

  ////////////////////////////////

  handleMouseMove(event) {
    const gradientOverlay = $('.gradient-overlay', event.currentTarget)
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    gradientOverlay.style.opacity = '0.1'
    gradientOverlay.style.setProperty('--x', `${x}px`)
    gradientOverlay.style.setProperty('--y', `${y}px`)
  }

  handleMouseLeave(event) {
    if (Number(event.target.id) === this.currIdx) return
    const gradientOverlay = $('.gradient-overlay', event.target)
    gradientOverlay.style.opacity = '0'
  }

  handleActiveArticle(e) {
    let oldActive: HTMLElement
    this.currIdx = Number(e?.currentTarget?.id || 0)
    const shouldAnimate = this.currIdx !== this.oldIdx
    if (this.oldIdx !== this.currIdx) {
      oldActive = this.articles[this.oldIdx]
      oldActive.classList.remove('active')
    }

    const active = this.articles[this.currIdx]
    active.classList.add('active')

    const fuiCornersActive = $('.fui-corners-2', active)
    const fuiCornersOld = $('.fui-corners-2', oldActive)

    this.tlStack.forEach((tl) => {
      tl.seek('end')
      tl.kill()
    })
    this.tlStack = []

    if (!shouldAnimate && !this.isFirstRender) return
    active.classList.add('active')
    this.isFirstRender = false

    if (oldActive) {
      oldActive.classList.remove('active')
      gsap
        .timeline({})
        .to($('.article-description', oldActive), { height: 0 })
        .to(
          $('.gradient-overlay', oldActive),
          {
            alpha: 0,
            duration: 0.2,
          },
          '<',
        )
        .to(
          fuiCornersOld,
          {
            alpha: 0,
            repeat: window.app.reducedMotion ? 1 : 4,
            duration: 0.06,
          },
          '<',
        )
        .to(fuiCornersOld, { scale: 0, duration: 0.3 }, '<+80%')
    }
    const gradientOverlay = $('.gradient-overlay', active)
    gradientOverlay.style.setProperty('--x', '50%')
    gradientOverlay.style.setProperty('--y', '50%')

    this.tlStack.push(
      gsap
        .timeline()
        .to($('.article-description', active), {
          height: 'auto',
          duration: 0.25,
        })
        .to(
          $('.article-description p:not(.shadow-description)', active),
          {
            typewrite: {
              charClass: 'text-primary-lightest drop-shadow-glow',
              maxScrambleChars: 3,
              soundOptions: {
                volume: 0,
              },
            },
            duration: 2,
            ease: 'circ.out',
          },
          '<',
        )
        .fromTo(
          fuiCornersActive,
          { scale: 0 },
          {
            scale: 1,
            duration: 0.3,
          },
          '<',
        )
        .to(
          fuiCornersActive,
          {
            alpha: 1,
            repeat: window.app.reducedMotion ? 1 : 6,
            duration: 0.06,
          },
          '<+50%',
        )
        .to(
          gradientOverlay,
          {
            alpha: 0.1,
            duration: 0.2,
          },
          '<',
        )
        .addLabel('end'),
    )
    this.oldIdx = this.currIdx
  }

  createLenis(scrollWrapper: HTMLElement | (Window & typeof globalThis), isHorizontal: boolean, onScroll?: Function) {
    if (this.lenis) {
      gsap.ticker.remove(this.updateScroll)
      this.lenis.destroy()
      this.lenis = null
    }

    this.lenis = new Lenis({
      wrapper: scrollWrapper,
      duration: 2,
      smoothWheel: true,
      orientation: isHorizontal ? 'horizontal' : 'vertical',
      eventsTarget: window,
    })
    this.lenis.on('scroll', ScrollTrigger.update)
    if (onScroll) this.lenis.on('scroll', onScroll)
    gsap.ticker.add(this.updateScroll.bind(this))
  }

  updateScroll(time: number) {
    this.lenis?.raf(time * 1000)
  }

  resizeTitles() {
    this.articles.forEach((article) => {
      const articleTitleEl = $('.article-title', article)
      const fontSizeChanged = fitTextToContainerScr(articleTitleEl, articleTitleEl, 2)
      if (fontSizeChanged) articleTitleEl.style.lineHeight = 160 + articleTitleEl.innerHTML.split('').length - fontSizeChanged + '%'
      article.addEventListener('mousemove', this.handleMouseMove.bind(this))
      article.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
    })

    const aspect = window.innerWidth / window.innerHeight
    const isHorizontal = aspect >= 1
    const scrollWrapper = isHorizontal ? $('#posts-container') : window

    this.createLenis(scrollWrapper, isHorizontal)
  }

  //@TODO: remove from here, put in base, use `this.attractorZOffset`
  handleLorenzResize() {
    const attractor = this.experience.world.attractor
    this.experience.params.positionZ = getZPosition()
    const aspect = window.innerWidth / window.innerHeight
    const newY = aspect > 1 ? this.experience.params.positionY : this.experience.params.positionY - window.innerHeight / 100
    gsap.to(attractor.points.position, { z: this.experience.params.positionZ, y: newY, duration: 0.25, ease: 'power4.out' })
  }

  ///////// ANIMS ////////////
  prepareAnimations() {
    const subtitle = $('#blog-header h2')
    gsap.ticker.lagSmoothing(0)
    gsap.set(subtitle, { autoAlpha: 0 })
  }

  createEnterAnim() {
    const statusItems = $all('#blog-header #blog-status li')
    const lettersTL = blurStagger($('h1'), {duration: 0.08, delay: 0.5})
    const subtitle = $('#blog-header h2')

    BlogRenderer.enterTL = gsap
      .timeline({ paused: true })
      .fromTo(
        '#blog-header',
        {
          x: window.app.reducedMotion ? undefined : '-50vw',
          opacity: window.app.reducedMotion ? 0 : undefined,
        },
        {
          x: window.app.reducedMotion ? undefined : 0,
          opacity: window.app.reducedMotion ? 1 : undefined,
          duration: 1.35,
          ease: 'power4.inOut',
        },
        '<',
      )
      .add(lettersTL, '<')
      .to(
        statusItems,
        {
          typewrite: {
            speed: 0.3,
            charClass: 'text-primary-lightest',
            soundOptions: {
              volume: 0,
            },
          },
          ease: 'power4.inOut',
          onStart: () => {
            setTimeout(() => {
              this.handleActiveArticle(null)
            }, 500)
          },
        },
        '<',
      )
      .to(
        subtitle,
        {
          typewrite: {
            speed: 0.6,
            charClass: 'text-primary-lightest drop-shadow-glow',
            soundOptions: {
              volume: 0.25,
              rate: 1.3,
            },
          },
          ease: 'power4.inOut',
          onStart: function () {
            gsap.set(this.targets()[0], { autoAlpha: 1 })
          },
        },
        '<+30%',
      )
      .fromTo(
        this.articles,
        { opacity: 0 },
        {
          opacity: 1,
          duration: window.app.reducedMotion ? 2 : 0.05,
          stagger: {
            repeat: window.app.reducedMotion ? 0 : 20,
            each: window.app.reducedMotion ? 0.2 : 0.1,
          },
        },
        '<+50%',
      )

    gsap
      .timeline({
        scrollTrigger: {
          trigger: '#blog-header',
          start: 'top top',
          scrub: true,
        },
      })
      .to('.nav-link', {
        opacity: 0,
        duration: 1,
      })
  }
}

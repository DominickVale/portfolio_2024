import { $, $all, debounce, fitTextToContainerScr } from '../../utils'
import gsap from 'gsap'
gsap.registerPlugin(TypewriterPlugin)

import Experience from '../../gl/Experience'
import BaseRenderer from './base'
import { TypewriterPlugin } from '../animations/TypeWriterPlugin'

export default class WorksRenderer extends BaseRenderer {
  currIdx: number
  isDesktop: boolean
  projects: Record<string, { element: HTMLElement; fontSize: number; image: string }>
  pIds: string[]
  experience: Experience
  debouncedHandleResizeFn: Function
  onResizeBound: (event: UIEvent) => void
  tl: gsap.core.Timeline
  isFirstRender: boolean
  canChange: boolean
  articles: HTMLElement[]

  initialLoad() {
    super.initialLoad()
    this.onEnter()
    this.onEnterCompleted()
  }

  onEnter() {
    super.onEnter()
    this.isFirstRender = true
    this.isDesktop = window.innerWidth > 1024

    this.debouncedHandleResizeFn = debounce(this.handleResize.bind(this), 200)
    this.onResizeBound = this.onResize.bind(this)
    const statusItems = $all('#blog-header #blog-status li')
    const subtitle = $('#blog-header h2')
    const articles = $all('article')
    this.articles = Array.from(articles)

    articles.forEach((article) => {
      const articleTitleEl = $('.article-title', article)
      const fontSizeChanged = fitTextToContainerScr(articleTitleEl, articleTitleEl, 2)
      if (fontSizeChanged) articleTitleEl.style.lineHeight = 'unset'
      article.addEventListener('mousemove', this.handleMouseMove.bind(this))
      article.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
    })

    window.addEventListener('resize', this.onResizeBound)
    this.experience = new Experience()
    const links = Array.from($all('.posts-container a'))
    const tl = gsap.timeline({})

    tl.fromTo(
      '#blog-header',
      {
        x: '-50vw',
      },
      {
        x: 0,
        duration: 1.35,
        ease: 'power4.inOut',
      },
    )
      .to(statusItems, {
        typewrite: {
          speed: 0.3,
          charClass: 'text-primary-lightest',
        },
        ease: 'power4.inOut',
      }, "<")
      .to(subtitle, {
        typewrite: {
          speed: 0.6,
          charClass: 'text-primary-lightest',
        },
        ease: 'power4.inOut',
      }, "<+30%")
      .fromTo(
      links,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.05,
        stagger: {
          repeat: 20,
          each: 0.1,
        },
      },
      '<+50%',
    )
  }

  onEnterCompleted() {
    // run after the transition.onEnter has fully completed
  }

  onLeave() {
    // run before the transition.onLeave method is called
    window.removeEventListener('resize', this.onResizeBound)
    this.articles.forEach((article) => {
      article.removeEventListener('mousemove', this.handleMouseMove)
      article.removeEventListener('mouseleave', this.handleMouseLeave)
    })
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

    gradientOverlay.style.opacity = '1'
    gradientOverlay.style.setProperty('--x', `${x}px`)
    gradientOverlay.style.setProperty('--y', `${y}px`)
  }

  handleMouseLeave(event) {
    const gradientOverlay = $('.gradient-overlay', event.target)
    gradientOverlay.style.opacity = '0'
  }

  onResize(...args) {
    this.debouncedHandleResizeFn(...args)
  }

  handleResize() {
    this.isDesktop = window.innerWidth > 1024
  }
}

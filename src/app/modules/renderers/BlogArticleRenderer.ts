import { $, $all, debounce, fitTextToContainerScr, showCursorMessage } from '../../utils'
import gsap from 'gsap'

import Experience from '../../gl/Experience'
import BaseRenderer from './base'
import { TypewriterPlugin } from '../animations/TypeWriterPlugin'
gsap.registerPlugin(TypewriterPlugin)

export default class BlogRenderer extends BaseRenderer {
  currIdx: number
  oldIdx: number
  aIds: string[]
  experience: Experience
  tlStack: gsap.core.Timeline[]
  isFirstRender: boolean
  canChange: boolean
  articles: HTMLElement[]
  handleActiveArticleBound: (event: UIEvent) => void

  initialLoad() {
    super.initialLoad()
  }

  onEnter() {
    super.onEnter()
    this.canChange = false
    this.currIdx = 0
    this.oldIdx = 0
    this.isFirstRender = true
    this.isDesktop = window.innerWidth > 1024

    const statusItems = $all('#blog-header #blog-status li')
    const subtitle = $('#blog-header h2')
    this.articles = Array.from($all('.blog-article'))
    this.aIds = this.articles.map((a) => a.id)
    this.tlStack = []

    this.articles.forEach((article) => {
      const articleTitleEl = $('.article-title', article)
      const fontSizeChanged = fitTextToContainerScr(articleTitleEl, articleTitleEl, 2)
      if (fontSizeChanged) articleTitleEl.style.lineHeight = 'unset'
      article.addEventListener('mousemove', this.handleMouseMove.bind(this))
      article.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
    })

    this.handleActiveArticleBound = this.handleActiveArticle.bind(this)
    window.addEventListener('wheel', this.handleActiveArticleBound)
    this.experience = new Experience()
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
      .to(
        statusItems,
        {
          typewrite: {
            speed: 0.3,
            charClass: 'text-primary-lightest',
          },
          ease: 'power4.inOut',
          onComplete: () => {
            this.canChange = true
            this.handleActiveArticle(null)
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
          },
          ease: 'power4.inOut',
        },
        '<+30%',
      )
      .fromTo(
        this.articles,
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
    window.removeEventListener('wheel', this.handleActiveArticleBound)
    this.articles.forEach((article) => {
      article.removeEventListener('mousemove', this.handleMouseMove)
      article.removeEventListener('mouseleave', this.handleMouseLeave)
    })
  }

  onLeaveCompleted() {
    // run after the transition.onleave has fully completed
  }

  ////////////////////////////////
  onHoverArticle(e) {
    console.log(e.target)
  }
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
    if (!this.canChange) return
    if (typeof e?.deltaY !== 'undefined') {
      const direction = e.deltaY > 0 ? 'down' : 'up'
      if (direction === 'down') {
        this.currIdx = (this.currIdx + 1) % this.aIds.length
      } else {
        this.currIdx = this.currIdx - 1
        this.currIdx = this.currIdx < 0 ? this.aIds.length - 1 : this.currIdx
      }
    }

    this.canChange = false
    let oldActive
    if (this.oldIdx !== this.currIdx) {
      oldActive = this.articles[this.oldIdx]
      oldActive.classList.remove('active')
    }

    const active = this.articles[this.currIdx]
    active.classList.add('active')
    const container = active.parentElement
    const containerRect = container.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()

    const scrollLeft = container.scrollLeft + (activeRect.left - containerRect.left) - (containerRect.width / 2 - activeRect.width / 2)

    container.scroll({
      left: scrollLeft,
      behavior: 'smooth',
    })

    const fuiCornersActive = $('.fui-corners-2', active)
    const fuiCornersOld = $('.fui-corners-2', oldActive)

    this.tlStack.forEach((tl) => {
      tl.seek('end')
      tl.kill()
    })
    this.tlStack = []

    active.classList.add('active')

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
            onComplete: () => {
              this.canChange = true
            },
          },
          '<',
        )
        .to(
          fuiCornersOld,
          {
            alpha: 0,
            repeat: 4,
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
          $('.article-description p', active),
          {
            typewrite: {
              charClass: 'text-primary-lightest drop-shadow-glow',
              maxScrambleChars: 3,
            },
            duration: 2,
            ease: 'circ.out',
          },
          '<',
        )
        .from(
          active,
          {
            alpha: 0.5,
            repeat: 6,
            duration: 0.045,
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
          '<+50%',
        )
        .to(
          fuiCornersActive,
          {
            alpha: 1,
            repeat: 6,
            duration: 0.06,
          },
          '<+50%',
        )
        .to(
          gradientOverlay,
          {
            alpha: 0.1,
            duration: 0.2,
            onComplete: () => {
              this.canChange = true
            },
          },
          '<',
        )
        .addLabel('end'),
    )
    this.oldIdx = this.currIdx
  }
}

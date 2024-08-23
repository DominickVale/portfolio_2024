import { Renderer } from '@unseenco/taxi'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/all'
import { $all, $, debounceTrailing, isMobile } from '../../utils'

export default class BaseRenderer extends Renderer {
  navLinks: HTMLAnchorElement[]
  isDesktop: boolean
  #debouncedHandleResizeFn: Function
  #onResizeBound: () => void
  static resizeHandlers: Array<() => void>
  static enterTL: gsap.core.Timeline
  initialLoad(): void {
    super.initialLoad()

    this.#debouncedHandleResizeFn = debounceTrailing(this.#handleResize.bind(this), 200)

    this.#onResizeBound = this.#onResize.bind(this)
    window.addEventListener('resize', this.#onResizeBound)

    this.navLinks = Array.from($all('nav li a')) as HTMLAnchorElement[]

    $('#sound-toggled-label').addEventListener('click', () => {
      window.app.audio.toggle()
    })

    $('#navbar').addEventListener('click', (e) => {
      const clickedEl = e.target as HTMLElement
      if (clickedEl.parentElement.classList.contains('nav-link')) {
        const audioAttr = clickedEl.getAttribute('data-text-scramble-audio')
        const params = window.app.audio.parseAudioAttributes(audioAttr)
        window.app.audio.play(null, 'vibration-click', {
          pan: params.pan,
          volume: 0.3,
        })

        this.navLinks.forEach((link) => {
          link.classList.remove('active')
        })
        clickedEl.classList.add('active')
      }
    })

    const linksTL = gsap.timeline()

    const currentUrl = window.location.href
    this.navLinks.forEach((link, i) => {
      const tl = gsap.timeline()
      tl.from(link, {
        opacity: 0,
        duration: 0.08,
        repeat: 9,
        delay: i / 8,
      })
      linksTL.add(tl, '<')
      if (link.href === currentUrl || (link.href.includes('blog') && currentUrl.includes('blog'))) {
        link.classList.add('active')
      } else {
        link.classList.remove('active')
      }
    })

    BaseRenderer.enterTL = gsap
      .timeline({
        paused: true,
        onStart: () => {
          window['navbar'].classList.remove('opacity-0')
          window['body-wrapper'].classList.remove('opacity-0')
          $('footer').classList.remove('opacity-0')
        },
      })
      .add(linksTL, '<')

    window.app.audio.setupEvents()
    if (window.app.preloaderFinished) BaseRenderer.enterTL.play()
  }

  onEnter() {
    // run after the new content has been added to the Taxi container
    // console.log('renderer onEnter')
    ScrollTrigger.normalizeScroll({ type: 'touch' })
    BaseRenderer.resizeHandlers = []
  }

  onEnterCompleted() {
    // run after the transition.onEnter has fully completed
    // console.log('renderer onEnterCompleted')
  }

  onLeave() {
    // run before the transition.onLeave method is called
    window.removeEventListener('resize', this.#onResizeBound)
    BaseRenderer.resizeHandlers = []
  }

  onLeaveCompleted() {
    // run after the transition.onleave has fully completed
  }

  /////////////////////
  //
  #onResize(...args) {
    this.#debouncedHandleResizeFn(...args)
  }

  #handleResize() {
    this.isDesktop = !isMobile()
    BaseRenderer.resizeHandlers.forEach((f) => f())
  }
}

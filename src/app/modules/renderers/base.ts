import { Renderer } from '@unseenco/taxi'
import gsap from 'gsap'
import { $all, $, debounceTrailing } from '../../utils'

export default class BaseRenderer extends Renderer {
  navLinks: HTMLAnchorElement[]
  isDesktop: boolean
  #debouncedHandleResizeFn: Function
  #onResizeBound: () => void
  static resizeHandlers: Array<() => void>
  initialLoad(): void {
    super.initialLoad()

    this.#debouncedHandleResizeFn = debounceTrailing(this.#handleResize.bind(this), 200)

    this.#onResizeBound = this.#onResize.bind(this)
    window.addEventListener('resize', this.#onResizeBound)

    this.navLinks = Array.from($all('nav li a')) as HTMLAnchorElement[]
    $('#navbar').addEventListener('click', (e) => {
      const clickedEl = e.target as HTMLElement
      if (clickedEl.parentElement.classList.contains('nav-link')) {
        this.navLinks.forEach((link) => {
          link.classList.remove('active')
        })
        clickedEl.classList.add('active')
      }
    })

    const currentUrl = window.location.href
    this.navLinks.forEach((link) => {
      if (link.href === currentUrl || (link.href.includes('blog') && currentUrl.includes('blog'))) {
        link.classList.add('active')
      } else {
        link.classList.remove('active')
      }
    })

    const enterTL = gsap
      .timeline({
        onStart: () => {
          window['navbar'].classList.remove('opacity-0')
          window['body-wrapper'].classList.remove('opacity-0')
          $('footer').classList.remove('opacity-0')
        },
        onComplete: () => {
          window.app.isTransitioning = false
        },
      })
      .from(this.navLinks, {
        opacity: 0,
        duration: 0.08,
        ease: 'elastic.in',
        stagger: {
          repeat: 10,
          each: 0.12,
        },
      })
  }
  onEnter() {
    // run after the new content has been added to the Taxi container
    // console.log('renderer onEnter')
    BaseRenderer.resizeHandlers = []
  }

  onEnterCompleted() {
    // run after the transition.onEnter has fully completed
    // console.log('renderer onEnterCompleted')
    window.app.isTransitioning = false
  }

  onLeave() {
    // run before the transition.onLeave method is called
    console.log('renderer onLeave')
    window.removeEventListener('resize', this.#onResizeBound)
    BaseRenderer.resizeHandlers = []
    window.app.isTransitioning = true
  }

  onLeaveCompleted() {
    // run after the transition.onleave has fully completed
    console.log('renderer onLeaveCompleted')
  }

  /////////////////////
  //
  #onResize(...args) {
    this.#debouncedHandleResizeFn(...args)
  }

  #handleResize() {
    this.isDesktop = window.innerWidth > 1024
    console.log('onResize', this.isDesktop)
    BaseRenderer.resizeHandlers.forEach((f) => f())
  }
}

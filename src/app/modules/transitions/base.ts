import { Transition } from '@unseenco/taxi'
import gsap from 'gsap'
import { getPageName } from 'src/app/utils'
import { getAttractorByPage } from '../animations/attractor'

export default class BaseTransition extends Transition {
  /**
   * Handle the transition leaving the previous page.
   * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onLeave({ from, trigger, done, toURL }) {
    const page = getPageName(toURL)
    const attractorTL = getAttractorByPage(page)

    const tl = gsap.timeline({ onComplete: done, paused: true })

    if (window.app.reducedMotion) {
      console.warn('Prefers-reduced-motion is enabled. Attractor animation hidden.')
      tl.to('canvas', { opacity: 0, duration: 1, ease: 'power4.inOut' })
    }
    tl.add(attractorTL).play(0)
  }

  /**
   * Handle the transition entering the next page.
   * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onEnter({ to, trigger, done, toURL }) {
    if (window.app.reducedMotion) {
      gsap.to('canvas', { opacity: 1, duration: 3, delay: 1.5, ease: 'power4.in', onComplete: done })
    } else {
      done()
    }
  }
}

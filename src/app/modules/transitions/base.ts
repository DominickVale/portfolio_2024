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

    gsap.timeline({ onComplete: done }).add(attractorTL).play(0)
  }

  /**
   * Handle the transition entering the next page.
   * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onEnter({ to, trigger, done, toURL }) {
    done()
  }
}

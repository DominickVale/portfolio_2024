import gsap from 'gsap'
import Experience from '../../gl/Experience'
import BaseTransition from './base'

export default class FromAboutTransition extends BaseTransition {
  /**
   * Handle the transition leaving the previous page.
   * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onLeave({ from, trigger, done }) {
    const experience = new Experience()

    gsap
      .timeline({ onComplete: done })
      .to('.btn, .intro-paragraph, h2, table, .fake-logs, .img-container', {
        opacity: 0,
        duration: 1,
        ease: 'power4.out',
      })
  }

  /**
   * Handle the transition entering the next page.
   * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onEnter({ to, trigger, done }) {
    done()
  }
}

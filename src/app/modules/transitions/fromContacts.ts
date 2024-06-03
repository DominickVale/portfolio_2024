import gsap from 'gsap'
import BaseTransition from './base'
import Experience from '../../gl/Experience'
import { $, $all } from '../../utils'
import ContactsRenderer from '../renderers/ContactsRenderer'

export default class FromContactsTransition extends BaseTransition {
  /**
   * Handle the transition leaving the previous page.
   * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onLeave({ from, trigger, done }) {
    const experience = new Experience()

    // const tl = gsap
    //   .timeline({
    //     onComplete: () => {
    //       tl.kill()
    //       done()
    //     },
    //   })
    gsap.set("#bg-blur", { opacity: 0 })
    ContactsRenderer.tl.duration(1).reverse().then(done)
  }

  /**
   * Handle the transition entering the next page.
   * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onEnter({ to, trigger, done }) {
    done()
  }
}

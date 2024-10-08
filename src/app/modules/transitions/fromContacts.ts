import gsap from 'gsap'
import BaseTransition from './base'
import Experience from '../../gl/Experience'
import { $, $all, getPageName } from '../../utils'
import ContactsRenderer from '../renderers/ContactsRenderer'

export default class FromContactsTransition extends BaseTransition {
  /**
   * Handle the transition leaving the previous page.
   * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onLeave({ from, trigger, done, toURL }) {
    super.onLeave({ from, trigger, done, toURL })
    const experience = new Experience()
    const page = getPageName(toURL)

    // const tl = gsap
    //   .timeline({
    //     onComplete: () => {
    //       tl.kill()
    //       done()
    //     },
    //   })
    if(page !== 'blogarticle'){
      gsap.to('#bg-blur', { opacity: 0, duration: 1, ease: 'power3.in' })
    }
    ContactsRenderer.enterTL.duration(1).reverse().then(done)
  }

  /**
   * Handle the transition entering the next page.
   * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onEnter({ to, trigger, done, toURL }) {
    super.onEnter({ to, trigger, done, toURL })
  }
}

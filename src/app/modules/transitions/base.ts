import { Transition } from '@unseenco/taxi'
import gsap from 'gsap'
import { $all } from '../../utils'

export default class BaseTransition extends Transition {
  /**
   * Handle the transition leaving the previous page.
   * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onLeave({ from, trigger, done }) {
    // const leaveTL = gsap.timeline({
    // 	onComplete: () => done(),
    // 	defaults: { duration: 0.5, ease: "power4.in" },
    // });
    done()
  }

  /**
   * Handle the transition entering the next page.
   * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onEnter({ to, trigger, done }) {
    done()
  }
}
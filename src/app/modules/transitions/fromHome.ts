
import Experience from 'src/app/gl/Experience'
import HomeRenderer from '../renderers/HomeRenderer'
import BaseTransition from './base'
import gsap from 'gsap'

export default class FromHomeTransition extends BaseTransition {
  /**
   * Handle the transition leaving the previous page.
   * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onLeave({ from, trigger, done, toURL }) {
    super.onLeave({from, trigger, done, toURL})
    HomeRenderer.enterTL.duration(1).reverse().then(done)
  }

  /**
   * Handle the transition entering the next page.
   * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onEnter({ to, trigger, done, toURL }) {
    done()
  }
}

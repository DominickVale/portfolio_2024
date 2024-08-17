import WipRenderer from '../renderers/WipRenderer'
import BaseTransition from './base'

export default class FromWIPTransition extends BaseTransition {
  /**
   * Handle the transition leaving the previous page.
   * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onLeave({ from, trigger, done, toURL }) {
    super.onLeave({from, trigger, done, toURL})
    WipRenderer.enterTL.duration(1).reverse().then(done)
  }

  /**
   * Handle the transition entering the next page.
   * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onEnter({ to, trigger, done, toURL }) {
    super.onEnter({to, trigger, done, toURL})
  }
}

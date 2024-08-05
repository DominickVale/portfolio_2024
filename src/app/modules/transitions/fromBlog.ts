import gsap from 'gsap'
import BaseTransition from './base'
import Experience from '../../gl/Experience'
import { $, $all } from '../../utils'

export default class FromBlogTransition extends BaseTransition {
  /**
   * Handle the transition leaving the previous page.
   * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onLeave({ from, trigger, done, toURL }) {
    super.onLeave({from, trigger, done, toURL})
    const experience = new Experience()
    const worksImage = experience.world.worksImage
    const renderer = experience.renderer
    const params = experience.params
    const statusItems = $all('#blog-header #blog-status li')
    const subtitle = $('#blog-header h2')
    const articles = Array.from($all('.blog-article'))

    const tl = gsap
      .timeline({
        onComplete: () => {
          worksImage.hide()
          tl.kill()
          done()
        },
      })
      .fromTo(
        articles,
        { opacity: 1 },
        {
          opacity: 0,
          duration: 0.05,
          stagger: {
            repeat: window.app.reducedMotion ? 2 : 20,
            each: 0.1,
          },
        },
      )
      .to(
        '#blog-header',
        {
          x: window.app.reducedMotion ? undefined : '-80vw',
          opacity: window.app.reducedMotion ? 0 : undefined,
          duration: 1.35,
          ease: 'power4.inOut',
        },
        '<50%',
      )
      .to(
        statusItems,
        {
          alpha: 0,
          ease: 'power4.inOut',
        },
        '<',
      )
      .to(
        subtitle,
        {
          alpha: 0,
          ease: 'power4.inOut',
        },
        '<+30%',
      )
  }

  /**
   * Handle the transition entering the next page.
   * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onEnter({ to, trigger, done, toURL }) {
    super.onEnter({to, trigger, done, toURL})
  }
}

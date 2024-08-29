import BaseTransition from './base'
import Experience from '../../gl/Experience'
import BlogArticleRenderer from '../renderers/BlogArticleRenderer'
import gsap from 'gsap'
import { getPageName } from 'src/app/utils'

export default class FromBlogArticleTransition extends BaseTransition {
  /**
   * Handle the transition leaving the previous page.
   * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onLeave({ from, trigger, done, toURL }) {
    super.onLeave({from, trigger, done, toURL})
    const experience = new Experience()
    const page = getPageName(toURL)

    // const tl = gsap
    //   .timeline({
    //     onComplete: () => {
    //       tl.kill()
    //       done()
    //     },
    //   })

    // I currently don't have time to figure why taxijs is calling this transition from blog/ to works/
    if(window.location.pathname === "/blog/") {
      done()
      return
    }

    if(page !== 'blogarticle'){
      gsap.to('#bg-blur', { opacity: 0, duration: 1, ease: 'power3.in' })
    }
    window.app.audio.muffleMusic(false)
    BlogArticleRenderer.scrollTl.kill()
    BlogArticleRenderer.contactsTl.pause().duration(1).reverse()

    BlogArticleRenderer.tl
      .pause()
      .duration(1)
      .reverse()
      .then(done)
  }

  /**
   * Handle the transition entering the next page.
   * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onEnter({ to, trigger, done, toURL}) {
    super.onEnter({to, trigger, done, toURL})
  }
}

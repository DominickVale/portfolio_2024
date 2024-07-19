
import Experience from 'src/app/gl/Experience'
import HomeRenderer from '../renderers/HomeRenderer'
import BaseTransition from './base'
import gsap from 'gsap'

export default class FromHomeTransition extends BaseTransition {
  /**
   * Handle the transition leaving the previous page.
   * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onLeave({ from, trigger, done }) {
    const experience = new Experience()
    const params = experience.params
    const attractor = experience.world.attractor

    const attractorUniformsTl = gsap.timeline()
      .add(() => {
        window.app.audio.play(null, 'whoosh-short', {
          volume: 0.1,
          rate: 0.8,
        })
      })
      .to(
        attractor.bufferMaterial.uniforms.uSigma,
        {
          value: -1,
          duration: 0.01,
          ease: 'power2.out',
        },
        '<',
      )
    .to(
      params,
      {
        speed: 70,
        duration: 0.5,
        ease: 'power2.in',
        onStart: () => {
        window.app.audio.play(null, 'shimmer-short', {
          volume: 0.08,
          rate: 0.9,
          })
        },
        onComplete: () => {
          gsap.to(params, {
            speed: 5,
            duration: 3,
            ease: 'power2.inOut',
          })
        },
      },
      '<',
    )

    HomeRenderer.enterTL.duration(1).reverse().then(done)
  }

  /**
   * Handle the transition entering the next page.
   * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onEnter({ to, trigger, done }) {
    done()
  }
}

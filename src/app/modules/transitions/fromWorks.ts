import gsap from 'gsap'
import BaseTransition from './base'
import Experience from '../../gl/Experience'

export default class FromWorkTransition extends BaseTransition {
  /**
   * Handle the transition leaving the previous page.
   * @param { { from: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onLeave({ from, trigger, done }) {
    const experience = new Experience()
    const worksImage = experience.world.worksImage
    const renderer = experience.renderer
    const params = experience.params
    const attractor = experience.world.attractor

    const attractorPosTl = gsap
      .timeline()
      .to(
        attractor.points.position,
        {
          x: params.positionX,
          y: params.positionY,
          z: params.positionZ,
          duration: 1,
          ease: 'power2.inOut',
        },
        '<',
      )
      .to(
        attractor.points.rotation,
        {
          y: params.rotationY,
          z: params.rotationZ,
          duration: 1,
          ease: 'power2.inOut',
        },
        '<',
      )
    const attractorUniformsTl = gsap
      .timeline()
      .to(
        params,
        {
          speed: 60,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            gsap.to(params, {
                speed: 5,
                duration: 3,
                ease: 'power2.inOut',
              },
            )
          },
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uSigma,
        {
          value: params.sigma + 4,
          duration: 0.01,
          ease: 'power2.inOut',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uRho,
        {
          value: params.rho - 10.29,
          duration: 0.01,
          ease: 'power2.inOut',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uBeta,
        {
          value: params.beta - 3.29,
          duration: 0.01,
          ease: 'power2.inOut',
        },
        '<',
      )

    const tl = gsap
      .timeline({
        onComplete: () => {
          worksImage.hide()
          renderer.blurPass.enabled = false
          tl.kill()
          done()
        },
      })
      .add(attractorPosTl, '<')
      .add(attractorUniformsTl, '<')
      .to(worksImage.planeMat.uniforms.uStrength, {
        value: 3,
        duration: 0.5,
        ease: 'power4.in',
      }, "<")
      .to(renderer.blurPass, {
        scale: 0.,
        duration: 0.8,
        ease: 'circ.in',
      }, "<")
      .to(
        renderer.textureEffect.blendMode.opacity,
        {
          value: 0,
          duration: 0.8,
          ease: 'circ.in',
        },
        '<',
      )
  }

  /**
   * Handle the transition entering the next page.
   * @param { { to: HTMLElement, trigger: string|HTMLElement|false, done: function } } props
   */
  onEnter({ to, trigger, done }) {
    done()
  }
}

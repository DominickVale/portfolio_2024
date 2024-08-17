import gsap from 'gsap'
import { LORENZ_PRESETS } from 'src/app/constants'
import { getZPosition } from 'src/app/utils'

export const WipPageAttractorAnim = {
  create(onComplete?: () => void) {
    const experience = window.app.experience
    const attractor = experience.world.attractor

    attractor.resetParams() //uniTL

    const uniTL = gsap
      .timeline()
      .set(experience.params, { speed: 60 })
      .to(experience.params, {
        speed: LORENZ_PRESETS['default'].speed,
        duration: 3,
        ease: 'attractor_speed',
      })
      .to(
        attractor.bufferMaterial.uniforms.uSigma,
        {
          value: 34.992,
          duration: 0.01,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uRho,
        {
          value: 100,
          duration: 0.01,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uBeta,
        {
          value: 1.284,
          duration: 0.01,
          ease: 'power2.out',
        },
        '<',
      )

    const posTL = gsap
      .timeline()
      .to(
        attractor.points.position,
        {
          x: 50,
          y: 50,
          z: -50,
          duration: 1,
          ease: 'power2.inOut',
        },
        '<',
      )
      .to(
        attractor.points.rotation,
        {
          x: 0.358141562509236,
          y: -1.33831847042925,
          z: 1.82840692438926,
          duration: 1,
          ease: 'power2.inOut',
        },
        '<',
      )

    return gsap
      .timeline({ onComplete, paused: true })
      .add(() => {
        window.app.audio.play(null, 'shimmer-short', {
          volume: 0.04,
          rate: 0.6,
        })
        window.app.audio.play(null, 'whoosh-short', {
          volume: 0.3,
        })
        window.app.audio.play('shimmer-home', 'shimmer-medium', {
          volume: 0.15,
          rate: 1.5,
        })
      })
      .add(uniTL)
      .add(posTL, '<')
  },
}

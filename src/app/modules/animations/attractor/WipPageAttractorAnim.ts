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
      .set(experience.params, { speed: 25 })
      .to(experience.params, {
        speed: LORENZ_PRESETS['default'].speed - 2,
        duration: 6,
        ease: 'sine.in',
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
          x: 29.1,
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
          x: 0.420973415581032,
          y: -1.03044239037745,
          z: 1.98548655706875,
          duration: 1,
          ease: 'power2.inOut',
        },
        '<',
      )

    return gsap
      .timeline({ onComplete, paused: true })
      .add(() => {
        window.app.audio.play(null, 'shimmer-short', {
          volume: 0.35,
        })
        window.app.audio.play(null, 'whoosh-short', {
          volume: 0.3,
        })
        window.app.audio.play('shimmer-home', 'shimmer-medium', {
          volume: 0.25,
          rate: 1.5,
        })
      })
      .add(uniTL)
      .add(posTL, '<')
  },
}

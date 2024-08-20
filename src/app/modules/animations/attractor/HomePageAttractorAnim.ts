import gsap from 'gsap'
import { LORENZ_PRESETS } from 'src/app/constants'
import { getZPosition } from 'src/app/utils'

export const HomePageAttractorAnim = {
  create(onComplete?: () => void) {
    const experience = window.app.experience
    const attractor = experience.world.attractor

    const uniTL = gsap
      .timeline()
      .set(experience.params, { speed: 60 })
      .add(() => {
        window.app.audio.play(null, 'shimmer-long', {
          volume: 0.1,
          rate: 0.6,
        })
        window.app.audio.play(null, 'whoosh-short', {
          volume: 0.3,
        })
        setTimeout(() => {
           window.app.audio.play('shimmer-home', 'shimmer-medium', {
            volume: 0.15,
            rate: 1.5
          })
        }, 850)
      })
      .to(experience.params, {
        speed: LORENZ_PRESETS['default'].speed,
        duration: 8,
        ease: 'sine.in',
      })
      .to(
        attractor.bufferMaterial.uniforms.uSigma,
        {
          value: experience.params.sigma,
          duration: 0.8,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uRho,
        {
          value: experience.params.rho,
          duration: 0.8,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uBeta,
        {
          value: experience.params.beta,
          duration: 0.8,
          ease: 'power2.out',
        },
        '<',
      )

    const posTL = gsap
      .timeline()
      .to(
        attractor.points.position,
        {
          x: experience.params.positionX,
          y: experience.params.positionY,
          z: getZPosition(),
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )
      .to(
        attractor.points.rotation,
        {
          x: experience.params.rotationX,
          y: experience.params.rotationY,
          z: experience.params.rotationZ,
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )

    return gsap
      .timeline({ onComplete, paused: true, onStart: () => console.log('Starting home attractor') })
      .add(uniTL)
      .add(posTL, '<')
  },
}

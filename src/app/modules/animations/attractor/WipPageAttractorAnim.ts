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
      .to(
        experience.params,
        {
          speed: LORENZ_PRESETS['default'].speed,
          duration: 3,
          ease: 'attractor_speed'
        },
      )
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
          x: experience.params.positionX,
          y: experience.params.positionY,
          z: getZPosition(),
          duration: 1,
          ease: 'power2.inOut',
        },
        '<',
      )
      .to(
        attractor.points.rotation,
        {
          x: experience.params.rotationX,
          z: experience.params.rotationZ,
          duration: 1,
          ease: 'power2.inOut',
        },
        '<',
      )

    return gsap
      .timeline({ onComplete, paused: true, onStart: () => console.log('Starting wip attractor') })
      .add(uniTL)
      .add(posTL)
  },
}


import gsap from 'gsap'
import { LORENZ_PRESETS } from 'src/app/constants'
import { getZPosition } from 'src/app/utils'

export const ContactsPageAttractorAnim = {
  create(onComplete?: () => void) {
    const experience = window.app.experience
    const attractor = experience.world.attractor

    attractor.resetParams() //uniTL

    const uniTL = gsap
      .timeline()
      .set(experience.params, { speed: 50 })
      .to(
        experience.params,
        {
          speed: LORENZ_PRESETS['default'].speed,
          duration: 1.5,
          ease: 'power4.inOut',
        },
      )
      .to(
        attractor.bufferMaterial.uniforms.uSigma,
        {
          value: 100.992,
          duration: 0.01,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uRho,
        {
          value: 60,
          duration: 0.01,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uBeta,
        {
          value: 10.284,
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
          z: -45,
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
      .timeline({ onComplete, paused: true, onStart: () => console.log('Starting contact attractor') })
      .add(uniTL)
      .add(posTL)
      .to(
        experience.params,
        {
          speed: LORENZ_PRESETS['default'].speed,
          duration: 1.5,
          ease: 'power4.inOut',
        },
      )
  },
}

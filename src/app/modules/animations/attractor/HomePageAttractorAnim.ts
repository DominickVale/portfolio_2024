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
      .to(
        experience.params,
        {
          speed: LORENZ_PRESETS['default'].speed,
          duration: 2,
          ease: 'attractor_speed'
        },
      )
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
      .add(() => {
        window.app.audio.play(null, 'whoosh-short', {
          volume: 0.1,
          rate: 0.8,
        })
      })
      .to(
        experience.params,
        {
          speed: 70,
          duration: 0.1,
          onComplete: () => {
            gsap.to(experience.params, {
              speed: LORENZ_PRESETS['default'].speed,
              duration: 3,
              ease: 'power2.in',
            })
          },
        },
        '<',
      )
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
        y: experience.params.rotationY,
        z: experience.params.rotationZ,
        duration: 1,
        ease: 'power2.inOut',
      },
      '<',
    )

    return gsap
      .timeline({ onComplete, paused: true, onStart: () => console.log('Starting home attractor') })
      .add(uniTL)
      .add(posTL, "<+45%")
  },
}

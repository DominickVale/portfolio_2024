import gsap from 'gsap'
import { LORENZ_PRESETS } from 'src/app/constants'

export const UnknownPageAttractorAnim = {
  create(onComplete?: () => void) {
    const experience = window.app.experience
    const attractor = experience.world.attractor

    const uniTL = gsap
      .timeline()
      .set(experience.params, { speed: 50 })
      .to(experience.params, {
        speed: 15,
        duration: 1.5,
        ease: 'power4.inOut',
      })
      .to(
        attractor.bufferMaterial.uniforms.uSigma,
        {
          value: 98.712,
          duration: 0.01,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uRho,
        {
          value: 68,
          duration: 0.01,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uBeta,
        {
          value: -3.288,
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
          x: 0.8,
          y: 4.5,
          z: 8.2,
          duration: 1,
          ease: 'power2.inOut',
        },
        '<',
      )
      .to(
        attractor.points.rotation,
        {
          x: 1.8035,
          y: 3.1937,
          z: 5.2019,
          duration: 1,
          ease: 'power2.inOut',
        },
        '<',
      )

    return gsap
      .timeline({ onComplete, paused: true })
      .to(experience.renderer.chromaticAberrationEffect.offset, {
        x: '-0.0018',
        y: '0.0025',
        duration: 0.8,
      })
      .add(() => {
        window.app.audio.play(null, 'shimmer-long', {
          volume: 0.04,
        })
        window.app.audio.play(null, 'whoosh-short', {
          volume: 0.2,
          rate: 1.4,
        })
      })
      .add(uniTL, "<")
      .add(posTL, "<")
      .to(experience.renderer.chromaticAberrationEffect.offset, {
        x: 0,
        y: 0,
        duration: 4,
      })
  },
}

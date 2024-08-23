import gsap from 'gsap'
import { isMobile } from 'src/app/utils'

export const AboutPageAttractorAnim = {
  create(onComplete?: () => void) {
    const experience = window.app.experience
    const attractor = experience.world.attractor
    const isDesktop = !isMobile()

    const uniTL = gsap
      .timeline()
      .to(
        experience.params,
        {
          speed: 60,
          duration: 0.2,
          ease: 'power4.inOut',
          onComplete: () => {
            gsap.to(experience.params, {
              speed: 10,
              duration: 2.5,
              ease: 'power2.in',
            })
          },
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uSigma,
        {
          value: -8,
          duration: 0.5,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uRho,
        {
          value: 9,
          duration: 0.1,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uBeta,
        {
          value: 6,
          duration: 0.1,
          ease: 'power2.out',
        },
        '<',
      )
      .to(attractor.bufferMaterial.uniforms.uSigma, {
        value: 5,
        duration: 0.085,
      })
      .to(attractor.bufferMaterial.uniforms.uSigma, {
        value: -15,
        duration: 0.1,
      })

    const posTL = gsap
      .timeline()
      .to(
        attractor.points.position,
        {
          x: isDesktop ? 0.5 : 0.8,
          y: -23,
          z: isDesktop ? -30 : -40,
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )
      .to(
        attractor.points.rotation,
        {
          x: 0,
          y: isDesktop ? 0 : -0.0251327412287183,
          z: 0,
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )

    return gsap
      .timeline({ onComplete, paused: true })
      .to(experience.renderer.chromaticAberrationEffect.offset, {
        x: '-0.002',
        y: '0.002',
        duration: 0.8,
      })
      .add(() => {
        window.app.audio.play(null, 'shimmer-long', {
          volume: 0.2,
          rate: 1,
        })
        window.app.audio.play(null, 'whoosh-short', {
          volume: 0.3,
        })
      })
      .add(uniTL, "<")
      .add(posTL, '<+20%')
      .to(experience.renderer.chromaticAberrationEffect.offset, {
        x: 0,
        y: 0,
        duration: 4,
      })
  },
}

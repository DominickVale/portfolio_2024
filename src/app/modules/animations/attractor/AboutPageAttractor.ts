import gsap from 'gsap'
import { isMobile } from 'src/app/utils'

export const AboutPageAttractorAnim = {
  create(variant: 'main' | 'other', onComplete?: () => void) {
    const experience = window.app.experience
    const attractor = experience.world.attractor
    const isDesktop = !isMobile()

    const otherTL = gsap
      .timeline({ paused: true })
      .to(
        experience.params,
        {
          speed: 50,
          duration: 1.2,
          ease: 'power4.inOut',
          onComplete: () => {
            gsap.to(experience.params, {
              speed: 5,
              duration: 1.5,
              ease: 'power2.in',
            })
          },
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uSigma,
        {
          value: -10,
          duration: 0.8,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uRho,
        {
          value: 31.2,
          duration: 0.8,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uBeta,
        {
          value: 0.7,
          duration: 0.8,
          ease: 'power2.out',
        },
        '<',
      )

    const mainTL = gsap
      .timeline({ paused: true })
      .to(
        experience.params,
        {
          speed: 60,
          duration: 0.2,
          ease: 'power4.inOut',
          onComplete: () => {
            gsap.to(experience.params, {
              speed: isDesktop ? 10 : 30,
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

    const basePosTL = gsap
      .timeline()
      .to(
        attractor.points.position,
        {
          // y: this.isIndexPage ? -21 : -31.5, @TODO: fix
          x: isDesktop ? 0.5 : 0.8,
          y: -23,
          z: isDesktop ? -30 : -5,
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
      .timeline({ onComplete, paused: true, onStart: () => console.log('Starting about attractor') })
      .add(variant === 'main' ? mainTL.paused(false) : otherTL.paused(false), '<')
      .add(basePosTL, '<+20%')
  },
}

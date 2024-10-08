import gsap from 'gsap'
import { isMobile } from 'src/app/utils'

export const WhatidoPageAttractorAnim = {
  create(onComplete?: () => void) {
    const experience = window.app.experience
    const attractor = experience.world.attractor
    const isDesktop = !isMobile()

    const uniTL = gsap
      .timeline()
      .to(
        experience.params,
        {
          speed: 70,
          duration: 0.2,
          ease: 'power4.inOut',
          onComplete: () => {
            gsap.to(experience.params, {
              speed: isDesktop ? 20 : 30,
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
          value: 10,
          duration: 0.1,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uRho,
        {
          value: 38.6,
          duration: 0.8,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uBeta,
        {
          value: -1.08,
          duration: 0.8,
          ease: 'power2.out',
        },
        '<',
      )
      .to(experience.params, {
        speed: isDesktop ? 10 : 10,
        duration: 5,
        ease: 'power2.in',
      })

    const posTL = gsap
      .timeline()
      .to(
        attractor.points.position,
        {
          x: 0.5,
          y: this.isDesktop ? 44 : 46,
          z: -17.6,
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )
      .to(
        attractor.points.rotation,
        {
          x: 1.649,
          y: 0.0027,
          z: -1.1686724671354,
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )

    return gsap
      .timeline({ onComplete, paused: true })
      .add(() => {
        window.app.audio.play(null, 'shimmer-long', {
          volume: 0.1,
          rate: 1.35,
        })
        window.app.audio.play(null, 'whoosh-short', {
          volume: 0.3,
        })
        setTimeout(() => {
          window.app.audio.play(null, 'shimmer-short', {
            volume: 0.35,
            rate: 0.9,
          })
        }, 2000)
      })
      .add(uniTL)
      .add(posTL, '<+20%')
  },
}

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
          x: 0,
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
          x: 1.59592906802361,
          y: 0.0125663706143592,
          z: -1.1686724671354,
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )

    return gsap
      .timeline({ onComplete, paused: true, onStart: () => console.log('Starting about attractor') })
      .add(uniTL)
      .add(posTL, '<+20%')
  },
}

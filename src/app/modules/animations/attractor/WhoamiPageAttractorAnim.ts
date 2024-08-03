
import gsap from 'gsap'
import { isMobile } from 'src/app/utils'

export const WhoamiPageAttractorAnim = {
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
          value: -3.564,
          duration: 0.1,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uRho,
        {
          value: 11.4,
          duration: 0.8,
          ease: 'power2.out',
        },
        '<',
      )
      .to(
        attractor.bufferMaterial.uniforms.uBeta,
        {
          value: 2.604,
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
          x: isDesktop ? -0.4 : 0.8,
          y: isDesktop ? 30.3 : 40,
          z: isDesktop ? -20.1 : -40,
          duration: 2,
          ease: 'power2.inOut',
        },
        '<',
      )
      .to(
        attractor.points.rotation,
        {
          x: -1.18123883774976,
          y: isDesktop ? -0.0251327412287183 : -0.0251327412287183,
          z: -0.333008821280518,
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
